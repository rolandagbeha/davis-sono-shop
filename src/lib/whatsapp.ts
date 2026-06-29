import type { Order, Devis, OrderStatus } from '../types';

const MANAGER_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '22898423232';
const SHOP_NAME      = 'Davis Sono Shop';
const SHOP_PHONE     = '98 42 32 32';

// Ouvre WhatsApp avec un message pré-rempli
function openWhatsApp(phone: string, message: string): void {
  const encoded = encodeURIComponent(message);
  const cleaned = phone.replace(/\D/g, '');
  window.open(`https://wa.me/${cleaned}?text=${encoded}`, '_blank');
}

// Notifie le gérant d'une nouvelle commande
export function notifyManagerNewOrder(order: Order): void {
  const itemsList = order.items
    .map(i => `  • ${i.product_name} x${i.quantity} — ${formatFCFA(i.subtotal)}`)
    .join('\n');

  const message = `🛒 *Nouvelle commande #${order.order_number}*

👤 Client : ${order.client_name}
📞 Tél : ${order.client_phone}
📍 Quartier : ${order.client_neighborhood || 'Non précisé'}

📦 *Articles :*
${itemsList}

💰 Sous-total : ${formatFCFA(order.subtotal)}
🚚 Livraison : ${formatFCFA(order.delivery_fee)}
✅ *Total : ${formatFCFA(order.total)}*

💳 Paiement : ${paymentMethodLabel(order.payment_method)}
📝 Instructions : ${order.delivery_instructions || 'Aucune'}

— ${SHOP_NAME}`;

  openWhatsApp(MANAGER_NUMBER, message);
}

// Confirme la commande au client
export function confirmOrderToClient(order: Order, clientPhone: string): void {
  const message = `✅ *Commande #${order.order_number} confirmée !*

Bonjour ${order.client_name},

Merci pour votre commande chez ${SHOP_NAME}.
Nous vous contacterons très prochainement pour organiser la livraison.

💰 Total : ${formatFCFA(order.total)}
💳 Paiement : ${paymentMethodLabel(order.payment_method)}

Des questions ? Appelez-nous : ${SHOP_PHONE}

Merci de votre confiance ! 🙏`;

  openWhatsApp(clientPhone, message);
}

// Notifie le gérant d'un nouveau devis
export function notifyManagerNewDevis(devis: Devis): void {
  const message = `📋 *Nouveau devis #${devis.devis_number}*

👤 Client : ${devis.client_name}
📞 Tél : ${devis.client_phone}
${devis.client_email ? `📧 Email : ${devis.client_email}` : ''}

🎵 Produit : ${devis.product_name || 'Non spécifié'}
📦 Quantité : ${devis.quantity}
🎯 Usage : ${devis.usage_type || 'Non précisé'}
📅 Date souhaitée : ${devis.desired_date || 'Non précisée'}

💬 Message :
${devis.message || 'Aucun message'}

— ${SHOP_NAME}`;

  openWhatsApp(MANAGER_NUMBER, message);
}

// Notifie le client d'un changement de statut commande
export function notifyClientStatusChange(
  orderNumber: string,
  clientName: string,
  clientPhone: string,
  newStatus: OrderStatus,
): void {
  const statusLabel = orderStatusLabel(newStatus);
  const message = `📦 *Mise à jour de votre commande*

Bonjour ${clientName},

Votre commande *#${orderNumber}* a été mise à jour :
📌 Nouveau statut : *${statusLabel}*

${statusMessage(newStatus)}

Des questions ? ${SHOP_PHONE}
— ${SHOP_NAME}`;

  openWhatsApp(clientPhone, message);
}

// Commande rapide depuis une page produit
export function quickOrderViaWhatsApp(
  productName: string,
  price: number,
): void {
  const message = `Bonjour ${SHOP_NAME} ! 👋

Je suis intéressé(e) par le produit :
🎵 *${productName}*
💰 Prix affiché : ${formatFCFA(price)}

Pouvez-vous me donner plus d'informations et confirmer la disponibilité ?

Merci !`;

  openWhatsApp(MANAGER_NUMBER, message);
}

// Contacter le vendeur (page produit)
export function contactSeller(): void {
  const message = `Bonjour ${SHOP_NAME} ! 👋\nJe souhaite obtenir des informations sur vos produits.`;
  openWhatsApp(MANAGER_NUMBER, message);
}

// Répondre à un devis depuis l'admin
export function replyDevisViaWhatsApp(devis: Devis, responseMessage: string): void {
  openWhatsApp(devis.client_phone, responseMessage);
}

// Helpers
function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

function paymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash:       'Paiement à la livraison',
    moov_money: 'Moov Money',
    t_money:    'T-Money',
    flooz:      'Flooz',
    virement:   'Virement bancaire',
  };
  return labels[method] || method;
}

export function orderStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    pending:   'En attente',
    confirmed: 'Confirmée',
    preparing: 'En préparation',
    shipped:   'Expédiée',
    delivered: 'Livrée',
    cancelled: 'Annulée',
  };
  return labels[status] || status;
}

function statusMessage(status: OrderStatus): string {
  const messages: Record<OrderStatus, string> = {
    pending:   'Votre commande est en attente de confirmation.',
    confirmed: 'Votre commande a été confirmée. Nous la préparons bientôt !',
    preparing: 'Votre commande est en cours de préparation.',
    shipped:   'Votre commande est en route vers vous ! 🚚',
    delivered: 'Votre commande a été livrée. Merci ! 🎉',
    cancelled: 'Votre commande a été annulée. Contactez-nous pour plus d\'infos.',
  };
  return messages[status] || '';
}
