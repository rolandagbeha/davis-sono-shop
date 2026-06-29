import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';

import { CartProvider }   from './context/CartContext';
import { AuthProvider }   from './context/AuthContext';
import { Navbar }         from './components/layout/Navbar';
import { Footer }         from './components/layout/Footer';
import { CartDrawer }     from './components/cart/CartDrawer';
import { Spinner }        from './components/ui/Spinner';

// Pages publiques
import Home              from './pages/Home';
import Catalogue         from './pages/Catalogue';
import ProductDetail     from './pages/ProductDetail';
import Checkout          from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import DevisRequest      from './pages/DevisRequest';
import Services          from './pages/Services';
import OrderTracking     from './pages/OrderTracking';
import NotFound          from './pages/NotFound';

// Pages admin (lazy-loaded)
const AdminLogin     = lazy(() => import('./pages/admin/Login'));
const AdminLayout    = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts  = lazy(() => import('./pages/admin/Products'));
const AdminOrders    = lazy(() => import('./pages/admin/Orders'));
const AdminDevis     = lazy(() => import('./pages/admin/Devis'));
const AdminClients   = lazy(() => import('./pages/admin/Clients'));
const AdminInventory = lazy(() => import('./pages/admin/Inventory'));
const AdminSettings  = lazy(() => import('./pages/admin/Settings'));

// Layout boutique publique
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <CartDrawer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3500,
              style: {
                background: '#0F1535',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                fontFamily: '"Space Grotesk", sans-serif',
              },
            }}
          />

          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center bg-bg-deep">
                <Spinner size="lg" />
              </div>
            }
          >
            <Routes>
              {/* ── Boutique publique ── */}
              <Route path="/" element={
                <PublicLayout>
                  <Home />
                </PublicLayout>
              } />
              <Route path="/catalogue" element={
                <PublicLayout>
                  <Catalogue />
                </PublicLayout>
              } />
              <Route path="/produit/:slug" element={
                <PublicLayout>
                  <ProductDetail />
                </PublicLayout>
              } />
              <Route path="/checkout" element={
                <PublicLayout>
                  <Checkout />
                </PublicLayout>
              } />
              <Route path="/confirmation/:orderNumber" element={
                <PublicLayout>
                  <OrderConfirmation />
                </PublicLayout>
              } />
              <Route path="/devis" element={
                <PublicLayout>
                  <DevisRequest />
                </PublicLayout>
              } />
              <Route path="/services" element={
                <PublicLayout>
                  <Services />
                </PublicLayout>
              } />
              <Route path="/suivi" element={
                <PublicLayout>
                  <OrderTracking />
                </PublicLayout>
              } />

              {/* ── Admin ── */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products"  element={<AdminProducts />} />
                <Route path="orders"    element={<AdminOrders />} />
                <Route path="devis"     element={<AdminDevis />} />
                <Route path="clients"   element={<AdminClients />} />
                <Route path="inventory" element={<AdminInventory />} />
                <Route path="settings"  element={<AdminSettings />} />
              </Route>

              {/* ── 404 ── */}
              <Route path="*" element={
                <PublicLayout>
                  <NotFound />
                </PublicLayout>
              } />
            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
