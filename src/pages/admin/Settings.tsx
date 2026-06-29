import { useState } from 'react';
import { Save, Eye, EyeOff, Loader2, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const DELIVERY_ZONES = [
  { name: 'Lomé Centre',           fee: 1500 },
  { name: 'Novissi / Tokoin',      fee: 2000 },
  { name: 'Adidogomé / Agoè',     fee: 2500 },
  { name: 'Baguida / Aklaku',      fee: 3500 },
  { name: 'Hors Lomé',             fee: 0 },
];

export default function AdminSettings() {
  const [saving,   setSaving]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [pwdForm,  setPwdForm]  = useState({ current: '', next: '', confirm: '' });
  const [info, setInfo] = useState({
    shop_name:      'Davis Sono Shop',
    shop_address:   'Lomé, Novissi, non loin de l\'UTB — Togo',
    shop_phone:     '98 42 32 32',
    shop_whatsapp:  '22898423232',
    shop_email:     '',
  });

  const handleSaveInfo = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(info).map(([key, value]) => ({ key, value }));
      for (const u of updates) {
        await supabase.from('settings').upsert({ key: u.key, value: u.value, updated_at: new Date().toISOString() });
      }
      toast.success('Paramètres sauvegardés');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (pwdForm.next !== pwdForm.confirm) { toast.error('Les mots de passe ne correspondent pas'); return; }
    if (pwdForm.next.length < 6)          { toast.error('Mot de passe trop court (6 caractères min)'); return; }
    try {
      const { error } = await supabase.auth.updateUser({ password: pwdForm.next });
      if (error) throw error;
      toast.success('Mot de passe modifié');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch {
      toast.error('Erreur modification mot de passe');
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Paramètres</h1>
        <p className="text-muted text-sm">Configuration de votre boutique</p>
      </div>

      {/* Infos boutique */}
      <section className="card p-6 space-y-5">
        <h2 className="font-heading font-semibold text-white text-lg border-b border-white/10 pb-3">
          Informations boutique
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted mb-2">Nom de la boutique</label>
            <input className="input" value={info.shop_name} onChange={e => setInfo(i => ({ ...i, shop_name: e.target.value }))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-muted mb-2">Adresse</label>
            <input className="input" value={info.shop_address} onChange={e => setInfo(i => ({ ...i, shop_address: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Téléphone principal</label>
            <input className="input font-mono" value={info.shop_phone} onChange={e => setInfo(i => ({ ...i, shop_phone: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Numéro WhatsApp (avec indicatif)</label>
            <input className="input font-mono" value={info.shop_whatsapp} onChange={e => setInfo(i => ({ ...i, shop_whatsapp: e.target.value }))} placeholder="22898423232" />
          </div>
          <div>
            <label className="block text-sm text-muted mb-2">Email</label>
            <input className="input" type="email" value={info.shop_email} onChange={e => setInfo(i => ({ ...i, shop_email: e.target.value }))} placeholder="contact@davissono.tg" />
          </div>
        </div>
        <button onClick={handleSaveInfo} disabled={saving} className="btn-primary">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Sauvegarder
        </button>
      </section>

      {/* Zones de livraison */}
      <section className="card p-6">
        <h2 className="font-heading font-semibold text-white text-lg border-b border-white/10 pb-3 mb-5">
          Tarifs de livraison
        </h2>
        <div className="space-y-3">
          {DELIVERY_ZONES.map(zone => (
            <div key={zone.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-white text-sm">{zone.name}</span>
              <span className="font-mono text-gold text-sm">
                {zone.fee === 0 ? 'À convenir' : `${zone.fee.toLocaleString('fr-FR')} FCFA`}
              </span>
            </div>
          ))}
        </div>
        <p className="text-muted text-xs mt-4">Pour modifier les tarifs, éditez directement la table `settings` dans Supabase.</p>
      </section>

      {/* Modes de paiement */}
      <section className="card p-6">
        <h2 className="font-heading font-semibold text-white text-lg border-b border-white/10 pb-3 mb-5">
          Modes de paiement actifs
        </h2>
        <div className="space-y-3">
          {[
            { label: '💵 Paiement à la livraison', active: true },
            { label: '📱 Moov Money', active: true },
            { label: '📱 T-Money', active: true },
            { label: '📱 Flooz', active: true },
            { label: '🏦 Virement bancaire', active: true },
          ].map(method => (
            <div key={method.label} className="flex items-center justify-between">
              <span className="text-white text-sm">{method.label}</span>
              <Check size={16} className="text-green-400" />
            </div>
          ))}
        </div>
      </section>

      {/* Changer mot de passe */}
      <section className="card p-6 space-y-4">
        <h2 className="font-heading font-semibold text-white text-lg border-b border-white/10 pb-3">
          Sécurité — Changer le mot de passe
        </h2>
        <div className="relative">
          <input
            type={showPass ? 'text' : 'password'}
            className="input pr-10"
            placeholder="Nouveau mot de passe"
            value={pwdForm.next}
            onChange={e => setPwdForm(p => ({ ...p, next: e.target.value }))}
          />
          <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-white">
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <input
          type="password"
          className="input"
          placeholder="Confirmer le nouveau mot de passe"
          value={pwdForm.confirm}
          onChange={e => setPwdForm(p => ({ ...p, confirm: e.target.value }))}
        />
        <button onClick={handleChangePassword} className="btn-secondary">
          <Save size={16} />
          Modifier le mot de passe
        </button>
      </section>
    </div>
  );
}
