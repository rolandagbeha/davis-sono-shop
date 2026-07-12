import type { ProductBadge } from '../../types';

interface BadgeProps {
  badge: ProductBadge;
  className?: string;
}

const CONFIG: Record<NonNullable<ProductBadge>, { label: string; className: string }> = {
  new:  { label: 'Nouveau',    className: 'badge-new' },
  hot:  { label: 'Populaire',  className: 'badge-hot' },
  sale: { label: 'Promo',      className: 'badge-sale' },
};

export function Badge({ badge, className = '' }: BadgeProps) {
  if (!badge) return null;
  const { label, className: cls } = CONFIG[badge];
  return <span className={`${cls} ${className}`}>{label}</span>;
}

// Badge de statut commande
interface StatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:    { label: 'En attente',      className: 'status-pending' },
  confirmed:  { label: 'Confirmée',       className: 'status-confirmed' },
  preparing:  { label: 'En préparation',  className: 'status-preparing' },
  shipped:    { label: 'Expédiée',        className: 'status-shipped' },
  delivered:  { label: 'Livrée',          className: 'status-delivered' },
  cancelled:  { label: 'Annulée',         className: 'status-cancelled' },
  // Devis
  new:        { label: 'Nouveau',         className: 'badge-new' },
  processing: { label: 'En cours',        className: 'status-preparing' },
  sent:       { label: 'Envoyé',          className: 'status-confirmed' },
  accepted:   { label: 'Accepté',         className: 'status-delivered' },
  refused:    { label: 'Refusé',          className: 'status-cancelled' },
  // Statut de paiement
  unpaid:               { label: 'Non payée',          className: 'status-cancelled' },
  pending_verification: { label: 'À vérifier',          className: 'status-pending' },
  paid:                 { label: 'Payée',               className: 'status-delivered' },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  if (!config) return <span className="badge bg-white/10 text-muted">{status}</span>;
  return <span className={config.className}>{config.label}</span>;
}
