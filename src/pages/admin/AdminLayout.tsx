import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/ui/Spinner';

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-deep">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAdmin) return <Navigate to="/admin/login" replace />;

  return (
    <div className="min-h-screen bg-bg-deep flex">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      {/* Zone principale */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar mobile */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-4 border-b border-white/10 bg-bg-card">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-muted hover:text-white transition-colors"
          >
            <Menu size={22} />
          </button>
          <span className="font-heading font-semibold text-white">Admin</span>
        </header>

        {/* Contenu page */}
        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
