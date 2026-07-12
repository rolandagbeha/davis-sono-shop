// Fonction serverless Vercel — lecture publique du catalogue produits.
// Remplace les appels client.from('products') pour les visiteurs non
// connectes (voir api/_db.ts pour le pourquoi).

import { sql } from './_db.js';
import { checkRateLimit, clientIp } from './_rateLimit.js';

interface VercelRequest {
  method?: string;
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

const SORT_MAP: Record<string, string> = {
  price_asc:  'price ASC',
  price_desc: 'price DESC',
  newest:     'created_at DESC',
  popular:    'views DESC',
  relevance:  'created_at DESC',
};

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  if (!(await checkRateLimit(`products:${clientIp(req.headers)}`, 60, 60))) {
    res.status(429).json({ error: 'Trop de requetes, reessayez dans un instant' });
    return;
  }

  const slug = firstValue(req.query.slug);

  try {
    // Fiche produit unique — incremente aussi le compteur de vues.
    if (slug) {
      const rows = await sql.query(
        'SELECT * FROM products WHERE slug = $1 AND is_active = true LIMIT 1',
        [slug],
      );
      const product = rows[0];
      if (!product) {
        res.status(404).json({ error: 'Produit introuvable' });
        return;
      }
      sql.query('UPDATE products SET views = views + 1 WHERE id = $1', [product.id]).catch(() => {});
      res.status(200).json({ product });
      return;
    }

    // Liste (catalogue, recherche, filtres)
    const category   = firstValue(req.query.category);
    const badge      = firstValue(req.query.badge);
    const isRentable = firstValue(req.query.isRentable) === 'true';
    const search     = firstValue(req.query.search);
    const priceMin   = firstValue(req.query.priceMin);
    const priceMax   = firstValue(req.query.priceMax);
    const sortBy     = firstValue(req.query.sortBy) ?? 'newest';
    const limit      = Math.min(Number(firstValue(req.query.limit)) || 100, 100);
    const offset     = Number(firstValue(req.query.offset)) || 0;

    const whereParams: unknown[] = [];
    const conditions: string[] = ['is_active = true'];

    if (category) {
      whereParams.push(category);
      conditions.push(`category = $${whereParams.length}`);
    }
    if (badge) {
      whereParams.push(badge);
      conditions.push(`badge = $${whereParams.length}`);
    }
    if (isRentable) conditions.push('is_rentable = true');
    if (search) {
      whereParams.push(`%${search}%`);
      conditions.push(`name ILIKE $${whereParams.length}`);
    }
    if (priceMin) {
      whereParams.push(Number(priceMin));
      conditions.push(`price >= $${whereParams.length}`);
    }
    if (priceMax) {
      whereParams.push(Number(priceMax));
      conditions.push(`price <= $${whereParams.length}`);
    }

    const where = conditions.join(' AND ');
    const orderClause = SORT_MAP[sortBy] ?? SORT_MAP.newest;

    const countRows = await sql.query(`SELECT COUNT(*)::int AS count FROM products WHERE ${where}`, whereParams);
    const total = countRows[0]?.count ?? 0;

    const listParams = [...whereParams, limit, offset];
    const rows = await sql.query(
      `SELECT * FROM products WHERE ${where} ORDER BY ${orderClause} LIMIT $${listParams.length - 1} OFFSET $${listParams.length}`,
      listParams,
    );

    res.status(200).json({ products: rows, total });
  } catch (err) {
    console.error('Erreur /api/products:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur' });
  }
}
