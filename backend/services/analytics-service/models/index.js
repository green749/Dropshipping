import { DataTypes } from 'sequelize';
import { getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';
import { Expense, EXPENSE_CATEGORIES } from './Expense.js';

const sequelize = getSequelize(env.DB.ANALYTICS_NAME);

export const Business = sequelize.define(
  'Business',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    logo: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: true },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    profit_margin: { type: DataTypes.DECIMAL(5, 2), defaultValue: 20.0 },
    status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
  },
  { tableName: 'businesses', timestamps: true, underscored: true }
);

export const Dealer = sequelize.define(
  'Dealer',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    user_id: { type: DataTypes.UUID, allowNull: false },
    company_name: { type: DataTypes.STRING, allowNull: false },
    contact_name: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    credit_limit: { type: DataTypes.DECIMAL(12, 2), defaultValue: 10000.0 },
    average_lead_time_days: { type: DataTypes.INTEGER, defaultValue: 3 },
    dispatch_sla_hours: { type: DataTypes.INTEGER, defaultValue: 24 },
    fulfillment_sla_hours: { type: DataTypes.INTEGER, defaultValue: 48 },
    commission_rate: { type: DataTypes.DECIMAL(5, 2), defaultValue: 10.0 },
    payment_terms: { type: DataTypes.STRING, defaultValue: 'NET30' },
    payable_balance: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0.0 },
    rating_notes: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
  },
  { tableName: 'dealers', timestamps: true, underscored: true }
);

export const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    dealer_id: { type: DataTypes.UUID, allowNull: false },
    business_id: { type: DataTypes.UUID, allowNull: true },
    name: { type: DataTypes.STRING, allowNull: false },
    sku: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    category: { type: DataTypes.STRING, allowNull: false },
    cost_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    selling_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    stock_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    reserved_quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
    low_stock_threshold: { type: DataTypes.INTEGER, defaultValue: 10 },
    reorder_level: { type: DataTypes.INTEGER, defaultValue: 15 },
    safety_stock: { type: DataTypes.INTEGER, defaultValue: 5 },
    target_stock_days: { type: DataTypes.INTEGER, defaultValue: 14 },
    images: { type: DataTypes.JSON, defaultValue: [] },
    status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
  },
  { tableName: 'products', timestamps: true, underscored: true }
);

export const Customer = sequelize.define(
  'Customer',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    business_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: true },
    address: { type: DataTypes.TEXT, allowNull: true },
    city: { type: DataTypes.STRING, allowNull: true },
    state: { type: DataTypes.STRING, allowNull: true },
    pincode: { type: DataTypes.STRING, allowNull: true },
    total_orders: { type: DataTypes.INTEGER, defaultValue: 0 },
    total_spent: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    status: { type: DataTypes.STRING, defaultValue: 'ACTIVE' },
  },
  { tableName: 'customers', timestamps: true, underscored: true }
);

export const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    business_id: { type: DataTypes.UUID, allowNull: false },
    customer_id: { type: DataTypes.UUID, allowNull: false },
    order_number: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    payment_status: { type: DataTypes.STRING, defaultValue: 'PENDING' },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    shipping_fee: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    discount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    total_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    shipping_address: { type: DataTypes.TEXT, allowNull: true },
    assigned_at: { type: DataTypes.DATE, allowNull: true },
    accepted_at: { type: DataTypes.DATE, allowNull: true },
    dispatched_at: { type: DataTypes.DATE, allowNull: true },
    delivered_at: { type: DataTypes.DATE, allowNull: true },
    cancellation_reason: { type: DataTypes.TEXT, allowNull: true },
    cancellation_source: { type: DataTypes.STRING(50), defaultValue: 'CUSTOMER', allowNull: true },
    dealer_notes: { type: DataTypes.TEXT, allowNull: true },
    sla_breached: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { tableName: 'orders', timestamps: true, underscored: true }
);

export const OrderItem = sequelize.define(
  'OrderItem',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    order_id: { type: DataTypes.UUID, allowNull: false },
    product_id: { type: DataTypes.UUID, allowNull: false },
    dealer_id: { type: DataTypes.UUID, allowNull: false },
    product_name: { type: DataTypes.STRING, allowNull: true },
    sku: { type: DataTypes.STRING, allowNull: true },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    unit_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    total_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
  },
  { tableName: 'order_items', timestamps: false, underscored: true }
);

export const Return = sequelize.define(
  'Return',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    order_id: { type: DataTypes.UUID, allowNull: true },
    order_number: { type: DataTypes.STRING, allowNull: true },
    business_id: { type: DataTypes.UUID, allowNull: true },
    customer_id: { type: DataTypes.UUID, allowNull: true },
    dealer_id: { type: DataTypes.UUID, allowNull: true },
    product_id: { type: DataTypes.UUID, allowNull: true },
    product_name: { type: DataTypes.STRING, allowNull: true },
    reason: { type: DataTypes.TEXT, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'REQUESTED' },
    refund_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    resolution: { type: DataTypes.TEXT, allowNull: true },
    requested_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: 'returns', timestamps: true, underscored: true }
);

export const Campaign = sequelize.define(
  'Campaign',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    business_id: { type: DataTypes.UUID, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    objective: { type: DataTypes.STRING, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'DRAFT' },
    budget: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    start_date: { type: DataTypes.DATE, allowNull: true },
    end_date: { type: DataTypes.DATE, allowNull: true },
    created_by: { type: DataTypes.UUID, allowNull: true },
  },
  { tableName: 'campaigns', timestamps: true, underscored: true }
);

export const Post = sequelize.define(
  'Post',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    business_id: { type: DataTypes.UUID, allowNull: true },
    campaign_id: { type: DataTypes.UUID, allowNull: true },
    status: { type: DataTypes.STRING, defaultValue: 'DRAFT' },
  },
  { tableName: 'posts', timestamps: true, underscored: true }
);

export const Ad = sequelize.define(
  'Ad',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    business_id: { type: DataTypes.UUID, allowNull: true },
    campaign_id: { type: DataTypes.UUID, allowNull: true },
    budget: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.0 },
    status: { type: DataTypes.STRING, defaultValue: 'DRAFT' },
  },
  { tableName: 'ads', timestamps: true, underscored: true }
);

// ─── MODEL RELATIONSHIPS ───
Order.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Business.hasMany(Order, { foreignKey: 'business_id', as: 'orders' });

Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

OrderItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'product_id', as: 'order_items' });

Order.hasMany(Return, { foreignKey: 'order_id', as: 'returns' });
Return.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
Return.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

Expense.belongsTo(Business, { foreignKey: 'business_id', as: 'business' });
Business.hasMany(Expense, { foreignKey: 'business_id', as: 'expenses' });

export { Expense, EXPENSE_CATEGORIES };
