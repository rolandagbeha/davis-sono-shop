// Fonction serverless Vercel — creation de demande de devis (public).
// Remplace client.from('devis').insert() cote visiteur non connecte
// (voir api/_db.ts).

import { sql } from './_db.js';
import { checkRateLimit, clientIp } from './_rateLimit.js';

interface VercelRequest {
  method?: string;
  body: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
  setHeader(name: string, value: string): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  if (!(await checkRateLimit(`devis:post:${clientIp(req.headers)}`, 5, 600))) {
    res.status(429).json({ error: 'Trop de demandes, reessayez dans quelques minutes' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;

  if (
    typeof body.devis_number !== 'string' || !body.devis_number.trim() ||
    typeof body.client_name !== 'string' || !body.client_name.trim() ||
    typeof body.client_phone !== 'string' || !body.client_phone.trim()
  ) {
    res.status(400).json({ error: 'Donnees de devis incompletes' });
    return;
  }

  try {
    const rows = await sql.query(
      `INSERT INTO devis (
         devis_number, client_name, client_phone, client_email, product_id,
         product_name, quantity, usage_type, desired_date, message, status
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'new')
       RETURNING *`,
      [
        body.devis_number,
        body.client_name,
        body.client_phone,
        (body.client_email as string) || null,
        (body.product_id as string) || null,
        (body.product_name as string) || null,
        typeof body.quantity === 'number' ? body.quantity : 1,
        (body.usage_type as string) || null,
        (body.desired_date as string) || null,
        (body.message as string) || null,
      ],
    );

    res.status(201).json({ devis: rows[0] });
  } catch (err) {
    console.error('Erreur POST /api/devis:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur creation devis' });
  }
}
