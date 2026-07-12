export { config } from '../../_authProxy.js';
import { proxyToNeonAuth } from '../../_authProxy.js';
import type { VercelRequest, VercelResponse } from '../../_authProxy.js';
import { checkRateLimit, clientIp } from '../../_rateLimit.js';

// Aucune protection brute-force n'existait sur /admin/login (verifie : 6
// tentatives ratees d'affilee toutes acceptees en 401 sans ralentissement ni
// blocage). Limite ici par IP plutot que cote Neon Auth (pas d'acces console
// pour confirmer/activer un eventuel verrouillage natif).
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (!(await checkRateLimit(`login:${clientIp(req.headers)}`, 10, 600))) {
    res.status(429).send({ error: 'Trop de tentatives de connexion, reessayez dans quelques minutes' });
    return;
  }
  return proxyToNeonAuth(req, res, 'sign-in/email');
}
