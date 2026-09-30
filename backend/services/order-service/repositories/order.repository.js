import { Order, OrderItem, Customer } from '../models/index.js';

export const orderRepository = {
  async findAll(where = {}, offset = 0, limit = 20) {
    const { count, rows } = await Order.findAndCountAll({
      where,
      offset,
      limit,
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items' },
      ],
      order: [['created_at', 'DESC']],
    });
    return { total: count, orders: rows };
  },

  async findById(id) {
    return Order.findByPk(id, {
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name', 'email', 'phone', 'address'] },
        { model: OrderItem, as: 'items' },
      ],
    });
  },

  async findByOrderNumber(orderNumber) {
    return Order.findOne({ where: { order_number: orderNumber } });
  },

  async updateStatus(id, statusData) {
    const order = await Order.findByPk(id);
    if (!order) return null;
    return order.update(statusData);
  },

  async update(id, updateData) {
    const order = await Order.findByPk(id);
    if (!order) return null;
    return order.update(updateData);
  },

  async delete(id) {
    const order = await Order.findByPk(id);
    if (!order) return false;
    await OrderItem.destroy({ where: { order_id: id } });
    await order.destroy();
    return true;
  },
};
