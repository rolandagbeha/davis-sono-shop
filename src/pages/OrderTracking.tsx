import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Package, Loader2, CheckCircle, Clock, Truck, XCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatFCFA } from '../utils/formatPrice';
import type { Order, OrderStatus } from '../types';
import { Link } from 'react-router-dom';

const STATUS_STEPS: { status: OrderStatus; label: string; icon: React.ElementType }[] = [
  { status: 'pending',   label: 'En attente',       icon: Clock       },
  { status: 'confirmed', label: 'Confirmée',         icon: CheckCircle },
  { status: 'preparing', label: 'En préparation',    icon: Package     },
  { status: 'shipped',   label: 'Expédiée',          icon: Truck       },
  { status: 'delivered', label: 'Livrée',            icon: CheckCircle },
];

const ORDER_FLOW: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered'];

function getStepIndex(status: OrderStatus) {
  return ORDER_FLOW.indexOf(status);
}

export default function OrderTracking() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone,       setPhone]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [order,       setOrder]       = useState<Order | null>(null);
  const [error,       setError]       = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber.trim().toUpperCase())
        .eq('client_phone', phone.trim())
        .single();

      if (err || !data) {
        setError('Commande introuvable. Vérifiez le numéro et le téléphone.');
      } else {
        setOrder(data as Order);
      }
    } catch {
      setError('Erreur de connexion. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const isCancelled = order?.status === 'cancelled';
  const currentStep = order ? getStepIndex(order.status) : -1;

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center">
              <Search size={24} className="text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">Suivi de commande</h1>
              <p className="text-muted">Retrouvez l'état de votre commande</p>
            </div>
          </div>

          {/* Formulaire recherche */}
          <form onSubmit={handleSearch} className="card p-6 space-y-4 mb-6">
            <div>
              <label className="block text-sm text-muted mb-2">Numéro de commande</label>
              <input
                className="input font-mono tracking-wider"
                placeholder="Ex : CMD-2026-001"
                value={orderNumber}
                onChange={e => setOrderNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-2">Votre numéro de téléphone</label>
              <input
                className="input"
                placeholder="98 42 32 32"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
              {loading ? 'Recherche…' : 'Rechercher ma commande'}
            </button>
          </form>

          {/* Erreur */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="card p-4 border-red-500/30 bg-red-500/5 flex items-center gap-3 mb-6"
              >
                <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Résultat */}
          <AnimatePresence>
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* En-tête commande */}
                <div className="card p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-muted text-xs mb-1">Numéro de commande</p>
                      <p className="font-mono text-xl font-bold text-gold">{order.order_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted text-xs mb-1">Total</p>
                      <p className="price text-lg">{formatFCFA(order.total)}</p>
                    </div>
                  </div>
                  <p className="text-muted text-xs">
                    Passée le {new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>

                {/* Progression */}
                {isCancelled ? (
                  <div className="card p-5 border-red-500/30 bg-red-500/5 flex items-center gap-3">
                    <XCircle size={24} className="text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-white font-semibold">Commande annulée</p>
                      <p className="text-muted text-sm">Contactez-nous pour plus d'informations.</p>
                    </div>
                  </div>
                ) : (
                  <div className="card p-5">
                    <h3 className="font-heading font-semibold text-white mb-5">Progression</h3>
                    <div className="relative">
                      {/* Barre de progression */}
                      <div className="absolute top-5 left-5 right-5 h-0.5 bg-white/10">
                        <div
                          className="h-full bg-gold transition-all duration-700"
                          style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between relative">
                        {STATUS_STEPS.map((step, i) => {
                          const done    = i <= currentStep;
                          const active  = i === currentStep;
                          const StepIcon = step.icon;
                          return (
                            <div key={step.status} className="flex flex-col items-center gap-2 w-16">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all z-10 ${
                                active  ? 'bg-gold text-bg-deep shadow-gold scale-110' :
                                done    ? 'bg-gold/30 text-gold' :
                                          'bg-bg-surface text-muted border border-white/10'
                              }`}>
                                <StepIcon size={16} />
                              </div>
                              <span className={`text-[10px] text-center leading-tight ${
                                active ? 'text-gold font-semibold' : done ? 'text-white' : 'text-muted'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Articles */}
                <div className="card p-5">
                  <h3 className="font-heading font-semibold text-white mb-4">Articles commandés</h3>
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.product_id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {item.product_image && (
                            <img src={item.product_image} alt={item.product_name} className="w-10 h-10 rounded-lg object-cover" />
                          )}
                          <div>
                            <p className="text-white text-sm font-medium">{item.product_name}</p>
                            <p className="text-muted text-xs">x{item.quantity} · {formatFCFA(item.price)} l'unité</p>
                          </div>
                        </div>
                        <p className="text-white text-sm font-mono">{formatFCFA(item.subtotal)}</p>
                      </div>
                    ))}
                    <div className="border-t border-white/10 pt-3 space-y-1">
                      <div className="flex justify-between text-sm text-muted">
                        <span>Sous-total</span>
                        <span>{formatFCFA(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted">
                        <span>Livraison</span>
                        <span>{order.delivery_fee > 0 ? formatFCFA(order.delivery_fee) : 'Gratuit'}</span>
                      </div>
                      <div className="flex justify-between text-base font-semibold pt-1">
                        <span className="text-white">Total</span>
                        <span className="price">{formatFCFA(order.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link to="/catalogue" className="btn-secondary flex-1 justify-center">
                    Voir le catalogue
                  </Link>
                  <a
                    href={`https://wa.me/22898423232?text=Bonjour, je voudrais des infos sur ma commande ${order.order_number}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp flex-1 justify-center"
                  >
                    Contacter le vendeur
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
