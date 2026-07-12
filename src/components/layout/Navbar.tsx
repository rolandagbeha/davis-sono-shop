import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const NAV_LINKS = [
  { href: '/',          label: 'Accueil'   },
  { href: '/catalogue', label: 'Catalogue' },
  { href: '/services',  label: 'Services'  },
  { href: '/devis',     label: 'Devis'     },
  { href: '/suivi',     label: 'Suivi'     },
];

export function Navbar() {
  const { totalItems, openCart } = useCart();
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'glass border-b border-white/10 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.jpg"
                alt="Davis Sono Shop"
                className="w-9 h-9 rounded-xl bg-white group-hover:opacity-90 transition-opacity"
              />
              <span className="font-heading font-bold text-lg">
                <span className="text-gold">Davis</span>
                <span className="text-white"> Sono</span>
              </span>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-btn font-heading font-medium text-sm transition-colors duration-200 ${
                      isActive
                        ? 'text-gold'
                        : 'text-muted hover:text-white'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Panier */}
              <button
                onClick={openCart}
                className="relative p-2 text-muted hover:text-gold transition-colors"
                aria-label="Ouvrir le panier"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gold text-bg-deep text-xs font-heading font-bold rounded-full flex items-center justify-center"
                  >
                    {totalItems > 9 ? '9+' : totalItems}
                  </motion.span>
                )}
              </button>

              {/* Menu mobile */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                className="md:hidden p-2 text-muted hover:text-white transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-72 bg-bg-card border-l border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <span className="font-heading font-bold text-gold">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex-1 p-6 space-y-2">
              {NAV_LINKS.map(link => (
                <NavLink
                  key={link.href}
                  to={link.href}
                  end={link.href === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-btn font-heading font-medium transition-colors ${
                      isActive
                        ? 'bg-gold/10 text-gold'
                        : 'text-muted hover:text-white hover:bg-bg-surface'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>
    </>
  );
}
