import crypto from 'crypto';
import { invitationRepository } from '../repositories/invitation.repository.js';
import { dealerRepository } from '../repositories/dealer.repository.js';
import { businessRepository } from '../repositories/business.repository.js';
import { INVITATION_STATUS } from '../models/DealerInvitation.js';
import { env } from '../../shared/config/env.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { authService } from '../../auth-service/services/auth.service.js';
import { userRepository } from '../../auth-service/repositories/user.repository.js';
import { CacheService } from '../../shared/services/cache.service.js';

export const invitationService = {
  async inviteDealer({ email, business_id, company_name, role = 'DEALER' }, adminUser) {
    const targetRole = role === 'MARKETING' ? 'MARKETING' : role === 'SALES' ? 'SALES' : 'DEALER';
    const normalizedEmail = (email || '').trim().toLowerCase();

    // 1. Check if user with this email already exists in the platform
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      const error = new Error(`User with email "${email}" already exists in the platform. You cannot send an invitation to an already registered user.`);
      error.statusCode = 400;
      throw error;
    }

    const existingInvite = await invitationRepository.findByEmail(normalizedEmail);
    const token = `inv_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 Days Expiry

    let invitation;
    if (existingInvite && existingInvite.status === INVITATION_STATUS.PENDING) {
      // Refresh the existing pending invitation with a new token & extended expiry
      invitation = await existingInvite.update({
        business_id: business_id || existingInvite.business_id,
        company_name: company_name || existingInvite.company_name,
        role: targetRole,
        token,
        expires_at: expiresAt,
        invited_by: adminUser?.id || existingInvite.invited_by,
      });
    } else {
      invitation = await invitationRepository.create({
        email,
        business_id,
        company_name,
        role: targetRole,
        token,
        expires_at: expiresAt,
        invited_by: adminUser?.id || '00000000-0000-0000-0000-000000000000',
        status: INVITATION_STATUS.PENDING,
      });
    }

    const baseUrl = env.FRONTEND_URL && !env.FRONTEND_URL.includes('localhost') ? env.FRONTEND_URL : '';
    const inviteLink = `${baseUrl}/accept-invite?token=${token}`;
    const roleLabel = targetRole === 'MARKETING' ? 'Digital Marketer' : targetRole === 'SALES' ? 'Sales Team' : 'Dealer';

    return {
      invitation,
      inviteLink,
      message: `${roleLabel} invitation link generated successfully!`,
    };
  },

  async getInvitationByToken(token) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation) {
      const error = new Error('Invalid or expired invitation token');
      error.statusCode = 404;
      throw error;
    }

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      const error = new Error(`Invitation has already been ${invitation.status.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await invitationRepository.updateStatus(invitation.id, INVITATION_STATUS.EXPIRED);
      const error = new Error('Invitation link has expired');
      error.statusCode = 400;
      throw error;
    }

    let businessName = null;
    if (invitation.business_id) {
      const business = await businessRepository.findById(invitation.business_id);
      if (business) businessName = business.name;
    }

    return {
      email: invitation.email,
      company_name: invitation.company_name,
      role: invitation.role || 'DEALER',
      business_id: invitation.business_id,
      business_name: businessName,
      expires_at: invitation.expires_at,
      status: invitation.status,
    };
  },

  async acceptInvitation({ token, name, password, company_name, phone }) {
    const invitation = await invitationRepository.findByToken(token);
    if (!invitation || invitation.status !== INVITATION_STATUS.PENDING) {
      const error = new Error('Invalid or non-pending invitation token');
      error.statusCode = 400;
      throw error;
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await invitationRepository.updateStatus(invitation.id, INVITATION_STATUS.EXPIRED);
      const error = new Error('Invitation link has expired');
      error.statusCode = 400;
      throw error;
    }

    const userRole = invitation.role || 'DEALER';

    // 1. Create User Account in Auth Service
    const authRes = await authService.register({
      name,
      email: invitation.email,
      password,
      role: userRole,
    });
    const user = authRes.user;
    const accessToken = authRes.accessToken || authRes.token;
    const refreshToken = authRes.refreshToken;

    let dealerProfile = null;

    // 2. If DEALER, create Dealer Profile in Business & Dealer Service
    if (userRole === 'DEALER') {
      const companyName = company_name || invitation.company_name || `${name} Store`;
      dealerProfile = await dealerRepository.create({
        user_id: user.id,
        company_name: companyName,
        contact_name: name,
        email: invitation.email,
        phone,
      });

      // Assign Dealer to Business if specified
      if (invitation.business_id) {
        await dealerRepository.assignToBusiness(invitation.business_id, dealerProfile.id);
      }
    }

    // 3. Mark Invitation as ACCEPTED
    await invitationRepository.updateStatus(invitation.id, INVITATION_STATUS.ACCEPTED);

    await CacheService.delByPattern('dealers:*');
    await CacheService.delByPattern('dealer:*');
    await CacheService.delByPattern('businesses:*');
    await CacheService.delByPattern('analytics:*');

    const roleLabel = userRole === 'MARKETING' ? 'Digital Marketer' : userRole === 'SALES' ? 'Sales Team Member' : 'Dealer';

    return {
      user,
      ...(dealerProfile && { dealer: dealerProfile }),
      accessToken,
      refreshToken,
      token: accessToken,
      message: `${roleLabel} account created and invitation accepted successfully!`,
    };
  },

  async getAllInvitations(query) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};
    if (query.status) where.status = query.status;
    if (query.role) where.role = query.role;
    if (query.business_id && query.business_id !== 'all') where.business_id = query.business_id;

    const { total, invitations } = await invitationRepository.findAll(where, offset, limit);
    return { invitations, pagination: formatPagination(page, limit, total) };
  },

  async resendInvitation(id, adminUser) {
    const invitation = await invitationRepository.findById(id);
    if (!invitation) {
      const error = new Error('Invitation not found');
      error.statusCode = 404;
      throw error;
    }

    if (invitation.status !== INVITATION_STATUS.PENDING) {
      const error = new Error(`Cannot resend an invitation that is already ${invitation.status.toLowerCase()}`);
      error.statusCode = 400;
      throw error;
    }

    const baseUrl = env.FRONTEND_URL && !env.FRONTEND_URL.includes('localhost') ? env.FRONTEND_URL : '';
    const inviteLink = `${baseUrl}/accept-invite?token=${invitation.token}`;

    return {
      success: true,
      inviteLink,
      message: `Invitation link retrieved successfully for ${invitation.email}`,
    };
  },
};
