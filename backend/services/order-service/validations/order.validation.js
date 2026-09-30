import { z } from 'zod';
import { ORDER_STATUS, PAYMENT_STATUS } from '../models/Order.js';

export const createOrderSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  customer_id: z.string().uuid('Invalid customer ID'),
  shipping_address: z.string().min(5, 'Shipping address is required'),
  shipping_fee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid('Invalid product ID'),
      dealer_id: z.string().uuid('Invalid dealer ID').optional(),
      product_name: z.string().optional(),
      sku: z.string().optional(),
      unit_price: z.number().optional(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'Order must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.RETURNED,
    ORDER_STATUS.REFUNDED,
  ]).optional(),
  payment_status: z.enum([
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.PAID,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.REFUNDED,
  ]).optional(),
});

export const updateOrderSchema = z.object({
  shipping_address: z.string().min(5, 'Shipping address must be at least 5 characters').optional(),
  shipping_fee: z.number().min(0).optional(),
  discount: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
    ORDER_STATUS.RETURNED,
    ORDER_STATUS.REFUNDED,
  ]).optional(),
  payment_status: z.enum([
    PAYMENT_STATUS.PENDING,
    PAYMENT_STATUS.PAID,
    PAYMENT_STATUS.FAILED,
    PAYMENT_STATUS.REFUNDED,
  ]).optional(),
});
