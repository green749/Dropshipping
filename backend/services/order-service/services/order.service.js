import { Op } from 'sequelize';
import { sequelize, getSequelize } from '../../shared/config/database.js';
import { env } from '../../shared/config/env.js';
import { Order, OrderItem, Customer } from '../models/index.js';
import { Product } from '../../product-service/models/Product.js';
import { orderRepository } from '../repositories/order.repository.js';
import { getPaginationParams, formatPagination } from '../../shared/utils/pagination.js';
import { CacheService } from '../../shared/services/cache.service.js';
import { resolveDealerIds } from '../../shared/services/dealerResolver.service.js';
import { verifyBusinessAccess } from '../../shared/middlewares/businessAuth.middleware.js';

export const orderService = {
  async getAllOrders(query, user) {
    const { page, limit, offset } = getPaginationParams(query);
    const where = {};

    if (query.business_id) where.business_id = query.business_id;
    if (query.customer_id) where.customer_id = query.customer_id;
    if (query.status) where.status = query.status;

    const cacheKey = CacheService.generateKey('orders:list', {
      ...where,
      page,
      limit,
      userRole: user?.role,
      userId: user?.role === 'DEALER' ? user.id : 'all',
    });

    const { data } = await CacheService.remember(cacheKey, 120, async () => {
      if (user && user.role === 'DEALER') {
        const dealerIds = await resolveDealerIds(user);
        const orderItems = await OrderItem.findAll({
          where: { dealer_id: { [Op.in]: dealerIds } },
          attributes: ['order_id'],
        });
        const orderIds = [...new Set(orderItems.map((item) => item.order_id))];

        const { count, rows } = await Order.findAndCountAll({
          where: { id: { [Op.in]: orderIds }, ...where },
          offset,
          limit,
          include: [
            { model: OrderItem, as: 'items', where: { dealer_id: { [Op.in]: dealerIds } } },
          ],
          order: [['created_at', 'DESC']],
        });

        return { orders: rows, pagination: formatPagination(page, limit, count) };
      }

      const { total, orders } = await orderRepository.findAll(where, offset, limit);
      return { orders, pagination: formatPagination(page, limit, total) };
    });

    return data;
  },

  async getOrderById(id, user) {
    const cacheKey = `orders:item:${id}`;

    const { data: order } = await CacheService.remember(cacheKey, 300, async () => {
      return orderRepository.findById(id);
    });

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && order.business_id) {
      await verifyBusinessAccess(user, order.business_id);
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      const hasDealerProduct = order.items && order.items.some((item) => dealerIds.includes(item.dealer_id));
      if (!hasDealerProduct) {
        const error = new Error('Access denied. Order does not contain products belonging to your account.');
        error.statusCode = 403;
        throw error;
      }
    }

    return order;
  },

  async createOrder(data, user) {
    const {
      business_id,
      customer_id,
      shipping_address,
      shipping_fee = 0,
      discount = 0,
      tax = 0,
      items,
    } = data;

    if (user && business_id) {
      await verifyBusinessAccess(user, business_id);
    }

    // 1. Verify Customer
    const customer = await Customer.findOne({
      where: { id: customer_id, business_id },
    });

    if (!customer) {
      const error = new Error('Customer not found for the specified business');
      error.statusCode = 404;
      throw error;
    }

    let subtotal = 0;
    const orderItemsData = [];
    const productsToUpdate = [];

    // 2. Validate product stock and calculate pricing
    for (const item of items) {
      let product = null;
      if (item.product_id) {
        product = await Product.findByPk(item.product_id);
      }

      if (product) {
        if (product.stock_quantity < item.quantity) {
          const error = new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock_quantity} units, Requested: ${item.quantity} units.`
          );
          error.statusCode = 400;
          throw error;
        }

        const newStock = Math.max(0, product.stock_quantity - item.quantity);
        const newStatus = newStock === 0 ? 'OUT_OF_STOCK' : product.status;
        productsToUpdate.push({
          product,
          newStock,
          newStatus,
          quantity: item.quantity,
        });
      }

      const unitPrice = parseFloat(item.unit_price || (product ? product.selling_price : 100.0));
      const itemTotalPrice = unitPrice * item.quantity;
      subtotal += itemTotalPrice;

      orderItemsData.push({
        product_id: item.product_id,
        dealer_id: item.dealer_id || (product ? product.dealer_id : (user && user.role === 'DEALER' ? user.id : '00000000-0000-0000-0000-000000000000')),
        product_name: item.product_name || (product ? product.name : 'Product Item'),
        sku: item.sku || (product ? product.sku : `SKU-${Date.now()}`),
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: itemTotalPrice,
      });
    }

    const totalAmount = subtotal + parseFloat(shipping_fee) + parseFloat(tax) - parseFloat(discount);
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const orderDb = getSequelize(env.DB.ORDER_NAME);
    const orderId = await orderDb.transaction(async (t) => {
      const order = await Order.create(
        {
          business_id,
          customer_id,
          order_number: orderNumber,
          subtotal,
          shipping_fee,
          discount,
          tax,
          total_amount: totalAmount,
          shipping_address,
          status: 'PENDING',
          payment_status: 'PENDING',
        },
        { transaction: t }
      );

      const itemsWithOrderId = orderItemsData.map((item) => ({
        ...item,
        order_id: order.id,
      }));

      await OrderItem.bulkCreate(itemsWithOrderId, { transaction: t });

      return order.id;
    });

    const createdOrder = await orderRepository.findById(orderId);

    // 3. Decrement Product Stock in dropship_product and dropship_management
    for (const updateInfo of productsToUpdate) {
      await updateInfo.product.update({
        stock_quantity: updateInfo.newStock,
        status: updateInfo.newStatus,
      });

      try {
        const mgmtDb = getSequelize(env.DB.NAME);
        if (mgmtDb) {
          await mgmtDb.query(
            'UPDATE products SET stock_quantity = :stock, status = :status, updated_at = NOW() WHERE id = :productId',
            {
              replacements: {
                stock: updateInfo.newStock,
                status: updateInfo.newStatus,
                productId: updateInfo.product.id,
              },
            }
          );
        }
      } catch (e) {}
    }

    // Invalidate products, orders & analytics cache patterns
    await CacheService.delByPattern('products:*');
    await CacheService.delByPattern('orders:*');
    await CacheService.delByPattern('analytics:*');

    return createdOrder;
  },

  async updateOrderStatus(id, statusData, user) {
    if (user && user.role === 'MARKETING') {
      const error = new Error('Access denied. Marketing role cannot update order status.');
      error.statusCode = 403;
      throw error;
    }

    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && existingOrder.business_id) {
      await verifyBusinessAccess(user, existingOrder.business_id);
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      const hasDealerProduct = existingOrder.items && existingOrder.items.some((item) => dealerIds.includes(item.dealer_id));
      if (!hasDealerProduct) {
        const error = new Error('Access denied. You can only update orders containing your products.');
        error.statusCode = 403;
        throw error;
      }
    }

    const newStatus = typeof statusData === 'string' ? statusData : statusData.status;

    // If order was cancelled, restore product stock
    if (newStatus === 'CANCELLED' && existingOrder.status !== 'CANCELLED' && existingOrder.items) {
      for (const item of existingOrder.items) {
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            const restoredStock = product.stock_quantity + item.quantity;
            const restoredStatus = product.status === 'OUT_OF_STOCK' && restoredStock > 0 ? 'ACTIVE' : product.status;
            await product.update({ stock_quantity: restoredStock, status: restoredStatus });
          }
          try {
            const mgmtDb = getSequelize(env.DB.NAME);
            if (mgmtDb) {
              await mgmtDb.query(
                'UPDATE products SET stock_quantity = stock_quantity + :qty, updated_at = NOW() WHERE id = :productId',
                { replacements: { qty: item.quantity, productId: item.product_id } }
              );
            }
          } catch (e) {}
        }
      }
      await CacheService.delByPattern('products:*');
    }

    const updated = await orderRepository.updateStatus(id, statusData);
    await CacheService.delByPattern('orders:*');
    await CacheService.delByPattern('analytics:*');
    return updated;
  },

  async updateOrder(id, data, user) {
    if (user && user.role === 'MARKETING') {
      const error = new Error('Access denied. Marketing role cannot update orders.');
      error.statusCode = 403;
      throw error;
    }

    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (user && existingOrder.business_id) {
      await verifyBusinessAccess(user, existingOrder.business_id);
    }

    if (user && user.role === 'DEALER') {
      const dealerIds = await resolveDealerIds(user);
      const hasDealerProduct = existingOrder.items && existingOrder.items.some((item) => dealerIds.includes(item.dealer_id));
      if (!hasDealerProduct) {
        const error = new Error('Access denied. You can only update orders containing your products.');
        error.statusCode = 403;
        throw error;
      }
    }

    await orderRepository.update(id, data);
    const updated = await orderRepository.findById(id);
    await CacheService.delByPattern('orders:*');
    await CacheService.delByPattern('analytics:*');
    return updated;
  },

  async deleteOrder(id, user) {
    if (user && user.role !== 'DROPSHIPPER') {
      const error = new Error('Access denied. Only Dropshipper admin can delete orders.');
      error.statusCode = 403;
      throw error;
    }

    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Restore stock if the order being deleted was not cancelled
    if (existingOrder.status !== 'CANCELLED' && existingOrder.items) {
      for (const item of existingOrder.items) {
        if (item.product_id) {
          const product = await Product.findByPk(item.product_id);
          if (product) {
            const restoredStock = product.stock_quantity + item.quantity;
            const restoredStatus = product.status === 'OUT_OF_STOCK' && restoredStock > 0 ? 'ACTIVE' : product.status;
            await product.update({ stock_quantity: restoredStock, status: restoredStatus });
          }
          try {
            const mgmtDb = getSequelize(env.DB.NAME);
            if (mgmtDb) {
              await mgmtDb.query(
                'UPDATE products SET stock_quantity = stock_quantity + :qty, updated_at = NOW() WHERE id = :productId',
                { replacements: { qty: item.quantity, productId: item.product_id } }
              );
            }
          } catch (e) {}
        }
      }
      await CacheService.delByPattern('products:*');
    }

    const deleted = await orderRepository.delete(id);
    if (!deleted) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }
    await CacheService.delByPattern('orders:*');
    await CacheService.delByPattern('analytics:*');
    return { success: true };
  },
};
