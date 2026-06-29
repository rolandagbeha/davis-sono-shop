import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { CartItem } from './CartItem';
import { formatFCFA } from '../../utils/formatPrice';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';

export function CartDrawer() {
  const { items, isOpen, closeCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 z-50 bg-bg-card border-l border-white/10 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShoppingCart size={20} className="text-gold" />
                <h2 className="font-heading font-semibold text-white">
                  Panier ({totalItems})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="text-muted hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Articles */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingCart size={48} />}
                  title="Panier vide"
                  description="Explorez notre catalogue pour trouver votre bonheur !"
                  action={{ label: 'Voir le catalogue', onClick: () => { closeCart(); navigate('/catalogue'); } }}
                />
              ) : (
                <div>
                  {items.map(item => (
                    <CartItem key={item.product.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer avec total */}
            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted">Sous-total</span>
                  <span className="price text-lg">{formatFCFA(totalPrice)}</span>
                </div>
                <p className="text-xs text-muted">
                  Frais de livraison calculés lors du checkout
                </p>
                <Button
                  onClick={handleCheckout}
                  fullWidth
                  size="lg"
                  icon={<ArrowRight size={18} />}
                >
                  Passer la commande
                </Button>
                <Button
                  variant="ghost"
                  onClick={closeCart}
                  fullWidth
                  className="text-muted justify-center"
                >
                  Continuer les achats
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
