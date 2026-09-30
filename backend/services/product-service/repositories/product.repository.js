import { Product } from '../models/index.js';

export const productRepository = {
  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await Product.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });
    return { total: count, products: rows };
  },

  async findById(id) {
    return Product.findByPk(id);
  },

  async findBySku(sku) {
    return Product.findOne({ where: { sku } });
  },

  async create(data) {
    return Product.create(data);
  },

  async update(id, data) {
    const product = await Product.findByPk(id);
    if (!product) return null;
    return product.update(data);
  },

  async delete(id) {
    const product = await Product.findByPk(id);
    if (!product) return false;
    await product.destroy();
    return true;
  },
};
