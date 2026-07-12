// Fonction serverless Vercel — creation de commande (checkout) et suivi
// public (numero de commande + telephone). Remplace les appels
// client.from('orders') cote visiteur non connecte (voir api/_db.ts).
//
// La liste/mise a jour des commandes cote admin reste sur le Data API
// (client.from('orders') avec jeton Neon Auth authentifie), non concernee
// par le probleme d'acces anonyme.

import { sql } from './_db.js';
import { checkRateLimit, clientIp } from './_rateLimit.js';

interface VercelRequest {
  method?: string;
  body: unknown;
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

interface OrderItemInput {
  product_id: string;
  quantity:   number;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');
  const ip = clientIp(req.headers);

  if (req.method === 'GET') {
    // Empeche de bruteforcer un numero de telephone pour un numero de commande donne.
    if (!(await checkRateLimit(`orders:get:${ip}`, 20, 300))) {
      res.status(429).json({ error: 'Trop de requetes, reessayez dans quelques minutes' });
      return;
    }

    const orderNumber = firstValue(req.query.order_number);
    const phone        = firstValue(req.query.phone);
    if (!orderNumber || !phone) {
      res.status(400).json({ error: 'order_number et phone requis' });
      return;
    }
    try {
      const rows = await sql.query(
        'SELECT * FROM orders WHERE order_number = $1 AND client_phone = $2 LIMIT 1',
        [orderNumber.trim().toUpperCase(), phone.trim()],
      );
      const order = rows[0];
      if (!order) {
        res.status(404).json({ error: 'Commande introuvable' });
        return;
      }
      res.status(200).json({ order });
    } catch (err) {
      console.error('Erreur GET /api/orders:', err);
      res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
    }
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  // Limite les faux passages de commande en masse (impact stock direct).
  if (!(await checkRateLimit(`orders:post:${ip}`, 5, 600))) {
    res.status(429).json({ error: 'Trop de commandes, reessayez dans quelques minutes' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const items = Array.isArray(body.items) ? (body.items as OrderItemInput[]) : [];

  if (
    typeof body.order_number !== 'string' || !body.order_number.trim() ||
    typeof body.client_name !== 'string' || !body.client_name.trim() ||
    typeof body.client_phone !== 'string' || !body.client_phone.trim() ||
    typeof body.payment_method !== 'string' ||
    items.length === 0 ||
    items.some(i => !i.product_id || typeof i.quantity !== 'number' || i.quantity < 1)
  ) {
    res.status(400).json({ error: 'Donnees de commande incompletes' });
    return;
  }

  // Le prix, le sous-total, le total et le detail des articles ne sont
  // JAMAIS pris depuis le corps de la requete : create_order_with_stock_check
  // relit le vrai prix/stock de chaque produit en base et rejette la
  // commande si le stock est insuffisant (verrou de ligne, transaction
  // atomique cote SQL — voir neon/schema.sql).
  try {
    const rows = await sql.query(
      'SELECT * FROM create_order_with_stock_check($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10)',
      [
        body.order_number,
        body.client_name,
        body.client_phone,
        (body.client_email as string) || null,
        (body.client_address as string) || null,
        (body.client_neighborhood as string) || null,
        (body.delivery_instructions as string) || null,
        body.payment_method,
        JSON.stringify(items.map(i => ({ product_id: i.product_id, quantity: i.quantity }))),
        (body.payment_reference as string) || null,
      ],
    );

    res.status(201).json({ order: rows[0] });
  } catch (err) {
    console.error('Erreur POST /api/orders:', err);
    const message = err instanceof Error ? err.message : 'Erreur creation commande';
    const isClientError = /stock insuffisant|produit introuvable|quantite invalide|panier vide/i.test(message);
    res.status(isClientError ? 409 : 500).json({ error: message });
  }
}
