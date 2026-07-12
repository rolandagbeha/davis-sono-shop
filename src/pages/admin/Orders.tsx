import { useState } from 'react';
import { Download, Eye, MessageCircle } from 'lucide-react';
import { useOrders, orderService } from '../../hooks/useOrders';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { formatFCFA } from '../../utils/formatPrice';
import { StatusBadge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Spinner';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',   label: 'En attente' },
  { value: 'confirmed', label: 'Confirmée' },
  { value: 'preparing', label: 'En préparation' },
  { value: 'shipped',   label: 'Expédiée' },
  { value: 'delivered', label: 'Livrée' },
  { value: 'cancelled', label: 'Annulée' },
];

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid',               label: 'Non payée' },
  { value: 'pending_verification', label: 'À vérifier' },
  { value: 'paid',                 label: 'Payée' },
];

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus,  setFilterStatus]  = useState('');
  const { orders, isLoading, refetch } = useOrders({
    status: filterStatus as OrderStatus || undefined,
  });

  const handleStatusChange = async (order: Order, newStatus: OrderStatus) => {
    await orderService.updateStatus(order.id, newStatus, order);
    refetch();
  };

  const handlePaymentStatusChange = async (order: Order, newStatus: PaymentStatus) => {
    await orderService.updatePaymentStatus(order.id, newStatus);
    refetch();
    if (selectedOrder?.id === order.id) setSelectedOrder({ ...selectedOrder, payment_status: newStatus });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-white">Commandes</h1>
          <p className="text-muted text-sm">{orders.length} commande{orders.length > 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => orderService.exportCsv(orders)} className="btn-secondary">
          <Download size={16} />
          Exporter CSV
        </button>
      </div>

      {/* Filtre statut */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterStatus('')}
          className={`badge cursor-pointer ${!filterStatus ? 'bg-gold text-bg-deep' : 'bg-white/10 text-muted hover:text-white'}`}
        >
          Toutes
        </button>
        {STATUS_OPTIONS.map(s => (
          <button
            key={s.value}
            onClick={() => setFilterStatus(filterStatus === s.value ? '' : s.value)}
            className={`badge cursor-pointer transition-colors ${filterStatus === s.value ? 'bg-gold text-bg-deep' : 'bg-white/10 text-muted hover:text-white'}`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-white/10">
              <tr>
                {['Commande', 'Client', 'Total', 'Paiement', 'Statut', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-muted font-medium text-xs uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><Skeleton className="h-4 w-full" /></td>
                    ))}
                  </tr>
                ))
                : orders.map(order => (
                  <tr key={order.id} className="border-b border-white/5 hover:bg-bg-surface/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-gold font-semibold text-sm">{order.order_number}</td>
                    <td className="py-3 px-4">
                      <div className="text-white text-sm font-medium">{order.client_name}</div>
                      <div className="text-muted text-xs font-mono">{order.client_phone}</div>
                    </td>
                    <td className="py-3 px-4 price text-sm">{formatFCFA(order.total)}</td>
                    <td className="py-3 px-4">
                      <div className="text-muted capitalize text-xs mb-1">{order.payment_method.replace('_', ' ')}</div>
                      <StatusBadge status={order.payment_status} />
                    </td>
                    <td className="py-3 px-4">
                      <div className="relative group inline-block">
                        <StatusBadge status={order.status} />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted text-xs">
                      {new Date(order.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setSelectedOrder(order)} className="p-1.5 text-muted hover:text-gold transition-colors" title="Voir les détails">
                          <Eye size={15} />
                        </button>
                        <select
                          value={order.status}
                          onChange={e => handleStatusChange(order, e.target.value as OrderStatus)}
                          title="Changer le statut de la commande"
                          aria-label="Statut de la commande"
                          className="text-xs bg-bg-surface border border-white/10 rounded px-2 py-1 text-muted focus:outline-none focus:border-gold/50"
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal détails commande */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Commande ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-5">
            {/* Infos client */}
            <div>
              <h4 className="font-heading font-semibold text-white mb-3">Client</h4>
              <div className="bg-bg-surface rounded-card p-4 space-y-2 text-sm">
                <p><span className="text-muted">Nom :</span> <span className="text-white">{selectedOrder.client_name}</span></p>
                <p><span className="text-muted">Tél :</span> <span className="text-white font-mono">{selectedOrder.client_phone}</span></p>
                {selectedOrder.client_email && <p><span className="text-muted">Email :</span> <span className="text-white">{selectedOrder.client_email}</span></p>}
                <p><span className="text-muted">Adresse :</span> <span className="text-white">{selectedOrder.client_address}, {selectedOrder.client_neighborhood}</span></p>
                {selectedOrder.delivery_instructions && <p><span className="text-muted">Instructions :</span> <span className="text-white">{selectedOrder.delivery_instructions}</span></p>}
              </div>
            </div>

            {/* Articles */}
            <div>
              <h4 className="font-heading font-semibold text-white mb-3">Articles commandés</h4>
              <div className="space-y-2">
                {selectedOrder.items.map(item => (
                  <div key={item.product_id} className="flex justify-between text-sm py-2 border-b border-white/5 last:border-0">
                    <div>
                      <span className="text-white">{item.product_name}</span>
                      <span className="text-muted ml-2">x{item.quantity}</span>
                    </div>
                    <span className="price">{formatFCFA(item.subtotal)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-semibold pt-2">
                  <span className="text-muted">Livraison</span>
                  <span className="text-white">{formatFCFA(selectedOrder.delivery_fee)}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="price text-lg">{formatFCFA(selectedOrder.total)}</span>
                </div>
              </div>
            </div>

            {/* Paiement */}
            <div>
              <h4 className="font-heading font-semibold text-white mb-3">Paiement</h4>
              <div className="bg-bg-surface rounded-card p-4 space-y-2 text-sm">
                <p><span className="text-muted">Moyen :</span> <span className="text-white capitalize">{selectedOrder.payment_method.replace('_', ' ')}</span></p>
                <p>
                  <span className="text-muted">Référence :</span>{' '}
                  <span className="text-white font-mono">{selectedOrder.payment_reference || '—'}</span>
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-muted">Statut :</span>
                  <select
                    value={selectedOrder.payment_status}
                    onChange={e => handlePaymentStatusChange(selectedOrder, e.target.value as PaymentStatus)}
                    title="Changer le statut de paiement"
                    aria-label="Statut de paiement"
                    className="text-xs bg-bg-deep border border-white/10 rounded px-2 py-1 text-white focus:outline-none focus:border-gold/50"
                  >
                    {PAYMENT_STATUS_OPTIONS.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Changer statut + contacter client */}
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <select
                defaultValue={selectedOrder.status}
                onChange={e => handleStatusChange(selectedOrder, e.target.value as OrderStatus)}
                title="Changer le statut de la commande"
                aria-label="Nouveau statut"
                className="input flex-1"
              >
                {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <a
                href={`https://wa.me/${selectedOrder.client_phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp !px-4"
              >
                <MessageCircle size={16} />
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
