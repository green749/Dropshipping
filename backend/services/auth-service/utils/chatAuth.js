import { env } from '../../shared/config/env.js';
import { User, USER_ROLES } from '../models/index.js';

export const ALEXANDER_ADMIN_ID = env.ALEXANDER_ADMIN_ID || 'a0000000-0000-4000-8000-000000000001';

/**
 * Identify if a given user object or payload represents Alexander / Admin
 */
export function isAlexanderAdmin(user) {
  if (!user) return false;
  const userId = String(user.id || user._id || '');
  if (userId === ALEXANDER_ADMIN_ID) return true;
  if ((user.email || '').toLowerCase().trim() === 'admin@dropship.com') return true;
  if ((user.name || '').toLowerCase().includes('alexander')) return true;
  return false;
}

/**
 * Validate allowed communication relationship between sender and receiver.
 * Topology:
 * - Alexander (Admin) ↔ Dealer
 * - Alexander (Admin) ↕ Sales
 * - Alexander (Admin) ↕ Digital Marketer (MARKETING)
 *
 * Forbidden direct pairs (return false):
 * - Dealer ↔ Sales
 * - Dealer ↔ Digital Marketer
 * - Sales ↔ Digital Marketer
 * - Dealer ↔ Dealer
 * - Sales ↔ Sales
 * - Digital Marketer ↔ Digital Marketer
 */
export function isCommunicationAllowed(senderUser, receiverUser) {
  if (!senderUser || !receiverUser) return false;

  const isSenderAdmin = isAlexanderAdmin(senderUser);
  const isReceiverAdmin = isAlexanderAdmin(receiverUser);

  // If NEITHER participant is Alexander / Admin -> BLOCK DIRECT COMMUNICATION
  if (!isSenderAdmin && !isReceiverAdmin) {
    return false;
  }

  // Determine the non-admin participant's role
  const nonAdminUser = isSenderAdmin ? receiverUser : senderUser;
  const role = (nonAdminUser.role || '').toUpperCase();

  const allowedRoles = [
    USER_ROLES.DEALER,
    USER_ROLES.SALES,
    USER_ROLES.MARKETING,
    'DEALER',
    'SALES',
    'MARKETING',
    'DIGITAL_MARKETER',
  ];

  return allowedRoles.includes(role);
}

/**
 * Fetch the primary Alexander Admin user record from database
 */
export async function getAlexanderAdminUser() {
  try {
    let admin = await User.findByPk(ALEXANDER_ADMIN_ID, {
      attributes: ['id', 'name', 'email', 'role', 'is_active'],
    });

    if (!admin) {
      admin = await User.findOne({
        where: { email: 'admin@dropship.com' },
        attributes: ['id', 'name', 'email', 'role', 'is_active'],
      });
    }

    if (!admin) {
      admin = await User.findOne({
        where: { role: USER_ROLES.DROPSHIPPER },
        attributes: ['id', 'name', 'email', 'role', 'is_active'],
        order: [['created_at', 'ASC']],
      });
    }

    return admin;
  } catch (err) {
    console.error('Error fetching Alexander Admin user:', err.message);
    return null;
  }
}
