import { Customer, CUSTOMER_STATUS } from './Customer.js';
import { Order, ORDER_STATUS, PAYMENT_STATUS } from './Order.js';
import { OrderItem } from './OrderItem.js';
import { Return, RETURN_STATUS } from './Return.js';

Customer.hasMany(Order, { foreignKey: 'customer_id', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });

Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

export { Customer, CUSTOMER_STATUS, Order, ORDER_STATUS, PAYMENT_STATUS, OrderItem, Return, RETURN_STATUS };
