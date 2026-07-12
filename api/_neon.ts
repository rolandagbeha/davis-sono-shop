// Helpers partagés par les fonctions serverless /api/ai et /api/upload.
// Prefixe "_" : Vercel ignore ce fichier lors de la génération des routes
// (ce n'est pas un endpoint public).
//
// Variables d'environnement serveur requises (Vercel > Settings > Environment
// Variables) — voir HANDOFF_CLAUDE_CODE.md pour le detail :
//   NEON_DATA_API_URL — Data API URL (Neon Console > Data API)
//   NEON_AUTH_URL     — Auth URL     (Neon Console > Auth > Configuration)

import { sql } from './_db.js';

export const NEON_DATA_API_URL = process.env.NEON_DATA_API_URL || '';
export const NEON_AUTH_URL     = process.env.NEON_AUTH_URL || '';

export interface ProductRow {
  name: string;
  slug: string;
  category: string;
  price: number;
  short_description: string | null;
  stock: number;
  is_rentable: boolean;
  rental_price_day: number | null;
}

// Relit le catalogue de produits actifs via une connexion Postgres directe.
// Le Data API a ete abandonne ici : il exige un jeton JWT meme pour le role
// "anonymous", et le plugin d'auth "anonymous" de Neon n'est pas disponible
// sur ce projet (voir api/_db.ts et HANDOFF_CLAUDE_CODE.md).
export async function fetchActiveProducts(): Promise<ProductRow[]> {
  const rows = await sql.query(
    `SELECT name, slug, category, price, short_description, stock, is_rentable, rental_price_day
     FROM products WHERE is_active = true ORDER BY views DESC LIMIT 80`,
  );
  return rows as ProductRow[];
}

// Verifie qu'un jeton porteur correspond a une session Neon Auth valide.
// On delegue la verification a la plateforme elle-meme : le jeton est
// presente au Data API sur une requete vers une table reservee au rôle
// "authenticated" (stock_movements — aucun droit accorde a "anonymous" dans
// neon/schema.sql). Si la requete reussit (2xx), le jeton correspond bien a
// une session admin valide ; sinon (401/403, ou role anonymous sans droits),
// on rejette. Important : ne pas utiliser ici une table lisible par
// "anonymous" (comme settings ou products), sinon un jeton absent ou invalide
// passerait quand même le contrôle.
export async function verifyAdmin(authHeader?: string | string[]): Promise<boolean> {
  const headerValue = Array.isArray(authHeader) ? authHeader[0] : authHeader;
  if (!headerValue) return false;
  const token = headerValue.replace(/^Bearer\s+/i, '').trim();
  if (!token || !NEON_DATA_API_URL) return false;

  const res = await fetch(`${NEON_DATA_API_URL}/stock_movements?limit=1`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
