export type UserRole = 'DROPSHIPPER' | 'DEALER' | 'MARKETING' | 'SALES';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Business ─────────────────────────────────────────────────────────────
export interface Business {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  currency?: string;
  profit_margin?: number | string;
  is_active?: boolean;
  logo?: string;
  address?: string;
  status?: string;
  settings?: {
    tier?: string;
    profit_margin?: number | string;
    [key: string]: any;
  };
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Dealer ───────────────────────────────────────────────────────────────
export interface Dealer {
  id: string;
  user_id: string;
  company_name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  status?: string;
  credit_limit?: number;
  commission_rate?: number;
  business_id?: string;
  businesses?: Business[];
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface BusinessDealer {
  id: string;
  business_id: string;
  dealer_id: string;
  status: string;
  assigned_at: string;
  dealer?: Dealer;
  business?: Business;
}

// ─── Invitation ────────────────────────────────────────────────────────────
export interface DealerInvitation {
  id: string;
  email: string;
  business_id?: string;
  company_name?: string;
  role: 'DEALER' | 'MARKETING' | 'SALES';
  token: string;
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'CANCELLED';
  expires_at: string;
  invited_by: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Product ──────────────────────────────────────────────────────────────
export interface Product {
  id: string;
  business_id?: string;
  dealer_id?: string;
  name: string;
  sku: string;
  description?: string;
  price?: number;
  selling_price?: number | string;
  cost_price?: number | string;
  stock_quantity?: number;
  category?: string;
  image_url?: string;
  images?: string[];
  status?: string;
  is_active?: boolean;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Customer ─────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  business_id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Order ────────────────────────────────────────────────────────────────
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  dealer_id?: string;
  product_name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  business_id: string;
  customer_id: string;
  order_number: string;
  subtotal?: number;
  shipping_fee?: number;
  discount?: number;
  tax?: number;
  total_amount: number;
  shipping_address?: string;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'REFUNDED';
  payment_status?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  notes?: string;
  items?: OrderItem[];
  customer?: Customer;
  business?: Business;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Marketing ────────────────────────────────────────────────────────────
export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  objective?: string;
  type?: string;
  budget: number;
  spent?: number;
  status: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  start_date?: string;
  end_date?: string;
  target_audience?: any;
  created_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface SocialAccount {
  id: string;
  business_id?: string;
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER' | 'YOUTUBE' | 'PINTEREST' | string;
  account_name: string;
  external_account_id?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Post {
  id: string;
  campaign_id?: string;
  social_account_id?: string;
  product_id?: string;
  platform?: string;
  content: string;
  media_url?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduled_at?: string;
  published_at?: string;
  created_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface Ad {
  id: string;
  campaign_id: string;
  social_account_id?: string;
  product_id?: string;
  name: string;
  ad_name?: string;
  platform?: string;
  creative_url?: string;
  budget?: number;
  spend?: number;
  target_audience?: string;
  start_date?: string;
  end_date?: string;
  status: 'ACTIVE' | 'PAUSED' | 'ENDED' | 'DRAFT';
  external_ad_id?: string;
  clicks?: number;
  impressions?: number;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

// ─── Notification ─────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  resource?: string;
  resource_id?: string;
  createdAt?: string;
  created_at?: string;
}

// ─── Audit Log ────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource?: string;
  resource_id?: string;
  entity?: string;
  entity_id?: string;
  ip_address?: string;
  old_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  createdAt?: string;
  created_at?: string;
  user?: { name: string; email: string };
}

// ─── Dashboard ────────────────────────────────────────────────────────────
export interface DropshipperOverview {
  overview?: {
    totalBusinesses: number;
    totalDealers: number;
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentOrders?: Order[];
  total_revenue?: number;
  total_orders?: number;
  total_businesses?: number;
  total_dealers?: number;
  total_products?: number;
  sales_trend?: Array<{ date: string; amount: number }>;
}

export interface DealerDashboardData {
  totalProducts?: number;
  lowStockProducts?: number;
  totalOrdersCount?: number;
  totalEarnings?: number;
  assigned_products?: number;
  pending_orders?: number;
  total_sales?: number;
}

export interface MarketingDashboardData {
  activeCampaigns?: number;
  totalPosts?: number;
  activeAds?: number;
  totalCampaignBudget?: number;
  active_campaigns?: number;
  total_leads?: number;
  conversion_rate?: string | number;
  ad_spend?: number;
}

// ─── Generic API Types ────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  data?: unknown;
}

export type FormState<T> = {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
};

// ─── Returns Management (Section 34, 35) ────────────────────────────────────
export type ReturnStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'PICKUP_SCHEDULED'
  | 'RECEIVED'
  | 'REFUNDED'
  | 'REPLACED'
  | 'CLOSED';

export interface ReturnRecord {
  id: string;
  order_id: string;
  order_number?: string;
  order_item_id?: string;
  business_id: string;
  customer_id?: string;
  customer_name?: string;
  dealer_id?: string;
  dealer_name?: string;
  product_id?: string;
  product_name?: string;
  reason: string;
  status: ReturnStatus;
  requested_date?: string;
  approved_date?: string;
  received_date?: string;
  refund_amount?: number;
  resolution?: string;
  created_at?: string;
  updated_at?: string;
}

// ─── Financial & Expense Management ─────────────────────────────────────────
export type ExpenseCategory =
  | 'Advertising'
  | 'Shipping'
  | 'Packaging'
  | 'Payment Gateway'
  | 'Supplier/Dealer'
  | 'Software'
  | 'Salaries'
  | 'Operations'
  | 'Refunds'
  | 'Returns'
  | 'Other';

export interface Expense {
  id: string;
  business_id: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  reference?: string;
  notes?: string;
  created_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface ExpenseCategorySummary {
  category: ExpenseCategory;
  count: number;
  total_amount: number;
}

export interface ExpenseSummaryResponse {
  total_expenses: number;
  categories: ExpenseCategorySummary[];
}

export interface ProfitSummary {
  totalRevenue: number;
  totalProductCost: number;
  totalShippingCost?: number;
  shippingCost?: number;
  totalGatewayFees?: number;
  gatewayFees?: number;
  totalMarketingSpend?: number;
  marketingSpend?: number;
  totalDiscounts?: number;
  discounts?: number;
  totalRefunds?: number;
  refunds?: number;
  totalReturnCost?: number;
  totalOperatingExpenses?: number;
  totalExpenses: number;
  grossProfit: number;
  grossMargin?: number;
  netProfit: number;
  profitMargin: number;
  averageOrderValue: number;
  orderCount?: number;
  totalOrdersCount?: number;
  orderItemsTotalCount?: number;
  profitPerOrder: number;
  gatewayFeePercentage?: number;
}

export interface ProfitTrendPoint {
  date: string;
  revenue: number;
  productCost?: number;
  expenses: number;
  netProfit?: number;
  profit?: number;
  ordersCount?: number;
  orderCount?: number;
}

export interface ProfitAnalyticsData {
  summary: ProfitSummary;
  timeline: ProfitTrendPoint[];
  expenseBreakdown: ExpenseCategorySummary[];
}

export interface ProductProfitability {
  productId: string;
  productName: string;
  sku: string;
  category?: string;
  dealerName?: string;
  unitsSold: number;
  revenue: number;
  productCost: number;
  shippingCost: number;
  marketingCost: number;
  refunds: number;
  returnCost: number;
  grossProfit: number;
  netProfit: number;
  margin: number;
}

export interface OrderProfitability {
  orderId: string;
  orderNumber: string;
  date: string;
  customerName: string;
  status: string;
  revenue: number;
  productCost: number;
  shipping: number;
  gatewayFee: number;
  marketingCost: number;
  refund: number;
  returnCost: number;
  netProfit: number;
  margin: number;
}

// Typed DOM event helpers
export type InputChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>;

// ─── Inventory Intelligence & Forecasting ────────────────────────────────────
export type InventoryStatus =
  | 'IN_STOCK'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'OVERSTOCKED'
  | 'DEAD_STOCK'
  | 'FAST_MOVING'
  | 'SLOW_MOVING'
  | 'REORDER_RECOMMENDED'
  | 'ALL';

export type InventoryTransactionType =
  | 'STOCK_IN'
  | 'STOCK_OUT'
  | 'ORDER_RESERVED'
  | 'ORDER_RELEASED'
  | 'ORDER_CANCELLED'
  | 'RETURN_RECEIVED'
  | 'ADJUSTMENT'
  | 'DAMAGED'
  | 'LOST';

export interface InventorySummary {
  totalProducts: number;
  totalStockUnits: number;
  totalReservedUnits: number;
  totalAvailableUnits: number;
  totalInventoryValue: number;
  lowStockCount: number;
  lowStockValue: number;
  outOfStockCount: number;
  overstockedCount: number;
  overstockedValue: number;
  deadStockCount: number;
  deadStockValue: number;
  fastMovingCount: number;
  reorderRecommendedCount: number;
}

export interface IntelligentProduct {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockQuantity: number;
  reservedQuantity: number;
  availableStock: number;
  inventoryValue: number;
  dealerId?: string;
  dealerName?: string;
  leadTimeDays: number;
  lowStockThreshold: number;
  reorderLevel: number;
  reorderPoint: number;
  recommendedReorder: number;
  safetyStock: number;
  targetStockDays: number;
  unitsSold: number;
  dailyVelocity: number;
  velocity7d: number;
  velocitySurge: boolean;
  daysRemaining: number | null;
  status: InventoryStatus;
  reorderRecommended: boolean;
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductInventoryDetail {
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    description?: string;
    costPrice: number;
    sellingPrice: number;
    stockQuantity: number;
    reservedQuantity: number;
    availableStock: number;
    inventoryValue: number;
    lowStockThreshold: number;
    reorderLevel: number;
    safetyStock: number;
    targetStockDays: number;
    images: string[];
    status: string;
    createdAt?: string;
    updatedAt?: string;
  };
  dealer: {
    id: string;
    companyName: string;
    leadTimeDays: number;
    contactName?: string;
    email?: string;
    phone?: string;
  };
  salesMetrics: {
    analysisDays: number;
    unitsSoldWindow: number;
    dailySalesVelocity: number;
    sales7d: number;
    velocity7d: number;
    sales14d: number;
    velocity14d: number;
    sales30d: number;
    velocity30d: number;
    sales90d: number;
    velocitySurge: boolean;
  };
  forecasting: {
    daysOfStockRemaining: number | null;
    reorderPointUnits: number;
    recommendedReorderQty: number;
    reorderRecommended: boolean;
    inventoryStatus: InventoryStatus;
    safetyStock: number;
    leadTimeDays: number;
    targetStockDays: number;
    potentialStockoutRisk: boolean;
  };
  salesTrend: Array<{ date: string; unitsSold: number }>;
  recentTransactions: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  business_id?: string;
  product_id: string;
  dealer_id?: string;
  order_id?: string;
  transaction_type: InventoryTransactionType;
  quantity: number;
  previous_quantity: number;
  new_quantity: number;
  reason?: string;
  reference?: string;
  notes?: string;
  created_by?: string;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    cost_price?: number | string;
    selling_price?: number | string;
  };
}

export interface InventoryMovementPoint {
  date: string;
  stockIn: number;
  stockOut: number;
  returns: number;
  adjustments: number;
  netChange: number;
}

export interface StockAdjustmentPayload {
  product_id: string;
  quantity: number;
  transaction_type: 'ADJUSTMENT' | 'DAMAGED' | 'LOST';
  reason: string;
  reference?: string;
  notes?: string;
}

export interface StockInPayload {
  product_id: string;
  quantity: number;
  dealer_id?: string;
  reference?: string;
  notes?: string;
}

// ─── Dealer / Supplier Performance Management ──────────────────────────────
export interface DealerPerformanceSummary {
  totalDealers: number;
  activeDealers: number;
  ordersAssigned: number;
  ordersFulfilled: number;
  pendingFulfillment: number;
  cancelledOrders: number;
  dealerCancelledOrders: number;
  customerCancelledOrders: number;
  returnedOrders: number;
  rtoOrders: number;
  totalRevenue: number;
  totalProductCost: number;
  totalProfit: number;
  profitMargin: number;
  avgDispatchHours: number;
  avgDispatchDays: number;
  overallFulfillmentRate: number;
  overallReturnRate: number;
  overallRtoRate: number;
  overallSlaCompliance: number;
  totalSlaBreaches: number;
}

export interface DealerPerformance {
  id: string;
  user_id: string;
  companyName?: string;
  company_name?: string;
  contactName?: string;
  contact_name?: string;
  email: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  creditLimit?: number;
  credit_limit?: number;
  averageLeadTimeDays?: number;
  average_lead_time_days?: number;
  dispatchSlaHours?: number;
  dispatch_sla_hours?: number;
  fulfillmentSlaHours?: number;
  fulfillment_sla_hours?: number;
  commissionRate?: number;
  commission_rate?: number;
  paymentTerms?: string;
  payment_terms?: string;
  payableBalance?: number;
  payable_balance?: number;
  ratingNotes?: string;
  rating_notes?: string;
  createdAt?: string;
  created_at?: string;

  // Performance Indicators
  totalOrders?: number;
  total_orders?: number;
  totalAssignedOrders?: number;
  total_assigned_orders?: number;
  fulfilledOrders?: number;
  fulfilled_orders?: number;
  deliveredOrders?: number;
  delivered_orders?: number;
  pendingFulfillmentOrders?: number;
  pending_fulfillment_orders?: number;
  totalCancelledOrders?: number;
  total_cancelled_orders?: number;
  dealerCancelledOrders?: number;
  dealer_cancelled_orders?: number;
  customerCancelledOrders?: number;
  customer_cancelled_orders?: number;
  returnedOrders?: number;
  returned_orders?: number;
  rtoOrders?: number;
  rto_orders?: number;
  rtoRate?: number;
  rto_rate?: number;
  rtoCost?: number;
  rto_cost?: number;
  fulfillmentRate?: number;
  fulfillment_rate?: number;
  dealerCancellationRate?: number;
  dealer_cancellation_rate?: number;
  returnRate?: number;
  return_rate?: number;
  avgDispatchHours?: number;
  avg_dispatch_hours?: number;
  avgDispatchDays?: number;
  avg_dispatch_days?: number;
  slaBreaches?: number;
  sla_breaches?: number;
  slaBreachedCount?: number;
  sla_breached_count?: number;
  slaComplianceRate?: number;
  sla_compliance_rate?: number;

  // Stock & Products
  totalProducts?: number;
  total_products?: number;
  totalStock?: number;
  total_stock?: number;
  availableStock?: number;
  available_stock?: number;
  reservedStock?: number;
  reserved_stock?: number;
  inventoryValue?: number;
  inventory_value?: number;
  lowStockProductsCount?: number;
  low_stock_products_count?: number;
  outOfStockProducts?: number;
  out_of_stock_products?: number;
  outOfStockProductsCount?: number;
  out_of_stock_products_count?: number;
  stockAvailabilityRate?: number;
  stock_availability_rate?: number;

  // SLA Details
  sla_dispatch_days?: number;
  sla_delivery_days?: number;
  sla_return_window?: number;

  // Financials
  revenue: number;
  supplierCost?: number;
  supplier_cost?: number;
  profit: number;
  profitMargin?: number;
  profit_margin?: number;
  refundsTotal?: number;
  avgOrderValue?: number;
  commissionEarned?: number;
  netPayable?: number;
  pendingPayouts?: number;

  // Return Reasons Breakdown
  returnBreakdown?: {
    damaged?: number;
    defective?: number;
    wrongItem?: number;
    quality?: number;
    changedMind?: number;
  };
}

export interface DealerProductItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice?: number;
  cost_price?: number;
  sellingPrice?: number;
  selling_price?: number;
  stockQuantity?: number;
  stock_quantity?: number;
  reservedQuantity?: number;
  reserved_quantity?: number;
  availableStock?: number;
  available_stock?: number;
  unitsSold?: number;
  units_sold?: number;
  revenue: number;
  returnsCount?: number;
  returns_count?: number;
  images: string[];
  status: string;
}

export interface DealerOrderItem {
  id: string;
  orderNumber?: string;
  order_number?: string;
  status: string;
  totalAmount?: number;
  total_amount?: number;
  paymentStatus?: string;
  payment_status?: string;
  createdAt?: string;
  created_at?: string;
  assignedAt?: string;
  assigned_at?: string;
  dispatchedAt?: string;
  dispatched_at?: string;
  customerName?: string;
  customer_name?: string;
  itemsCount?: number;
  totalUnits?: number;
  slaDeadline?: string;
  secondsRemaining?: number;
  isBreached?: boolean;
}

export interface DealerTrendPoint {
  date: string;
  orders: number;
  fulfilled: number;
  revenue: number;
  profit: number;
  rto: number;
}

export interface DealerPerformanceDetail {
  dealer: DealerPerformance;
  products: DealerProductItem[];
  ordersQueue: DealerOrderItem[];
  trends: DealerTrendPoint[];
}

export interface DealerComparisonData {
  dealers: DealerPerformance[];
  comparedCount: number;
}

export interface DealerSlaUpdatePayload {
  dispatch_sla_hours?: number;
  fulfillment_sla_hours?: number;
  average_lead_time_days?: number;
  payment_terms?: string;
  commission_rate?: number;
  credit_limit?: number;
  rating_notes?: string;
}

// ─── FEATURE 5: PRODUCT INTELLIGENCE & RESEARCH ───────────────────────────

export type ProductClassification =
  | 'HIGH_DEMAND'
  | 'LOW_DEMAND'
  | 'NO_SALES'
  | 'FAST_MOVING'
  | 'SLOW_MOVING'
  | 'OVERSTOCKED'
  | 'LOW_STOCK'
  | 'OUT_OF_STOCK'
  | 'PROFITABLE'
  | 'LOSS_MAKING'
  | 'HIGH_RETURN'
  | 'HIGH_RTO';

export type ResearchStatus =
  | 'IDEA'
  | 'RESEARCHING'
  | 'READY_TO_TEST'
  | 'TESTING'
  | 'APPROVED'
  | 'REJECTED';

export interface ProductIntelligenceSummary {
  totalProducts: number;
  activeProducts: number;
  productsWithSales: number;
  productsWithNoSales: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  highReturnProducts: number;
  highRtoProducts: number;
  profitableProducts: number;
  lossMakingProducts: number;
  totalRevenue: number;
  totalNetProfit: number;
  averageMarginPercent: number;
  timeframe: string;
  periodDays: number;
  startDate: string;
  endDate: string;
}

export interface ProductOpportunityItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  images: string[];
  status: string;
  business_id?: string;
  dealer_id?: string;
  dealer?: {
    id: string;
    name: string;
    email?: string;
    leadTimeDays: number;
    fulfillmentRate: number;
  };
  selling_price: number;
  cost_price: number;
  stock_quantity: number;
  reserved_quantity: number;
  available_stock: number;
  low_stock_threshold?: number;
  reorder_level?: number;
  target_stock_days?: number;
  orders_count: number;
  units_sold: number;
  revenue: number;
  cogs: number;
  gross_profit: number;
  net_profit: number;
  profit_margin: number;
  return_count: number;
  return_rate: number;
  rto_count: number;
  rto_rate: number;
  sales_velocity: number;
  days_of_stock: number;
  classifications: ProductClassification[];
}

export interface ProductTrendPoint {
  date: string;
  orders: number;
  units: number;
  revenue: number;
  profit: number;
}

export interface ProductSupplierInfo {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  leadTimeDays: number;
  fulfillmentRate: number;
  costPrice: number;
  shippingEstimate: number;
  totalFulfillmentCost: number;
  estimatedMargin: number;
  isCurrentSupplier: boolean;
  status: string;
}

export interface ProductDetailIntelligence {
  product: Product & { available_stock: number };
  sales: {
    ordersCount: number;
    unitsSold: number;
    revenue: number;
    salesVelocity: number;
    trend: ProductTrendPoint[];
    recentOrders: any[];
  };
  profitability: {
    revenue: number;
    cogs: number;
    grossProfit: number;
    gatewayFee: number;
    shippingCost: number;
    returnCost: number;
    marketingCost: number;
    netProfit: number;
    profitMargin: number;
  };
  inventory: {
    stockQuantity: number;
    reservedQuantity: number;
    availableStock: number;
    lowStockThreshold: number;
    reorderLevel: number;
    safetyStock: number;
    targetStockDays: number;
    salesVelocity: number;
    daysOfStockRemaining: number;
    calculatedReorderPoint: number;
    recommendedReorderQuantity: number;
    movementHistory: any[];
  };
  dealer: {
    assigned?: ProductSupplierInfo | null;
    allSuppliers: ProductSupplierInfo[];
  };
  returns: {
    returnCount: number;
    returnRate: number;
    rtoCount: number;
    rtoRate: number;
    refundTotal: number;
    reasonsBreakdown: { reason: string; count: number; percentage: number }[];
  };
  research?: {
    id: string;
    source?: string;
    notes?: string;
    tags?: string[];
    targetAudience?: string;
    competitorPrice?: number;
    status?: ResearchStatus;
  } | null;
}

export interface ProductResearchItem {
  id: string;
  business_id?: string;
  product_name: string;
  product_url?: string;
  category: string;
  dealer_id?: string;
  source?: string;
  estimated_cost: number | string;
  expected_selling_price: number | string;
  estimated_shipping_cost: number | string;
  estimated_marketing_cost: number | string;
  estimated_units: number;
  competitor_price?: number | string | null;
  target_audience?: string | null;
  status: ResearchStatus;
  notes?: string | null;
  tags?: string[];
  converted_product_id?: string | null;
  created_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  estimated_revenue: number;
  estimated_gross_profit: number;
  estimated_net_profit: number;
  estimated_margin_percent: number;
}

export interface ProductResearchPayload {
  product_name: string;
  product_url?: string;
  category: string;
  dealer_id?: string;
  business_id?: string;
  source?: string;
  estimated_cost: number;
  expected_selling_price: number;
  estimated_shipping_cost?: number;
  estimated_marketing_cost?: number;
  estimated_units?: number;
  competitor_price?: number | null;
  target_audience?: string;
  status?: ResearchStatus;
  notes?: string;
  tags?: string[];
}

export interface ProductConversionPayload {
  sku?: string;
  description?: string;
  stock_quantity?: number;
  low_stock_threshold?: number;
  reorder_level?: number;
  images?: string[];
  dealer_id?: string;
  business_id?: string;
  cost_price?: number;
  selling_price?: number;
}



