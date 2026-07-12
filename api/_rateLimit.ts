// Limitation de debit par IP (fenetre fixe), stockee dans Postgres (table
// rate_limits, jamais exposee via le Data API). Pas de dependance externe
// (Upstash, Vercel Edge Config...) pour rester simple, coherent avec le
// reste de l'architecture qui utilise deja DATABASE_URL directement.
import { sql } from './_db.js';

export async function checkRateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  try {
    const rows = await sql.query(
      `INSERT INTO rate_limits (key, window_start, count)
       VALUES ($1, now(), 1)
       ON CONFLICT (key) DO UPDATE SET
         count = CASE
           WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval THEN 1
           ELSE rate_limits.count + 1
         END,
         window_start = CASE
           WHEN rate_limits.window_start < now() - ($2 || ' seconds')::interval THEN now()
           ELSE rate_limits.window_start
         END
       RETURNING count`,
      [key, windowSeconds],
    );
    const count = (rows[0] as { count: number } | undefined)?.count ?? 0;
    return count <= max;
  } catch (err) {
    // Ne bloque jamais une requete legitime si le rate limiter lui-meme echoue.
    console.error('Erreur rate limiter (requete autorisee par defaut):', err);
    return true;
  }
}

export function clientIp(headers: Record<string, string | string[] | undefined>): string {
  const forwarded = headers['x-forwarded-for'];
  const value = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  return value?.split(',')[0]?.trim() || 'unknown';
}
