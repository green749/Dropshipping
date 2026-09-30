import { Product, PRODUCT_STATUS } from './Product.js';
import { InventoryTransaction, INVENTORY_TRANSACTION_TYPES } from './InventoryTransaction.js';
import { ProductResearch, RESEARCH_STATUS } from './ProductResearch.js';

// Associations
Product.hasMany(InventoryTransaction, { foreignKey: 'product_id', as: 'transactions' });
InventoryTransaction.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

export {
  Product,
  PRODUCT_STATUS,
  InventoryTransaction,
  INVENTORY_TRANSACTION_TYPES,
  ProductResearch,
  RESEARCH_STATUS,
};
