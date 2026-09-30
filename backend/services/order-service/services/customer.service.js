import { customerRepository } from '../repositories/customer.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { Order, OrderItem, Customer } from '../models/index.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { resolveDealerIds } from '../../shared/services/dealerResolver.service.js';
import { verifyBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';
import { Op } from 'sequelize';

export const customerService = {
  async getAllCustomers(query, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.business_id) where.business_id = query.business_id;
    if (query.status) where.status = query.status;

    const cacheKey = CacheService.generateKey('customers:list', {
      ...where,
      page,
      limit,
      userRole: user?.role,
      userId: user?.role === 'DEALER' ? user.id : 'all',
    });

    const { data } = await CacheService.remember(cacheKey, 180, async () => {
      if (user && user.role === 'DEALER') {
        const dealerIds = await resolveDealerIds(user);
        const orderItems = await OrderItem.findAll({
          where: { dealer_id: { [Op.in]: dealerIds } },
          attributes: ['order_id'],
        });
        const orderIds = [...new Set(orderItems.map((item) => item.order_id))];

        const orders = await Order.findAll({
          where: { id: { [Op.in]: orderIds } },
          attributes: ['customer_id'],
        });
        const customerIds = [...new Set(orders.map((o) => o.customer_id))];

        const { count, rows } = await Customer.findAndCountAll({
          where: { id: { [Op.in]: customerIds }, ...where },
          offset,
          limit,
          order: [['created_at', 'DESC']],
        });

        return { customers: rows, pagination: formatPagination(page, limit, count) };
      }

      const { total, customers } = await customerRepository.findAll(where, offset, limit);
      const pagination = formatPagination(page, limit, total);
      return { customers, pagination };
    });

    return data;
  },

  async getCustomerById(id, user) {
    const cacheKey = `customers:item:${id}`;

    const { data: customer } = await CacheService.remember(cacheKey, 300, async () => {
      return customerRepository.findById(id);
    });

    if (!customer) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && customer.business_id) {
      await verifyBusinessAccess(user, customer.business_id);
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      const orderItems = await OrderItem.findAll({
        where: { dealer_id: { [Op.in]: dealerIds } },
        attributes: ['order_id'],
      });
      const orderIds = [...new Set(orderItems.map((item) => item.order_id))];
      const matchingOrder = await Order.findOne({
        where: { id: { [Op.in]: orderIds }, customer_id: id },
      });

      if (!matchingOrder) {
        const error = new Error('Access denied. Customer has not purchased your products.');
        error.statusCode = 403;
        throw error;
      }
    }

    return customer;
  },

  async createCustomer(data, user) {
    if (user && data.business_id) {
      await verifyBusinessAccess(user, data.business_id);
    }
    const created = await customerRepository.create(data);
    await CacheService.delByPattern('customers:*');
    await CacheService.delByPattern('analytics:*');
    return created;
  },

  async updateCustomer(id, data, user) {
    if (user && user.role === 'MARKETING') {
      const error = new Error('Access denied. Marketing role cannot update customer records.');
      error.statusCode = 403;
      throw error;
    }

    const customer = await this.getCustomerById(id, user);
    if (user && customer.business_id) {
      await verifyBusinessAccess(user, customer.business_id);
    }

    const updated = await customerRepository.update(id, data);
    if (!updated) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('customers:*');
    await CacheService.delByPattern('analytics:*');
    return updated;
  },

  async deleteCustomer(id, user) {
    if (user && user.role !== 'DROPSHIPPER') {
      const error = new Error('Access denied. Only Dropshipper admin can delete customers.');
      error.statusCode = 403;
      throw error;
    }

    const customer = await this.getCustomerById(id, user);
    if (user && customer.business_id) {
      await verifyBusinessAccess(user, customer.business_id);
    }

    const success = await customerRepository.delete(id);
    if (!success) {
      const error = new Error('Customer not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('customers:*');
    await CacheService.delByPattern('analytics:*');
    return { success: true };
  },
};
