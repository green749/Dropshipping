import { invitationService } from '../services/invitation.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const invitationController = {
  async invite(req, res, next) {
    try {
      const role = req.body.role || (req.baseUrl.includes('marketing') ? 'MARKETING' : req.baseUrl.includes('sales') ? 'SALES' : 'DEALER');
      const result = await invitationService.inviteDealer({ ...req.body, role }, req.user);
      return sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async inviteMarketer(req, res, next) {
    try {
      const result = await invitationService.inviteDealer({ ...req.body, role: 'MARKETING' }, req.user);
      return sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async inviteSales(req, res, next) {
    try {
      const result = await invitationService.inviteDealer({ ...req.body, role: 'SALES' }, req.user);
      return sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async getByToken(req, res, next) {
    try {
      const invitation = await invitationService.getInvitationByToken(req.params.token);
      return sendSuccess(res, 'Invitation details retrieved successfully', invitation);
    } catch (error) {
      next(error);
    }
  },

  async accept(req, res, next) {
    try {
      const result = await invitationService.acceptInvitation(req.body);
      const token = result?.accessToken || result?.token;
      if (token) {
        res.cookie('accessToken', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000,
          path: '/',
        });
        res.cookie('token', token, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 15 * 60 * 1000,
          path: '/',
        });
      }
      if (result?.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });
      }
      return sendSuccess(res, result.message, result, 201);
    } catch (error) {
      next(error);
    }
  },

  async getAll(req, res, next) {
    try {
      const { invitations, pagination } = await invitationService.getAllInvitations(req.query);
      return sendSuccess(res, 'Invitations retrieved successfully', invitations, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async resend(req, res, next) {
    try {
      const result = await invitationService.resendInvitation(req.params.id, req.user);
      return sendSuccess(res, result.message, result, 200);
    } catch (error) {
      next(error);
    }
  },
};
