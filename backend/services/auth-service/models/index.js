import { User, USER_ROLES } from './User.js';
import { AuditLog } from './AuditLog.js';
import { Notification } from './Notification.js';
import { ChatMessage } from './ChatMessage.js';

// Associations
User.hasMany(AuditLog, { foreignKey: 'user_id', as: 'auditLogs' });
AuditLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(ChatMessage, { foreignKey: 'sender_id', as: 'sentMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

User.hasMany(ChatMessage, { foreignKey: 'receiver_id', as: 'receivedMessages' });
ChatMessage.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

export { User, USER_ROLES, AuditLog, Notification, ChatMessage };
