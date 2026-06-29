import { useState } from 'react';
import { Eye, MessageCircle } from 'lucide-react';
import { useDevis, devisService } from '../../hooks/useDevis';
import type { Devis, DevisStatus } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';
import { replyDevisViaWhatsApp } from '../../lib/whatsapp';
import toast from 'react-hot-toast';

const DEVIS_STATUS: { value: DevisStatus; label: string }[] = [
  { value: 'new',        label: 'Nouveau' },
  { value: 'processing', label: 'En cours' },
  { value: 'sent',       label: 'Devis envoyé' },
  { value: 'accepted',   label: 'Accepté' },
  { value: 'refused',    label: 'Refusé' },
];

export default function AdminDevis() {
  const [selected, setSelected] = useState<Devis | null>(null);
  const [replyMsg, setReplyMsg] = useState('');
  const { devisList, isLoading, refetch } = useDevis();

  const handleStatusChange = async (id: string, status: DevisStatus) => {
    await devisService.updateStatus(id, status);
    toast.success('Statut mis à jour');
    refetch();
  };

  const handleReply = () => {
    if (!selected || !replyMsg.trim()) return;
    replyDevisViaWhatsApp(selected, replyMsg);
    toast.success('WhatsApp ouvert avec le message');
    setReplyMsg('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold text-white">Devis</h1>
        <p className="text-muted text-sm">{devisList.length} demande{devisList.length > 1 ? 's' : ''}</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Numéro', 'Client', 'Produit', 'Qté', 'Usage', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted font-medium text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
                : devisList.map(d => (
                  <tr key={d.id} className="border-b border-white/5 hover:bg-bg-surface/50">
                    <td className="py-3 px-4 font-mono text-cyan text-sm font-semibold">{d.devis_number}</td>
                    <td className="py-3 px-4">
                      <div className="text-white font-medium">{d.client_name}</div>
                      <div className="text-muted text-xs font-mono">{d.client_phone}</div>
                    </td>
                    <td className="py-3 px-4 text-muted max-w-[150px] truncate">{d.product_name || '—'}</td>
                    <td className="py-3 px-4 text-white font-mono">{d.quantity}</td>
                    <td className="py-3 px-4 text-muted max-w-[120px] truncate text-xs">{d.usage_type || '—'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={d.status}
                        onChange={e => handleStatusChange(d.id, e.target.value as DevisStatus)}
                        title="Changer le statut du devis"
                        aria-label="Statut du devis"
                        className="text-xs bg-bg-surface border border-white/10 rounded px-2 py-1 text-muted focus:outline-none focus:border-gold/50"
                      >
                        {DEVIS_STATUS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-muted text-xs">
                      {new Date(d.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <button type="button" title="Voir le devis" onClick={() => { setSelected(d); setReplyMsg(''); }} className="p-1.5 text-muted hover:text-gold transition-colors">
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Devis ${selected?.devis_number}`} size="lg">
        {selected && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted mb-1">Client</p>
                <p className="text-white font-medium">{selected.client_name}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Téléphone</p>
                <p className="text-white font-mono">{selected.client_phone}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Produit</p>
                <p className="text-white">{selected.product_name || '—'}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Quantité</p>
                <p className="text-white font-mono">{selected.quantity}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Usage</p>
                <p className="text-white">{selected.usage_type || '—'}</p>
              </div>
              <div>
                <p className="text-muted mb-1">Date souhaitée</p>
                <p className="text-white">{selected.desired_date || '—'}</p>
              </div>
              {selected.message && (
                <div className="col-span-2">
                  <p className="text-muted mb-1">Message</p>
                  <div className="bg-bg-surface rounded-btn p-3 text-white text-sm">{selected.message}</div>
                </div>
              )}
            </div>

            {/* Répondre via WhatsApp */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-muted text-sm mb-2">Répondre via WhatsApp</p>
              <textarea
                className="input min-h-[80px] resize-none mb-3"
                placeholder="Bonjour, suite à votre demande de devis…"
                value={replyMsg}
                onChange={e => setReplyMsg(e.target.value)}
              />
              <div className="flex gap-3">
                <button type="button" onClick={handleReply} className="btn-whatsapp flex-1 justify-center">
                  <MessageCircle size={16} />
                  Envoyer sur WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
