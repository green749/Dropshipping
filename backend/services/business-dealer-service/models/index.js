import { Business, BUSINESS_STATUS } from './Business.js';
import { Dealer, DEALER_STATUS } from './Dealer.js';
import { BusinessDealer, BUSINESS_DEALER_STATUS } from './BusinessDealer.js';
import { DealerInvitation, INVITATION_STATUS } from './DealerInvitation.js';

// Many-to-Many Association
Business.belongsToMany(Dealer, {
  through: BusinessDealer,
  foreignKey: 'business_id',
  otherKey: 'dealer_id',
  as: 'dealers',
});

Dealer.belongsToMany(Business, {
  through: BusinessDealer,
  foreignKey: 'dealer_id',
  otherKey: 'business_id',
  as: 'businesses',
});

Business.hasMany(BusinessDealer, { foreignKey: 'business_id', as: 'businessDealers' });
BusinessDealer.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });

Dealer.hasMany(BusinessDealer, { foreignKey: 'dealer_id', as: 'dealerBusinesses' });
BusinessDealer.belongsTo(Dealer, { foreignKey: 'dealer_id', as: 'dealer' });

export {
  Business,
  BUSINESS_STATUS,
  Dealer,
  DEALER_STATUS,
  BusinessDealer,
  BUSINESS_DEALER_STATUS,
  DealerInvitation,
  INVITATION_STATUS,
};
