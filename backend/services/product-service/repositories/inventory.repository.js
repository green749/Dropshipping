import { Product, InventoryTransaction } from '../models/index.js';
import { Op, fn, col } from 'sequelize';

export const inventoryRepository = {
  async findProductById(id, transaction = null) {
    const options = {};
    if (transaction) {
      options.transaction = transaction;
      options.lock = transaction.LOCK?.UPDATE || true;
    }
    return Product.findByPk(id, options);
  },

  async findTransactions(where = {}, offset = 0, limit = 20, order = [['created_at', 'DESC']]) {
    const { count, rows } = await InventoryTransaction.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'sku', 'category', 'cost_price', 'selling_price'],
        },
      ],
      offset,
      limit,
      order,
    });

    return { total: count, transactions: rows };
  },

  async createTransaction(data, transaction = null) {
    const options = transaction ? { transaction } : {};
    return InventoryTransaction.create(data, options);
  },

  async getRecentTransactionsByProduct(productId, limit = 10) {
    return InventoryTransaction.findAll({
      where: { product_id: productId },
      order: [['created_at', 'DESC']],
      limit,
    });
  },

  async getDailyMovementTrend(businessId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const where = {
      created_at: { [Op.gte]: startDate },
    };
    if (businessId && businessId !== 'all') {
      where.business_id = businessId;
    }

    const transactions = await InventoryTransaction.findAll({
      where,
      order: [['created_at', 'ASC']],
      attributes: [
        'transaction_type',
        'quantity',
        'previous_quantity',
        'new_quantity',
        'created_at',
      ],
    });

    return transactions;
  },
};
