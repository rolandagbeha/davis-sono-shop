import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, MessageCircle, ShoppingBag, Home } from 'lucide-react';
import type { Order } from '../types';
import { formatFCFA } from '../utils/formatPrice';
import { confirmOrderToClient } from '../lib/whatsapp';

export default function OrderConfirmation() {
  const location = useLocation();
  const order    = location.state?.order as Order | undefined;

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-heading font-bold text-white">Commande introuvable</h1>
        <Link to="/" className="btn-primary">Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center pt-20 pb-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <div className="card p-8 text-center">
          {/* Icône succès */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-green-500/20 rounded-full mb-6"
          >
            <CheckCircle size={48} className="text-green-400" />
          </motion.div>

          <h1 className="text-3xl font-heading font-bold text-white mb-2">
            Commande confirmée !
          </h1>
          <p className="text-muted mb-6">
            Merci {order.client_name}, votre commande a été enregistrée avec succès.
          </p>

          {/* Numéro commande */}
          <div className="bg-bg-surface rounded-card p-4 mb-6">
            <p className="text-muted text-sm mb-1">Numéro de commande</p>
            <p className="font-mono text-2xl font-bold text-gold">{order.order_number}</p>
          </div>

          {/* Résumé */}
          <div className="text-left space-y-3 mb-8">
            {order.items.map(item => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span className="text-muted">{item.product_name} x{item.quantity}</span>
                <span className="text-white">{formatFCFA(item.subtotal)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-3 flex justify-between font-semibold">
              <span className="text-white">Total</span>
              <span className="price text-lg">{formatFCFA(order.total)}</span>
            </div>
          </div>

          <p className="text-muted text-sm mb-8">
            Notre équipe vous contactera sous peu au{' '}
            <span className="text-white font-mono">{order.client_phone}</span>{' '}
            pour organiser la livraison.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => confirmOrderToClient(order, order.client_phone)}
              className="btn-whatsapp w-full justify-center"
            >
              <MessageCircle size={18} />
              Partager sur WhatsApp
            </button>
            <Link to="/catalogue" className="btn-secondary w-full justify-center">
              <ShoppingBag size={18} />
              Continuer mes achats
            </Link>
            <Link to="/" className="btn-ghost w-full justify-center text-muted">
              <Home size={18} />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
