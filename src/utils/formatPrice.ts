// Formate un montant en FCFA — ex: 125 000 FCFA
export function formatFCFA(amount: number): string {
  return `${amount.toLocaleString('fr-FR')} FCFA`;
}

// Formate le prix de location
export function formatRentalPrice(pricePerDay: number): string {
  return `${formatFCFA(pricePerDay)} / jour`;
}

// Formate un pourcentage de réduction
export function formatDiscount(original: number, sale: number): string {
  const pct = Math.round(((original - sale) / original) * 100);
  return `-${pct}%`;
}
