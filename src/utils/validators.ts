// Validation du numéro de téléphone togolais (8 chiffres)
export function validatePhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  return /^(\+228|00228)?[0-9]{8}$/.test(cleaned);
}

// Validation email basique
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Formate un numéro togolais
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '').slice(-8);
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)}`;
  }
  return phone;
}

// Validation d'un champ requis
export function required(value: string): string | undefined {
  return value.trim() ? undefined : 'Ce champ est requis';
}
