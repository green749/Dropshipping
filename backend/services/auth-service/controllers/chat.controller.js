import { Op, Sequelize } from 'sequelize';
import { User, ChatMessage, USER_ROLES } from '../models/index.js';
import { Dealer, BusinessDealer, DealerInvitation } from '../../business-dealer-service/models/index.js';
import { sendSuccess, sendError } from '../../shared/utils/apiResponse.js';
import { checkUserBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';
import { isAlexanderAdmin, isCommunicationAllowed, getAlexanderAdminUser } from '../utils/chatAuth.js';

export const chatController = {
  /**
   * Get contacts list based on user role and selected business:
   * - Alexander (Admin): Can see Dealers, Digital Marketers, and Sales Representatives
   * - Dealer, Sales, Digital Marketer: Can ONLY see Alexander (Admin)
   */
  getContacts: async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const isUserAdmin = isAlexanderAdmin(req.user);
      const rawBusinessId = req.query.business_id || req.headers['x-business-id'] || null;
      const isValidBusinessId =
        rawBusinessId &&
        rawBusinessId !== 'all' &&
        rawBusinessId !== 'null' &&
        rawBusinessId !== 'undefined';
      const businessId = isValidBusinessId ? rawBusinessId : null;

      let targetPartners = [];

      if (isUserAdmin) {
        // Alexander Admin view: filter to permitted partner roles ONLY
        const allowedRoles = [USER_ROLES.DEALER, USER_ROLES.SALES, USER_ROLES.MARKETING];

        if (businessId) {
          // 1. Fetch dealers linked to this business
          const businessDealers = await BusinessDealer.findAll({
            where: {
              business_id: businessId,
              status: 'ACTIVE',
            },
            attributes: ['dealer_id'],
          });
          const dealerIds = businessDealers.map((bd) => bd.dealer_id);

          const dealers =
            dealerIds.length > 0
              ? await Dealer.findAll({
                  where: {
                    id: { [Op.in]: dealerIds },
                    status: 'ACTIVE',
                  },
                  attributes: ['id', 'user_id', 'company_name', 'contact_name', 'email'],
                })
              : [];

          // 2. Fetch invited team members for this business
          const invites = await DealerInvitation.findAll({
            where: {
              business_id: businessId,
              status: { [Op.ne]: 'CANCELLED' },
            },
            attributes: ['email', 'role', 'company_name'],
          });

          const allowedUserIds = dealers.map((d) => d.user_id).filter(Boolean);
          const allowedEmails = [
            ...dealers.map((d) => (d.email || '').toLowerCase().trim()).filter(Boolean),
            ...invites.map((inv) => (inv.email || '').toLowerCase().trim()).filter(Boolean),
          ];

          targetPartners = await User.findAll({
            where: {
              id: { [Op.ne]: currentUserId },
              is_active: true,
              role: { [Op.in]: allowedRoles },
              ...(allowedUserIds.length > 0 || allowedEmails.length > 0
                ? {
                    [Op.or]: [
                      ...(allowedUserIds.length > 0 ? [{ id: { [Op.in]: allowedUserIds } }] : []),
                      ...(allowedEmails.length > 0
                        ? [
                            Sequelize.where(
                              Sequelize.fn('LOWER', Sequelize.col('email')),
                              { [Op.in]: allowedEmails }
                            ),
                          ]
                        : []),
                    ],
                  }
                : { id: null }),
            },
            attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
            order: [['name', 'ASC']],
          });

          // Build company map
          const companyMap = new Map();
          dealers.forEach((d) => {
            if (d.user_id) companyMap.set(d.user_id, d.company_name);
            if (d.email) companyMap.set(d.email.toLowerCase(), d.company_name);
          });
          invites.forEach((inv) => {
            if (inv.email && inv.company_name) companyMap.set(inv.email.toLowerCase(), inv.company_name);
          });

          targetPartners = targetPartners.map((u) => {
            const plain = u.toJSON ? u.toJSON() : u;
            return {
              ...plain,
              company_name: companyMap.get(plain.id) || companyMap.get((plain.email || '').toLowerCase()) || null,
            };
          });
        } else {
          // All businesses scope: fetch active Dealers, Sales, Marketing members
          targetPartners = await User.findAll({
            where: {
              id: { [Op.ne]: currentUserId },
              is_active: true,
              role: { [Op.in]: allowedRoles },
            },
            attributes: ['id', 'name', 'email', 'role', 'is_active', 'created_at'],
            order: [['name', 'ASC']],
          });
        }
      } else {
        // Non-admin (Dealer, Sales, Digital Marketer): Return ONLY Alexander Admin!
        const alexanderAdmin = await getAlexanderAdminUser();
        if (alexanderAdmin && alexanderAdmin.id !== currentUserId) {
          targetPartners = [alexanderAdmin];
        } else {
          targetPartners = [];
        }
      }

      // Deduplicate partners by ID and exclude current user
      const partnerMap = new Map();
      targetPartners.forEach((p) => {
        if (p.id && p.id !== currentUserId && !partnerMap.has(p.id)) {
          partnerMap.set(p.id, p);
        }
      });
      const uniquePartners = Array.from(partnerMap.values());

      // For each partner, get latest message (direct or broadcast) and unread count
      const contacts = await Promise.all(
        uniquePartners.map(async (partner) => {
          const isPartnerAdmin = isAlexanderAdmin(partner);

          const directConditions = [
            {
              sender_id: currentUserId,
              receiver_id: partner.id,
              ...(businessId ? { business_id: businessId } : {}),
            },
            {
              sender_id: partner.id,
              receiver_id: currentUserId,
              ...(businessId ? { business_id: businessId } : {}),
            },
          ];

          const broadcastConditions = [];
          if (isPartnerAdmin) {
            broadcastConditions.push({
              sender_id: partner.id,
              receiver_id: null,
              message_type: 'BROADCAST',
              [Op.or]: [{ target_role: 'ALL' }, { target_role: req.user.role }],
              ...(businessId ? { business_id: businessId } : {}),
            });
          } else if (isUserAdmin) {
            broadcastConditions.push({
              sender_id: currentUserId,
              receiver_id: null,
              message_type: 'BROADCAST',
              [Op.or]: [{ target_role: 'ALL' }, { target_role: partner.role }],
              ...(businessId ? { business_id: businessId } : {}),
            });
          }

          const lastMessage = await ChatMessage.findOne({
            where: {
              [Op.or]: [...directConditions, ...broadcastConditions],
            },
            order: [['created_at', 'DESC']],
          });

          const unreadCount = await ChatMessage.count({
            where: {
              sender_id: partner.id,
              receiver_id: currentUserId,
              is_read: false,
              ...(businessId ? { business_id: businessId } : {}),
            },
          });

          return {
            id: partner.id,
            name: partner.name || (isPartnerAdmin ? 'Alexander (Admin)' : partner.email),
            email: partner.email,
            role: partner.role,
            is_active: partner.is_active,
            company_name: partner.company_name || null,
            isPlatformAdmin: isPartnerAdmin,
            lastMessage: lastMessage
              ? {
                  id: lastMessage.id,
                  content:
                    lastMessage.message_type === 'BROADCAST'
                      ? `📢 ${lastMessage.content}`
                      : lastMessage.content,
                  created_at: lastMessage.created_at,
                  sender_id: lastMessage.sender_id,
                  is_read: lastMessage.is_read,
                }
              : null,
            unreadCount,
          };
        })
      );

      // Sort contacts: newest active message first, then alphabetically
      contacts.sort((a, b) => {
        if (a.lastMessage && b.lastMessage) {
          return new Date(b.lastMessage.created_at).getTime() - new Date(a.lastMessage.created_at).getTime();
        }
        if (a.lastMessage) return -1;
        if (b.lastMessage) return 1;
        return a.name.localeCompare(b.name);
      });

      return sendSuccess(res, 'Chat contacts fetched successfully', contacts);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get message history with a partner (enforces server-side authorization)
   */
  getMessages: async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const { partnerId } = req.params;
      const rawBusinessId = req.query.business_id || req.headers['x-business-id'] || null;
      const isValidBusinessId =
        rawBusinessId &&
        rawBusinessId !== 'all' &&
        rawBusinessId !== 'null' &&
        rawBusinessId !== 'undefined';
      const businessId = isValidBusinessId ? rawBusinessId : null;

      const partner = await User.findByPk(partnerId, {
        attributes: ['id', 'name', 'email', 'role', 'is_active'],
      });

      if (!partner) {
        return sendError(res, 'User not found', [], 404);
      }

      // 🔒 STRICT BACKEND AUTHORIZATION CHECK
      if (!isCommunicationAllowed(req.user, partner)) {
        return sendError(
          res,
          'Forbidden: Communication is strictly limited to Alexander (Admin) and authorized roles.',
          [],
          403
        );
      }

      const directConditions = [
        {
          sender_id: currentUserId,
          receiver_id: partnerId,
          ...(businessId ? { business_id: businessId } : {}),
        },
        {
          sender_id: partnerId,
          receiver_id: currentUserId,
          ...(businessId ? { business_id: businessId } : {}),
        },
      ];

      const broadcastConditions = [];
      if (isAlexanderAdmin(partner)) {
        broadcastConditions.push({
          sender_id: partner.id,
          receiver_id: null,
          message_type: 'BROADCAST',
          [Op.or]: [{ target_role: 'ALL' }, { target_role: req.user.role }],
          ...(businessId ? { business_id: businessId } : {}),
        });
      } else if (isAlexanderAdmin(req.user)) {
        broadcastConditions.push({
          sender_id: currentUserId,
          receiver_id: null,
          message_type: 'BROADCAST',
          [Op.or]: [{ target_role: 'ALL' }, { target_role: partner.role }],
          ...(businessId ? { business_id: businessId } : {}),
        });
      }

      const messages = await ChatMessage.findAll({
        where: {
          [Op.or]: [...directConditions, ...broadcastConditions],
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'name', 'email', 'role'],
          },
          {
            model: User,
            as: 'receiver',
            attributes: ['id', 'name', 'email', 'role'],
          },
        ],
        order: [['created_at', 'ASC']],
        limit: 200,
      });

      // Automatically mark received messages as read
      await ChatMessage.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            sender_id: partnerId,
            receiver_id: currentUserId,
            is_read: false,
            ...(businessId ? { business_id: businessId } : {}),
          },
        }
      );

      return sendSuccess(res, 'Messages retrieved successfully', {
        partner,
        messages,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send a chat message (enforces server-side authorization)
   */
  sendMessage: async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const { receiver_id, receiverId, content, attachment_url, attachmentUrl, business_id, businessId } = req.body;
      const targetReceiverId = receiver_id || receiverId;
      const finalContent = content?.trim();
      const finalAttachment = attachment_url || attachmentUrl || null;
      const rawBusinessId = business_id || businessId || req.headers['x-business-id'] || null;
      const isValidBusinessId =
        rawBusinessId &&
        rawBusinessId !== 'all' &&
        rawBusinessId !== 'null' &&
        rawBusinessId !== 'undefined';
      const finalBusinessId = isValidBusinessId ? rawBusinessId : null;

      if (!targetReceiverId) {
        return sendError(res, 'Recipient receiver_id is required', [], 400);
      }
      if (!finalContent) {
        return sendError(res, 'Message content cannot be empty', [], 400);
      }

      const receiver = await User.findByPk(targetReceiverId, {
        attributes: ['id', 'name', 'email', 'role', 'is_active'],
      });

      if (!receiver) {
        return sendError(res, 'Recipient user not found', [], 404);
      }

      // 🔒 STRICT BACKEND AUTHORIZATION CHECK
      if (!isCommunicationAllowed(req.user, receiver)) {
        return sendError(
          res,
          'Forbidden: You are not allowed to message this user.',
          [],
          403
        );
      }

      if (finalBusinessId) {
        const hasSenderAccess = await checkUserBusinessAccess(req.user, finalBusinessId);
        if (!hasSenderAccess) {
          return sendError(res, 'Unauthorized: Sender does not have access to this business', [], 403);
        }
      }

      const message = await ChatMessage.create({
        sender_id: currentUserId,
        receiver_id: receiver.id,
        business_id: finalBusinessId,
        content: finalContent,
        attachment_url: finalAttachment,
        message_type: 'DIRECT',
        is_read: false,
      });

      const populatedMessage = await ChatMessage.findByPk(message.id, {
        include: [
          { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] },
          { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role'] },
        ],
      });

      return sendSuccess(res, 'Message sent successfully', populatedMessage, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Send broadcast announcement (Alexander Admin only)
   */
  sendBroadcast: async (req, res, next) => {
    try {
      if (!isAlexanderAdmin(req.user)) {
        return sendError(res, 'Forbidden: Only Admin Alexander can dispatch broadcast announcements', [], 403);
      }

      const { content, target_role, targetRole, attachment_url, attachmentUrl, business_id, businessId } = req.body;
      const finalContent = content?.trim();
      const finalTargetRole = target_role || targetRole || 'ALL';
      const finalAttachment = attachment_url || attachmentUrl || null;
      const rawBusinessId = business_id || businessId || req.headers['x-business-id'] || null;
      const isValidBusinessId =
        rawBusinessId &&
        rawBusinessId !== 'all' &&
        rawBusinessId !== 'null' &&
        rawBusinessId !== 'undefined';
      const finalBusinessId = isValidBusinessId ? rawBusinessId : null;

      if (!finalContent) {
        return sendError(res, 'Broadcast announcement content cannot be empty', [], 400);
      }

      const broadcastMessage = await ChatMessage.create({
        sender_id: req.user.id,
        receiver_id: null,
        business_id: finalBusinessId,
        content: finalContent,
        attachment_url: finalAttachment,
        message_type: 'BROADCAST',
        target_role: finalTargetRole,
        is_read: false,
      });

      const populated = await ChatMessage.findByPk(broadcastMessage.id, {
        include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] }],
      });

      return sendSuccess(res, 'Broadcast announcement dispatched', populated, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mark messages as read from a partner
   */
  markAsRead: async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const { partnerId } = req.params;
      const rawBusinessId = req.query.business_id || req.body.business_id || req.headers['x-business-id'] || null;
      const isValidBusinessId =
        rawBusinessId &&
        rawBusinessId !== 'all' &&
        rawBusinessId !== 'null' &&
        rawBusinessId !== 'undefined';
      const businessId = isValidBusinessId ? rawBusinessId : null;

      const partner = await User.findByPk(partnerId, { attributes: ['id', 'role'] });
      if (!partner || !isCommunicationAllowed(req.user, partner)) {
        return sendError(res, 'Forbidden: Unauthorized to mark messages as read for this partner', [], 403);
      }

      const [updatedCount] = await ChatMessage.update(
        { is_read: true, read_at: new Date() },
        {
          where: {
            sender_id: partnerId,
            receiver_id: currentUserId,
            is_read: false,
            ...(businessId ? { business_id: businessId } : {}),
          },
        }
      );

      return sendSuccess(res, 'Messages marked as read', { updatedCount });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get total unread messages count for current user
   */
  getUnreadCount: async (req, res, next) => {
    try {
      const currentUserId = req.user.id;
      const rawBusinessId = req.query.business_id || req.headers['x-business-id'] || null;
      const isValidBusinessId =
        rawBusinessId &&
        rawBusinessId !== 'all' &&
        rawBusinessId !== 'null' &&
        rawBusinessId !== 'undefined';
      const businessId = isValidBusinessId ? rawBusinessId : null;

      let unreadCount = 0;

      if (isAlexanderAdmin(req.user)) {
        // Admin Alexander: count unread messages from allowed partner roles
        const allowedSenders = await User.findAll({
          where: {
            role: { [Op.in]: [USER_ROLES.DEALER, USER_ROLES.SALES, USER_ROLES.MARKETING] },
            is_active: true,
          },
          attributes: ['id'],
        });
        const senderIds = allowedSenders.map((u) => u.id);

        if (senderIds.length > 0) {
          unreadCount = await ChatMessage.count({
            where: {
              receiver_id: currentUserId,
              sender_id: { [Op.in]: senderIds },
              is_read: false,
              ...(businessId ? { business_id: businessId } : {}),
            },
          });
        }
      } else {
        // Non-admin (Dealer, Sales, Marketing): count unread messages strictly from Alexander Admin
        const alexanderAdmin = await getAlexanderAdminUser();
        if (alexanderAdmin) {
          unreadCount = await ChatMessage.count({
            where: {
              receiver_id: currentUserId,
              sender_id: alexanderAdmin.id,
              is_read: false,
              ...(businessId ? { business_id: businessId } : {}),
            },
          });
        }
      }

      return sendSuccess(res, 'Unread count retrieved', { unreadCount });
    } catch (error) {
      next(error);
    }
  },
};
