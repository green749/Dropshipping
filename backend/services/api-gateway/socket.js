import { Server } from 'socket.io';
import { verifyToken } from '../shared/utils/jwt.js';
import { corsOptions } from '../shared/config/cors.js';
import { User, ChatMessage, Notification } from '../auth-service/models/index.js';
import { checkUserBusinessAccess } from '../shared/middlewares/businessAuth.middleware.js';
import { isAlexanderAdmin, isCommunicationAllowed } from '../auth-service/utils/chatAuth.js';

// Active connected users map: userId -> Set of socketIds
const connectedUsers = new Map();

export const setupWebSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT Authentication Middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      let token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '') ||
        socket.handshake.query?.token;

      if (!token && socket.handshake.headers?.cookie) {
        const cookies = socket.handshake.headers.cookie.split(';');
        for (const cookie of cookies) {
          const [name, val] = cookie.trim().split('=');
          if (name === 'token' || name === 'accessToken') {
            token = decodeURIComponent(val);
            break;
          }
        }
      }

      if (!token) {
        console.warn('⚠️ [WS Auth] No token provided in handshake');
        return next(new Error('Authentication error: Token required for WebSocket connection'));
      }

      const decoded = verifyToken(token);
      if (!decoded || !decoded.id) {
        console.warn('⚠️ [WS Auth] Token verification failed');
        return next(new Error('Authentication error: Invalid or expired token'));
      }

      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role', 'is_active'],
      });

      if (!user || !user.is_active) {
        console.warn(`⚠️ [WS Auth] User ${decoded.id} inactive or not found`);
        return next(new Error('Authentication error: User inactive or not found'));
      }

      socket.user = {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role,
      };

      next();
    } catch (err) {
      console.error('Socket authentication failed:', err.message);
      return next(new Error('Authentication failed: ' + err.message));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    console.log(`🔌 [WS] User connected: ${user.name} (${user.role}) - User ID: ${user.id} - Socket ID: ${socket.id}`);

    // Track active connection
    if (!connectedUsers.has(user.id)) {
      connectedUsers.set(user.id, new Set());
    }
    connectedUsers.get(user.id).add(socket.id);

    // Join personal room & role-specific room
    socket.join(`user:${user.id}`);
    socket.join(`role:${user.role}`);

    // Broadcast online status to all connected users
    const getOnlineUserIds = () => Array.from(connectedUsers.keys());
    io.emit('online_users', getOnlineUserIds());

    /**
     * Join Business Room
     */
    socket.on('join_business', async ({ businessId }, callback) => {
      try {
        if (!businessId || businessId === 'all') {
          if (callback) callback({ success: true });
          return;
        }

        const hasAccess = await checkUserBusinessAccess(user, businessId);
        if (!hasAccess) {
          const errMsg = 'Unauthorized to join business socket room';
          console.warn(`⚠️ [WS] User ${user.id} denied access to business room ${businessId}`);
          if (callback) callback({ error: errMsg });
          return;
        }

        socket.join(`business:${businessId}`);
        socket.join(`business:${businessId}:role:${user.role}`);
        socket.join(`business:${businessId}:user:${user.id}`);

        console.log(`🏢 [WS] User ${user.name} joined rooms for business ${businessId}`);
        if (callback) callback({ success: true, businessId });
      } catch (err) {
        console.error('Error in join_business socket event:', err);
        if (callback) callback({ error: err.message });
      }
    });

    /**
     * Leave Business Room
     */
    socket.on('leave_business', ({ businessId }, callback) => {
      try {
        if (businessId && businessId !== 'all') {
          socket.leave(`business:${businessId}`);
          socket.leave(`business:${businessId}:role:${user.role}`);
          socket.leave(`business:${businessId}:user:${user.id}`);
          console.log(`🚪 [WS] User ${user.name} left rooms for business ${businessId}`);
        }
        if (callback) callback({ success: true });
      } catch (err) {
        console.error('Error in leave_business socket event:', err);
        if (callback) callback({ error: err.message });
      }
    });

    /**
     * Send Real-Time Direct Message
     */
    socket.on('send_message', async (data, callback) => {
      try {
        const receiverId = data.receiverId || data.receiver_id;
        const content = data.content;
        const attachmentUrl = data.attachmentUrl || data.attachment_url || null;
        const rawBusinessId = data.businessId || data.business_id || null;
        const isValidBusinessId =
          rawBusinessId &&
          rawBusinessId !== 'all' &&
          rawBusinessId !== 'null' &&
          rawBusinessId !== 'undefined';
        const businessId = isValidBusinessId ? rawBusinessId : null;

        if (!receiverId || !content || !content.trim()) {
          if (callback) callback({ error: 'Receiver ID and content are required' });
          return;
        }

        const receiver = await User.findByPk(receiverId, {
          attributes: ['id', 'name', 'email', 'role'],
        });

        if (!receiver) {
          if (callback) callback({ error: 'Recipient user not found' });
          return;
        }

        // 🔒 Role-Based Communication Rule Enforcement:
        // Alexander (Admin) ↕ Dealer | Sales | Digital Marketer
        // ALL OTHER PAIRS BLOCKED (Dealer↔Sales, Dealer↔Marketer, Sales↔Marketer, etc.)
        const isAllowed = isCommunicationAllowed(user, receiver);

        if (!isAllowed) {
          const errMsg = 'You are not allowed to message this user.';
          socket.emit('message_error', { message: errMsg });
          socket.emit('error_message', { message: errMsg });
          if (callback) callback({ error: errMsg, code: 403 });
          return;
        }

        // 🔒 Business Access Verification
        if (businessId) {
          const hasSenderAccess = await checkUserBusinessAccess(user, businessId);
          if (!hasSenderAccess) {
            const errMsg = 'Unauthorized: Sender does not have access to this business.';
            socket.emit('error_message', { message: errMsg });
            if (callback) callback({ error: errMsg });
            return;
          }
        }

        // Save message in PostgreSQL
        const savedMessage = await ChatMessage.create({
          sender_id: user.id,
          receiver_id: receiver.id,
          business_id: businessId,
          content: content.trim(),
          attachment_url: attachmentUrl,
          message_type: 'DIRECT',
          is_read: false,
        });

        const fullMessage = await ChatMessage.findByPk(savedMessage.id, {
          include: [
            { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] },
            { model: User, as: 'receiver', attributes: ['id', 'name', 'email', 'role'] },
          ],
        });

        // Convert Sequelize Model instance to plain serializable JSON object
        const plainMsg = fullMessage.toJSON ? fullMessage.toJSON() : fullMessage;
        plainMsg.created_at = plainMsg.created_at || plainMsg.createdAt || new Date().toISOString();

        console.log(`📨 [WS] Message routed from ${user.name} (${user.id}) to ${receiver.name} (${receiver.id}) [Business: ${businessId || 'GLOBAL'}]`);

        // Deliver live message to recipient room and sender room
        io.to(`user:${receiver.id}`).emit('receive_message', plainMsg);
        io.to(`user:${user.id}`).emit('message_sent', plainMsg);

        // If recipient is offline, create in-app notification
        const isRecipientOnline = connectedUsers.has(receiver.id) && connectedUsers.get(receiver.id).size > 0;
        if (!isRecipientOnline) {
          try {
            await Notification.create({
              user_id: receiver.id,
              type: 'SYSTEM',
              title: `New Message from ${user.name}`,
              message: content.length > 80 ? content.slice(0, 77) + '...' : content,
              is_read: false,
            });
          } catch (notifErr) {
            console.warn('Could not create offline notification:', notifErr.message);
          }
        }

        if (callback) callback({ success: true, message: plainMsg });
      } catch (err) {
        console.error('Error handling send_message WS event:', err);
        socket.emit('error_message', { message: err.message || 'Failed to send message' });
        if (callback) callback({ error: err.message });
      }
    });

    /**
     * Typing Indicator
     */
    socket.on('typing', ({ receiverId, isTyping, businessId }) => {
      if (receiverId) {
        io.to(`user:${receiverId}`).emit('user_typing', {
          senderId: user.id,
          senderName: user.name,
          isTyping: Boolean(isTyping),
          businessId: businessId || null,
        });
      }
    });

    /**
     * Mark Messages as Read
     */
    socket.on('mark_read', async ({ partnerId, businessId }) => {
      try {
        if (!partnerId) return;

        const rawBusinessId = businessId || null;
        const isValidBusinessId =
          rawBusinessId &&
          rawBusinessId !== 'all' &&
          rawBusinessId !== 'null' &&
          rawBusinessId !== 'undefined';
        const finalBusinessId = isValidBusinessId ? rawBusinessId : null;

        await ChatMessage.update(
          { is_read: true, read_at: new Date() },
          {
            where: {
              sender_id: partnerId,
              receiver_id: user.id,
              is_read: false,
              ...(finalBusinessId ? { business_id: finalBusinessId } : {}),
            },
          }
        );

        // Notify partner that their messages have been read
        io.to(`user:${partnerId}`).emit('messages_read', {
          readerId: user.id,
          businessId: finalBusinessId,
        });
      } catch (err) {
        console.error('Error updating read status in WS:', err.message);
      }
    });

    /**
     * Admin Broadcast Message to business or role
     */
    socket.on('send_broadcast', async (data, callback) => {
      try {
        if (!isAlexanderAdmin(user)) {
          const errMsg = 'Only Admin Alexander can dispatch broadcast announcements.';
          if (callback) callback({ error: errMsg });
          return;
        }

        const { content, targetRole, target_role, attachmentUrl, attachment_url, businessId, business_id } = data;
        const rawContent = content;
        if (!rawContent || !rawContent.trim()) {
          if (callback) callback({ error: 'Broadcast content required' });
          return;
        }

        const roleTarget = targetRole || target_role || 'ALL';
        const rawBizId = businessId || business_id || null;
        const isValidBusinessId =
          rawBizId &&
          rawBizId !== 'all' &&
          rawBizId !== 'null' &&
          rawBizId !== 'undefined';
        const finalBizId = isValidBusinessId ? rawBizId : null;
        const finalAttachment = attachmentUrl || attachment_url || null;

        const broadcast = await ChatMessage.create({
          sender_id: user.id,
          receiver_id: null,
          business_id: finalBizId,
          content: rawContent.trim(),
          attachment_url: finalAttachment,
          message_type: 'BROADCAST',
          target_role: roleTarget,
          is_read: false,
        });

        const fullBroadcast = await ChatMessage.findByPk(broadcast.id, {
          include: [{ model: User, as: 'sender', attributes: ['id', 'name', 'email', 'role'] }],
        });

        const plainBroadcast = fullBroadcast.toJSON ? fullBroadcast.toJSON() : fullBroadcast;
        plainBroadcast.created_at = plainBroadcast.created_at || plainBroadcast.createdAt || new Date().toISOString();

        console.log(`📢 [WS] Broadcast announcement sent by ${user.name} to target [${roleTarget}] [Business: ${finalBizId || 'GLOBAL'}]`);

        if (finalBizId) {
          // Scope broadcast strictly to business room
          if (roleTarget === 'ALL') {
            io.to(`business:${finalBizId}`).emit('receive_broadcast', plainBroadcast);
          } else {
            io.to(`business:${finalBizId}:role:${roleTarget}`).emit('receive_broadcast', plainBroadcast);
            io.to(`business:${finalBizId}:role:DROPSHIPPER`).emit('receive_broadcast', plainBroadcast);
          }
        } else {
          // Global platform broadcast
          if (roleTarget === 'ALL') {
            io.emit('receive_broadcast', plainBroadcast);
          } else {
            io.to(`role:${roleTarget}`).emit('receive_broadcast', plainBroadcast);
            io.to(`role:DROPSHIPPER`).emit('receive_broadcast', plainBroadcast);
          }
        }

        if (callback) callback({ success: true, broadcast: plainBroadcast });
      } catch (err) {
        console.error('Error handling send_broadcast WS event:', err);
        if (callback) callback({ error: err.message });
      }
    });

    /**
     * Disconnect Handler
     */
    socket.on('disconnect', () => {
      console.log(`🔌 [WS] User disconnected: ${user.name} (${user.id})`);
      if (connectedUsers.has(user.id)) {
        connectedUsers.get(user.id).delete(socket.id);
        if (connectedUsers.get(user.id).size === 0) {
          connectedUsers.delete(user.id);
        }
      }
      io.emit('online_users', Array.from(connectedUsers.keys()));
    });
  });

  return io;
};
