import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, User, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { orderService } from '../hooks/useOrders';
import { formatFCFA } from '../utils/formatPrice';
import { generateOrderNumber } from '../utils/orderNumber';
import { notifyManagerNewOrder } from '../lib/whatsapp';
import { validatePhone, validateEmail } from '../utils/validators';
import type { CheckoutData, PaymentMethod } from '../types';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, label: 'Vos informations', icon: User },
  { id: 2, label: 'Livraison',        icon: MapPin },
  { id: 3, label: 'Paiement',         icon: CreditCard },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string }[] = [
  { value: 'cash',       label: 'Paiement a la livraison', icon: '💵' },
  { value: 'moov_money', label: 'Moov Money',              icon: '📱' },
  { value: 't_money',    label: 'T-Money',                 icon: '📱' },
  { value: 'flooz',      label: 'Flooz',                   icon: '📱' },
  { value: 'virement',   label: 'Virement bancaire',       icon: '🏦' },
];

const NEIGHBORHOODS = [
  'Lome Centre', 'Be', 'Kodjoviakope', 'Agbalepedogan',
  'Adidogome', 'Agoe', 'Novissi', 'Tokoin', 'Baguida',
  'Aflao', 'Autre',
];

const DELIVERY_FEE = 2000;

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const navigate  = useNavigate();
  const [step,    setStep]      = useState(1);
  const [loading, setLoading]   = useState(false);

  const [data, setData] = useState<CheckoutData>({
    client_name:           '',
    client_phone:          '',
    client_email:          '',
    client_address:        '',
    client_neighborhood:   '',
    delivery_instructions: '',
    payment_method:        'cash',
  });

  const set = (key: keyof CheckoutData, value: string) =>
    setData(d => ({ ...d, [key]: value }));

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 pt-20">
        <h1 className="text-2xl font-heading font-bold text-white">Votre panier est vide</h1>
        <button onClick={() => navigate('/catalogue')} className="btn-primary">
          Voir le catalogue
        </button>
      </div>
    );
  }

  const total = totalPrice + DELIVERY_FEE;

  const validateStep1 = () => {
    if (!data.client_name.trim())  { toast.error('Nom requis');      return false; }
    if (!data.client_phone.trim()) { toast.error('Telephone requis'); return false; }
    if (!validatePhone(data.client_phone)) {
      toast.error('Numero de telephone invalide (8 chiffres, ex : 98 42 32 32)');
      return false;
    }
    if (data.client_email.trim() && !validateEmail(data.client_email)) {
      toast.error('Adresse email invalide');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!data.client_address.trim())      { toast.error('Adresse requise');  return false; }
    if (!data.client_neighborhood.trim()) { toast.error('Quartier requis');  return false; }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!data.payment_method) { toast.error('Choisissez un mode de paiement'); return; }
    setLoading(true);

    try {
      const orderNumber = generateOrderNumber();

      // Seuls product_id + quantity sont envoyes : le prix/sous-total/total
      // sont toujours recalcules cote serveur a partir du vrai stock/prix en
      // base (empeche la survente et la manipulation de prix cote client).
      const order = await orderService.create({
        order_number:          orderNumber,
        client_name:           data.client_name,
        client_phone:          data.client_phone,
        client_email:          data.client_email || undefined,
        client_address:        data.client_address,
        client_neighborhood:   data.client_neighborhood,
        delivery_instructions: data.delivery_instructions || undefined,
        payment_method:        data.payment_method,
        items:                 items.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      });

      clearCart();

      // Notifie le gerant via WhatsApp
      notifyManagerNewOrder(order);

      navigate(`/confirmation/${order.order_number}`, { state: { order } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors de la commande. Veuillez reessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h1 className="text-3xl font-heading font-bold text-white mb-8">Finaliser la commande</h1>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  step > s.id
                    ? 'bg-green-500 text-white'
                    : step === s.id
                      ? 'bg-gold text-bg-deep'
                      : 'bg-bg-surface text-muted border border-white/10'
                }`}>
                  {step > s.id ? <Check size={18} /> : <s.icon size={18} />}
                </div>
                <span className={`text-sm font-heading font-medium hidden sm:block ${step === s.id ? 'text-white' : 'text-muted'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-3 rounded-full transition-colors ${step > s.id ? 'bg-green-500' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <AnimatePresence mode="wait">
                {/* Etape 1 : Informations */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-heading font-semibold text-white mb-6">
                      Vos informations
                    </h2>
                    <div>
                      <label className="block text-sm text-muted mb-2">Nom complet *</label>
                      <input
                        className="input"
                        placeholder="Ex : Kofi Mensah"
                        value={data.client_name}
                        onChange={e => set('client_name', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">Telephone *</label>
                      <input
                        className="input"
                        placeholder="Ex : 98 42 32 32"
                        type="tel"
                        value={data.client_phone}
                        onChange={e => set('client_phone', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">Email (optionnel)</label>
                      <input
                        className="input"
                        placeholder="votre@email.com"
                        type="email"
                        value={data.client_email}
                        onChange={e => set('client_email', e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Etape 2 : Livraison */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-heading font-semibold text-white mb-6">
                      Adresse de livraison
                    </h2>
                    <div>
                      <label className="block text-sm text-muted mb-2">Quartier *</label>
                      <select
                        className="input"
                        value={data.client_neighborhood}
                        onChange={e => set('client_neighborhood', e.target.value)}
                      >
                        <option value="">-- Selectionner --</option>
                        {NEIGHBORHOODS.map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">Adresse precise *</label>
                      <input
                        className="input"
                        placeholder="Ex : Rue des Palmiers, en face du marche"
                        value={data.client_address}
                        onChange={e => set('client_address', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-muted mb-2">Instructions (optionnel)</label>
                      <textarea
                        className="input min-h-[80px] resize-none"
                        placeholder="Ex : Appeler avant de venir, portail bleu…"
                        value={data.delivery_instructions}
                        onChange={e => set('delivery_instructions', e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Etape 3 : Paiement */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <h2 className="text-xl font-heading font-semibold text-white mb-6">
                      Mode de paiement
                    </h2>
                    <div className="space-y-3">
                      {PAYMENT_METHODS.map(method => (
                        <label
                          key={method.value}
                          className={`flex items-center gap-4 p-4 rounded-btn border-2 cursor-pointer transition-all ${
                            data.payment_method === method.value
                              ? 'border-gold bg-gold/10'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.value}
                            checked={data.payment_method === method.value}
                            onChange={() => set('payment_method', method.value)}
                            className="accent-gold"
                          />
                          <span className="text-xl">{method.icon}</span>
                          <span className="font-heading font-medium text-white">{method.label}</span>
                        </label>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                {step > 1 ? (
                  <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
                    Retour
                  </button>
                ) : (
                  <div />
                )}
                {step < 3 ? (
                  <button onClick={handleNext} className="btn-primary">
                    Continuer
                    <ChevronRight size={18} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading} className="btn-primary">
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                    {loading ? 'Traitement…' : 'Confirmer la commande'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recapitulatif commande */}
          <div className="lg:col-span-1">
            <div className="card p-5 sticky top-24">
              <h3 className="font-heading font-semibold text-white mb-5">Recapitulatif</h3>
              <div className="space-y-3 mb-5">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-bg-surface rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images[0] && (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-muted text-xs">x{item.quantity}</p>
                    </div>
                    <p className="price text-sm flex-shrink-0">{formatFCFA(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Sous-total</span>
                  <span className="text-white">{formatFCFA(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Livraison</span>
                  <span className="text-white">{formatFCFA(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-white/10">
                  <span className="text-white">Total</span>
                  <span className="price text-lg">{formatFCFA(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
