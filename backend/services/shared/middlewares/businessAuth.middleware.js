import { sendError } from '../utils/apiResponse.js';
import { BusinessDealer, Dealer, DealerInvitation } from '../../business-dealer-service/models/index.js';
import { Sequelize, Op } from 'sequelize';

/**
 * Check if a user has access to a specific business.
 * - Dropshipper (DROPSHIPPER): Access granted to all platform businesses.
 * - Dealer (DEALER): Verified via BusinessDealer mapping or DealerInvitation.
 * - Marketing / Sales: Verified via DealerInvitation matching user's email.
 */
export const checkUserBusinessAccess = async (user, businessId) => {
  if (!user || !businessId) return false;

  // Only DROPSHIPPER admin is granted access to 'all' businesses
  if (businessId === 'all' || businessId === 'ALL') {
    return user.role === 'DROPSHIPPER';
  }

  if (user.role === 'DROPSHIPPER') return true;

  const normalizedEmail = (user.email || '').trim().toLowerCase();

  if (user.role === 'DEALER') {
    const dealers = await Dealer.findAll({
      where: {
        [Op.or]: [
          { user_id: user.id },
          ...(normalizedEmail
            ? [
                Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  normalizedEmail
                ),
              ]
            : []),
        ],
      },
      attributes: ['id'],
    });
    const dealerIds = dealers.map((d) => d.id);

    const isAssigned = await BusinessDealer.findOne({
      where: {
        business_id: businessId,
        [Op.or]: [
          ...(dealerIds.length > 0 ? [{ dealer_id: { [Op.in]: dealerIds } }] : []),
          { dealer_id: user.id },
        ],
      },
    });

    if (isAssigned) return true;

    const isInvited = await DealerInvitation.findOne({
      where: {
        business_id: businessId,
        ...(normalizedEmail
          ? {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  normalizedEmail
                ),
              ],
            }
          : {}),
      },
    });

    return !!isInvited;
  }

  if (user.role === 'MARKETING' || user.role === 'SALES') {
    const isInvited = await DealerInvitation.findOne({
      where: {
        business_id: businessId,
        ...(normalizedEmail
          ? {
              [Op.and]: [
                Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  normalizedEmail
                ),
              ],
            }
          : {}),
      },
    });

    return !!isInvited;
  }

  return false;
};

/**
 * Helper to fetch all business IDs authorized for a user.
 */
export const getUserAuthorizedBusinessIds = async (user) => {
  if (!user) return [];
  if (user.role === 'DROPSHIPPER') return 'all';

  const normalizedEmail = (user.email || '').trim().toLowerCase();
  const businessIds = new Set();

  if (user.role === 'DEALER') {
    const dealers = await Dealer.findAll({
      where: {
        [Op.or]: [
          { user_id: user.id },
          ...(normalizedEmail
            ? [
                Sequelize.where(
                  Sequelize.fn('LOWER', Sequelize.col('email')),
                  normalizedEmail
                ),
              ]
            : []),
        ],
      },
      attributes: ['id'],
    });
    const dealerIds = dealers.map((d) => d.id);

    const assigned = await BusinessDealer.findAll({
      where: {
        [Op.or]: [
          ...(dealerIds.length > 0 ? [{ dealer_id: { [Op.in]: dealerIds } }] : []),
          { dealer_id: user.id },
        ],
      },
      attributes: ['business_id'],
    });
    assigned.forEach((a) => businessIds.add(a.business_id));
  }

  const invites = await DealerInvitation.findAll({
    where: {
      ...(normalizedEmail
        ? {
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn('LOWER', Sequelize.col('email')),
                normalizedEmail
              ),
            ],
          }
        : {}),
    },
    attributes: ['business_id'],
  });
  invites.forEach((i) => businessIds.add(i.business_id));

  return Array.from(businessIds);
};

/**
 * Verify business access helper that throws 403 Error if access is denied.
 */
export const verifyBusinessAccess = async (user, businessId) => {
  if (!businessId) return true;
  const hasAccess = await checkUserBusinessAccess(user, businessId);
  if (!hasAccess) {
    const error = new Error('Unauthorized: You do not have access to this business');
    error.statusCode = 403;
    throw error;
  }
  return true;
};

/**
 * Middleware to verify that the authenticated user has authorization to access the requested business_id.
 */
export const requireBusinessAccess = async (req, res, next) => {
  try {
    const rawBusinessId = req.query.business_id || req.body.business_id || req.headers['x-business-id'];
    const user = req.user;

    if (!user) {
      return sendError(res, 'Authentication required', [], 401);
    }

    if (rawBusinessId === 'all' || rawBusinessId === 'ALL') {
      if (user.role !== 'DROPSHIPPER') {
        return sendError(res, 'Unauthorized: Global access is restricted to Administrators only', [], 403);
      }
      return next();
    }

    const isValidUuid =
      rawBusinessId &&
      rawBusinessId !== 'null' &&
      rawBusinessId !== 'undefined';

    if (!isValidUuid) {
      return next();
    }

    const hasAccess = await checkUserBusinessAccess(user, rawBusinessId);
    if (!hasAccess) {
      return sendError(res, 'Unauthorized: You do not have access to this business', [], 403);
    }

    return next();
  } catch (error) {
    next(error);
  }
};


