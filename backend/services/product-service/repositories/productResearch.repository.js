import { ProductResearch } from '../models/index.js';

export const productResearchRepository = {
  async create(data, transaction = null) {
    return ProductResearch.create(data, { transaction });
  },

  async findById(id) {
    return ProductResearch.findByPk(id);
  },

  async findAll(options = {}) {
    return ProductResearch.findAndCountAll(options);
  },

  async update(id, data, transaction = null) {
    const item = await ProductResearch.findByPk(id);
    if (!item) return null;
    return item.update(data, { transaction });
  },

  async delete(id, transaction = null) {
    const item = await ProductResearch.findByPk(id);
    if (!item) return false;
    await item.destroy({ transaction });
    return true;
  },
};
