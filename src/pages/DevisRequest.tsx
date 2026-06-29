import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Send, CheckCircle, Loader2 } from 'lucide-react';
import { devisService } from '../hooks/useDevis';
import { notifyManagerNewDevis } from '../lib/whatsapp';
import { generateDevisNumber } from '../utils/orderNumber';
import type { Devis } from '../types';
import toast from 'react-hot-toast';

const USAGE_TYPES = [
  'Événement (mariage, anniversaire, concert)',
  'Installation permanente (église, salle, restaurant)',
  'Studio d\'enregistrement',
  'Formation / École de musique',
  'Autre',
];

export default function DevisRequest() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);

  const [form, setForm] = useState({
    client_name:   '',
    client_phone:  '',
    client_email:  '',
    product_name:  searchParams.get('name') || '',
    product_id:    searchParams.get('product') || undefined as string | undefined,
    quantity:      1,
    usage_type:    '',
    desired_date:  '',
    message:       '',
  });

  const set = (key: keyof typeof form, value: string | number) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_name.trim())  { toast.error('Nom requis');      return; }
    if (!form.client_phone.trim()) { toast.error('Téléphone requis'); return; }

    setLoading(true);
    try {
      const devisNumber = generateDevisNumber();
      const devisData: Omit<Devis, 'id' | 'created_at'> = {
        devis_number:  devisNumber,
        client_name:   form.client_name,
        client_phone:  form.client_phone,
        client_email:  form.client_email || undefined,
        product_id:    form.product_id || undefined,
        product_name:  form.product_name || undefined,
        quantity:      form.quantity,
        usage_type:    form.usage_type || undefined,
        desired_date:  form.desired_date || undefined,
        message:       form.message || undefined,
        status:        'new',
      };

      const devis = await devisService.create(devisData);
      notifyManagerNewDevis(devis);
      setSubmitted(true);
    } catch (err) {
      toast.error('Erreur lors de l\'envoi. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md card p-8 text-center"
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-3">Devis envoyé !</h2>
          <p className="text-muted mb-8">
            Nous avons bien reçu votre demande. Notre équipe vous recontactera sous 2h sur le{' '}
            <span className="text-white font-mono">{form.client_phone}</span>.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/')} className="btn-primary w-full justify-center">
              Retour à l'accueil
            </button>
            <button onClick={() => navigate('/catalogue')} className="btn-secondary w-full justify-center">
              Voir le catalogue
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main px-4 sm:px-6 lg:px-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gold/20 rounded-xl flex items-center justify-center">
              <FileText size={24} className="text-gold" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">Demande de devis</h1>
              <p className="text-muted">Réponse garantie sous 2 heures</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-muted mb-2">Nom complet *</label>
                <input className="input" placeholder="Votre nom" value={form.client_name} onChange={e => set('client_name', e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Téléphone *</label>
                <input className="input" placeholder="98 42 32 32" type="tel" value={form.client_phone} onChange={e => set('client_phone', e.target.value)} required />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Email (optionnel)</label>
              <input className="input" placeholder="votre@email.com" type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm text-muted mb-2">Produit(s) concerné(s)</label>
                <input className="input" placeholder="Ex : Enceinte JBL 15&quot;" value={form.product_name} onChange={e => set('product_name', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm text-muted mb-2">Quantité</label>
                <input
                  className="input"
                  type="number"
                  min={1}
                  value={form.quantity}
                  onChange={e => set('quantity', parseInt(e.target.value) || 1)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Usage prévu</label>
              <select className="input" value={form.usage_type} onChange={e => set('usage_type', e.target.value)}>
                <option value="">-- Sélectionner --</option>
                {USAGE_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Date souhaitée</label>
              <input
                className="input"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={form.desired_date}
                onChange={e => set('desired_date', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-muted mb-2">Message / Détails supplémentaires</label>
              <textarea
                className="input min-h-[100px] resize-none"
                placeholder="Décrivez votre projet, vos besoins spécifiques…"
                value={form.message}
                onChange={e => set('message', e.target.value)}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? 'Envoi en cours…' : 'Envoyer ma demande de devis'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
