import { orderService } from '../services/order.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const orderController = {
  async getAll(req, res, next) {
    try {
      const { orders, pagination } = await orderService.getAllOrders(req.query, req.user);
      return sendSuccess(res, 'Orders retrieved successfully', orders, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getById(req, res, next) {
    try {
      const order = await orderService.getOrderById(req.params.id, req.user);
      return sendSuccess(res, 'Order details retrieved successfully', order);
    } catch (error) {
      next(error);
    }
  },

  async create(req, res, next) {
    try {
      const order = await orderService.createOrder(req.body, req.user);
      return sendSuccess(res, 'Order created successfully', order, 201);
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req, res, next) {
    try {
      const order = await orderService.updateOrderStatus(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Order status updated successfully', order);
    } catch (error) {
      next(error);
    }
  },

  async update(req, res, next) {
    try {
      const order = await orderService.updateOrder(req.params.id, req.body, req.user);
      return sendSuccess(res, 'Order updated successfully', order);
    } catch (error) {
      next(error);
    }
  },

  async delete(req, res, next) {
    try {
      await orderService.deleteOrder(req.params.id, req.user);
      return sendSuccess(res, 'Order deleted successfully');
    } catch (error) {
      next(error);
    }
  },
};
