import { inventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../../shared/utils/apiResponse.js';

export const inventoryController = {
  async getSummary(req, res, next) {
    try {
      const summary = await inventoryService.getInventorySummary(req.query, req.user);
      return sendSuccess(res, 'Inventory summary metrics retrieved successfully', summary);
    } catch (error) {
      next(error);
    }
  },

  async getProducts(req, res, next) {
    try {
      const { products, pagination } = await inventoryService.getInventoryList(req.query, req.user);
      return sendSuccess(res, 'Inventory products and forecast retrieved successfully', products, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getProductDetail(req, res, next) {
    try {
      const detail = await inventoryService.getProductInventoryDetail(req.params.id, req.query, req.user);
      return sendSuccess(res, 'Product inventory intelligence details retrieved successfully', detail);
    } catch (error) {
      next(error);
    }
  },

  async getTransactions(req, res, next) {
    try {
      const { transactions, pagination } = await inventoryService.getTransactions(req.query, req.user);
      return sendSuccess(res, 'Inventory movement transactions retrieved successfully', transactions, 200, pagination);
    } catch (error) {
      next(error);
    }
  },

  async getMovementTrend(req, res, next) {
    try {
      const trend = await inventoryService.getMovementTrend(req.query);
      return sendSuccess(res, 'Inventory daily movement trend retrieved successfully', trend);
    } catch (error) {
      next(error);
    }
  },

  async adjustStock(req, res, next) {
    try {
      const result = await inventoryService.adjustStock(req.body, req.user);
      return sendSuccess(res, 'Inventory stock adjusted successfully', result);
    } catch (error) {
      next(error);
    }
  },

  async stockIn(req, res, next) {
    try {
      const result = await inventoryService.stockIn(req.body, req.user);
      return sendSuccess(res, 'Stock-in recorded successfully', result);
    } catch (error) {
      next(error);
    }
  },
};
