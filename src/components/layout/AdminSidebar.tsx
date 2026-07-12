import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, FileText,
  Users, Archive, Settings, LogOut, X, BotMessageSquare,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/admin',           label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { href: '/admin/products',  label: 'Produits',     icon: Package },
  { href: '/admin/orders',    label: 'Commandes',    icon: ShoppingBag },
  { href: '/admin/devis',     label: 'Devis',        icon: FileText },
  { href: '/admin/clients',   label: 'Clients',      icon: Users },
  { href: '/admin/inventory', label: 'Stock',        icon: Archive },
  { href: '/admin/assistant', label: 'Assistant IA', icon: BotMessageSquare },
  { href: '/admin/settings',  label: 'Parametres',   icon: Settings },
];

interface AdminSidebarProps {
  mobileOpen:   boolean;
  onClose:      () => void;
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { signOut } = useAuth();
  const navigate    = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Deconnecte avec succes');
      navigate('/admin/login');
    } catch {
      toast.error('Erreur lors de la deconnexion');
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.jpg" alt="Davis Sono Shop" className="w-9 h-9 rounded-lg bg-white object-cover" />
          <div>
            <div className="font-heading font-bold text-sm text-white">Davis Sono</div>
            <div className="text-xs text-muted">Administration</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-muted hover:text-white lg:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Deconnexion */}
      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleSignOut}
          className="admin-nav-link w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          <span>Deconnexion</span>
        </button>
      </div>
    </div>
  );
}

export function AdminSidebar({ mobileOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-64 flex-col bg-bg-card border-r border-white/10 fixed left-0 top-0 h-full z-30">
        <SidebarContent />
      </aside>

      {/* Sidebar mobile (drawer) */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-64 bg-bg-card border-r border-white/10 z-50 lg:hidden"
            >
              <SidebarContent onClose={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
