import { Order, Expense } from './services/analytics-service/models/index.js';

console.log('Order DB:', Order.sequelize.config.database);
console.log('Expense DB:', Expense.sequelize.config.database);

async function check() {
  try {
    const oCount = await Order.count();
    console.log('Order count:', oCount);
    const eCount = await Expense.count();
    console.log('Expense count:', eCount);
  } catch (err) {
    console.error('Error querying Order/Expense:', err.message);
  }
}

check();
