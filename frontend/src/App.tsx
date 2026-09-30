import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Spinner } from './components/common/Spinner';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LoginPage } from './pages/auth/LoginPage';

// Static Role Permission Arrays (Avoid new array allocations on every render)
const DROPSHIPPER_ROLE = ['DROPSHIPPER'] as const;
const DEALER_ROLE = ['DEALER'] as const;
const MARKETING_ROLES = ['MARKETING', 'DROPSHIPPER'] as const;
const SALES_ROLES = ['SALES', 'DROPSHIPPER'] as const;

// Helper to auto-retry dynamic imports if Vite HMR or browser cache dropped a chunk
function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(() =>
    factory().catch((error) => {
      const msg = error?.message || '';
      if (
        msg.includes('Failed to fetch dynamically imported module') ||
        msg.includes('Importing a module script failed')
      ) {
        const storageKey = 'vite_chunk_reload_timestamp';
        const lastReload = sessionStorage.getItem(storageKey);
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem(storageKey, String(now));
          window.location.reload();
        }
      }
      throw error;
    })
  );
}

// Lazy-loaded Authentication Pages
const AcceptInvitePage = lazyWithRetry(() =>
  import('./pages/auth/AcceptInvitePage').then((m) => ({ default: m.AcceptInvitePage }))
);

// Lazy-loaded Admin Pages
const AdminDashboard = lazyWithRetry(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const BusinessesPage = lazyWithRetry(() =>
  import('./pages/admin/BusinessesPage').then((m) => ({ default: m.BusinessesPage }))
);
const TeamPage = lazyWithRetry(() =>
  import('./pages/admin/TeamPage').then((m) => ({ default: m.TeamPage }))
);
const ProductsPage = lazyWithRetry(() =>
  import('./pages/admin/ProductsPage').then((m) => ({ default: m.ProductsPage }))
);
const OrdersPage = lazyWithRetry(() =>
  import('./pages/admin/OrdersPage').then((m) => ({ default: m.OrdersPage }))
);
const CustomersPage = lazyWithRetry(() =>
  import('./pages/admin/CustomersPage').then((m) => ({ default: m.CustomersPage }))
);
const DealersPage = lazyWithRetry(() =>
  import('./pages/admin/DealersPage').then((m) => ({ default: m.DealersPage }))
);
const NotificationsPage = lazyWithRetry(() =>
  import('./pages/admin/NotificationsPage').then((m) => ({ default: m.NotificationsPage }))
);
const AuditLogsPage = lazyWithRetry(() =>
  import('./pages/admin/AuditLogsPage').then((m) => ({ default: m.AuditLogsPage }))
);
const AnalyticsPage = lazyWithRetry(() =>
  import('./pages/admin/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage }))
);
const ReturnsPage = lazyWithRetry(() =>
  import('./pages/admin/ReturnsPage').then((m) => ({ default: m.ReturnsPage }))
);
const FinancesPage = lazyWithRetry(() =>
  import('./pages/admin/FinancesPage').then((m) => ({ default: m.FinancesPage }))
);
const InventoryPage = lazyWithRetry(() =>
  import('./pages/admin/InventoryPage').then((m) => ({ default: m.InventoryPage }))
);
const ProductIntelligencePage = lazyWithRetry(() =>
  import('./pages/admin/ProductIntelligencePage').then((m) => ({ default: m.ProductIntelligencePage }))
);
const DealerDetailPage = lazyWithRetry(() =>
  import('./pages/admin/dealers/DealerDetailPage').then((m) => ({ default: m.DealerDetailPage }))
);

// Lazy-loaded Dealer Pages
const DealerDashboard = lazyWithRetry(() =>
  import('./pages/dealer/DealerDashboard').then((m) => ({ default: m.DealerDashboard }))
);
const DealerProductsPage = lazyWithRetry(() =>
  import('./pages/dealer/DealerProductsPage').then((m) => ({ default: m.DealerProductsPage }))
);
const DealerOrdersPage = lazyWithRetry(() =>
  import('./pages/dealer/DealerOrdersPage').then((m) => ({ default: m.DealerOrdersPage }))
);
const DealerCustomersPage = lazyWithRetry(() =>
  import('./pages/dealer/DealerCustomersPage').then((m) => ({ default: m.DealerCustomersPage }))
);

// Lazy-loaded Marketing Pages
const MarketingDashboard = lazyWithRetry(() =>
  import('./pages/marketing/MarketingDashboard').then((m) => ({ default: m.MarketingDashboard }))
);
const CampaignStudioPage = lazyWithRetry(() =>
  import('./pages/marketing/campaign-studio/CampaignStudioPage').then((m) => ({ default: m.CampaignStudioPage }))
);
const SocialAccountsPage = lazyWithRetry(() =>
  import('./pages/marketing/SocialAccountsPage').then((m) => ({ default: m.SocialAccountsPage }))
);
const AiCreativeStudioPage = lazyWithRetry(() =>
  import('./pages/marketing/AiCreativeStudioPage').then((m) => ({ default: m.AiCreativeStudioPage }))
);
const RetailPosterStudioPage = lazyWithRetry(() =>
  import('./pages/marketing/RetailPosterStudioPage').then((m) => ({ default: m.RetailPosterStudioPage }))
);
const ProductVideoStudioPage = lazyWithRetry(() =>
  import('./pages/marketing/ProductVideoStudioPage').then((m) => ({ default: m.ProductVideoStudioPage }))
);

// Fallback & 404
const NotFoundPage = lazyWithRetry(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
    <Spinner size="lg" />
    <span className="text-slate-400 text-xs font-semibold mt-3 tracking-wider uppercase">
      Loading view...
    </span>
  </div>
);

export function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />

            {/* Protected Application Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                {/* Dropshipper Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={DROPSHIPPER_ROLE as any} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/businesses" element={<BusinessesPage />} />
                  <Route path="/admin/team" element={<TeamPage />} />
                  <Route path="/admin/digital-marketers" element={<TeamPage />} />
                  <Route path="/admin/sales-team" element={<TeamPage />} />
                  <Route path="/admin/sales" element={<TeamPage />} />
                  <Route path="/admin/products" element={<ProductsPage />} />
                  <Route path="/admin/product-intelligence" element={<ProductIntelligencePage />} />
                  <Route path="/admin/product-research" element={<ProductIntelligencePage />} />
                  <Route path="/admin/orders" element={<OrdersPage />} />
                  <Route path="/admin/customers" element={<CustomersPage />} />
                  <Route path="/admin/dealers" element={<DealersPage />} />
                  <Route path="/admin/dealers/:id" element={<DealerDetailPage />} />
                  <Route path="/admin/returns" element={<ReturnsPage />} />
                  <Route path="/admin/finances" element={<FinancesPage />} />
                  <Route path="/admin/inventory" element={<InventoryPage />} />
                  <Route path="/admin/notifications" element={<NotificationsPage />} />
                  <Route path="/admin/audit-logs" element={<AuditLogsPage />} />
                  <Route path="/admin/campaigns" element={<CampaignStudioPage />} />
                  <Route path="/admin/campaigns/:id" element={<CampaignStudioPage />} />
                  <Route path="/admin/campaigns/:id/edit" element={<CampaignStudioPage />} />
                  <Route path="/admin/campaign-studio" element={<CampaignStudioPage />} />
                  <Route path="/admin/analytics" element={<AnalyticsPage />} />
                  <Route path="/admin/ai-studio" element={<AiCreativeStudioPage />} />
                  <Route path="/admin/poster-studio" element={<RetailPosterStudioPage />} />
                  <Route path="/admin/video-studio" element={<ProductVideoStudioPage />} />
                </Route>

                {/* Dealer Routes */}
                <Route element={<ProtectedRoute allowedRoles={DEALER_ROLE as any} />}>
                  <Route path="/dealer" element={<DealerDashboard />} />
                  <Route path="/dealer/products" element={<DealerProductsPage />} />
                  <Route path="/dealer/inventory" element={<InventoryPage />} />
                  <Route path="/dealer/orders" element={<DealerOrdersPage />} />
                  <Route path="/dealer/returns" element={<ReturnsPage />} />
                  <Route path="/dealer/customers" element={<DealerCustomersPage />} />
                </Route>

                {/* Marketing Routes */}
                <Route element={<ProtectedRoute allowedRoles={MARKETING_ROLES as any} />}>
                  <Route path="/marketing" element={<MarketingDashboard />} />
                  <Route path="/marketing/products" element={<ProductsPage />} />
                  <Route path="/marketing/campaigns" element={<CampaignStudioPage />} />
                  <Route path="/marketing/campaigns/:id" element={<CampaignStudioPage />} />
                  <Route path="/marketing/campaigns/:id/edit" element={<CampaignStudioPage />} />
                  <Route path="/marketing/campaign-studio" element={<CampaignStudioPage />} />
                  <Route path="/marketing/social" element={<SocialAccountsPage />} />
                  <Route path="/marketing/posts" element={<Navigate to="/marketing/campaigns" replace />} />
                  <Route path="/marketing/ads" element={<Navigate to="/marketing/campaigns" replace />} />
                  <Route path="/marketing/ai-studio" element={<Navigate to="/marketing/campaigns" replace />} />
                </Route>

                {/* Sales Team Routes */}
                <Route element={<ProtectedRoute allowedRoles={SALES_ROLES as any} />}>
                  <Route path="/sales" element={<Navigate to="/sales/orders" replace />} />
                  <Route path="/sales/orders" element={<OrdersPage />} />
                  <Route path="/sales/customers" element={<CustomersPage />} />
                  <Route path="/sales/returns" element={<ReturnsPage />} />
                  <Route path="/sales/dealers" element={<DealersPage />} />
                </Route>

                {/* Index Redirection */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
              </Route>
            </Route>

            {/* 404 Catch All */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
