import { Campaign, CAMPAIGN_STATUS } from './Campaign.js';
import { SocialAccount, SOCIAL_ACCOUNT_STATUS } from './SocialAccount.js';
import { Post, POST_STATUS } from './Post.js';
import { Ad, AD_STATUS } from './Ad.js';
import { CreativeGeneration, CREATIVE_GENERATION_STATUS } from './CreativeGeneration.js';

Campaign.hasMany(Post, { foreignKey: 'campaign_id', as: 'posts' });
Post.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

Campaign.hasMany(Ad, { foreignKey: 'campaign_id', as: 'ads' });
Ad.belongsTo(Campaign, { foreignKey: 'campaign_id', as: 'campaign' });

SocialAccount.hasMany(Post, { foreignKey: 'social_account_id', as: 'posts' });
Post.belongsTo(SocialAccount, { foreignKey: 'social_account_id', as: 'socialAccount' });

SocialAccount.hasMany(Ad, { foreignKey: 'social_account_id', as: 'ads' });
Ad.belongsTo(SocialAccount, { foreignKey: 'social_account_id', as: 'socialAccount' });

// Self-referential relationship for version history
CreativeGeneration.hasMany(CreativeGeneration, { foreignKey: 'previous_generation_id', as: 'nextVersions' });
CreativeGeneration.belongsTo(CreativeGeneration, { foreignKey: 'previous_generation_id', as: 'previousVersion' });

export {
  Campaign,
  CAMPAIGN_STATUS,
  SocialAccount,
  SOCIAL_ACCOUNT_STATUS,
  Post,
  POST_STATUS,
  Ad,
  AD_STATUS,
  CreativeGeneration,
  CREATIVE_GENERATION_STATUS,
};
