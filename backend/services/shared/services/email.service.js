/**
 * Email Service (Email sending disabled - Link-based onboarding active)
 */
export const emailService = {
  async sendMail({ to, subject }) {
    return {
      success: true,
      message: 'Direct link-based workflow active (email sending disabled)',
      to,
      subject,
    };
  },

  async sendInvitationEmail() {
    return {
      success: true,
      message: 'Invitation link generated (email sending disabled)',
    };
  },

  async sendOrderNotificationEmail() {
    return {
      success: true,
      message: 'Order recorded (email sending disabled)',
    };
  },

  async sendNotificationEmail() {
    return {
      success: true,
      message: 'Notification recorded (email sending disabled)',
    };
  },

  async sendTestEmail() {
    return {
      success: true,
      message: 'Email sending disabled in project',
    };
  },

  getEmailLogs() {
    return [];
  },

  getEmailLogById() {
    return null;
  },
};
