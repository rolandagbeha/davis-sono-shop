// Relai cote serveur vers Neon Auth pour un chemin fixe donne.
//
// Pourquoi ce proxy : Neon Auth rejette (403 INVALID_ORIGIN) toute requete
// de connexion dont l'en-tete navigateur Sec-Fetch-Site vaut "cross-site".
// Notre app (davis-sono-shop.vercel.app) et Neon Auth (*.neonauth.*.neon.tech)
// sont sur des domaines differents : un vrai navigateur envoie donc toujours
// Sec-Fetch-Site: cross-site pour un appel direct depuis le front — ce que
// curl ne reproduit jamais (d'ou un faux negatif si on ne teste qu'au curl,
// comme lors du premier passage de cet audit). En passant par ce proxy sur
// notre propre domaine, le navigateur voit une requete same-origin, et ce
// serveur (pas un navigateur, donc pas de Sec-Fetch-Site) fait l'appel a
// Neon Auth.
//
// Pourquoi Node https.request() et pas fetch() : fetch() (undici) negocie
// HTTP/2 automatiquement avec ce serveur, et Neon Auth rejette alors la
// meme requete (memes en-tetes) avec 403 INVALID_ORIGIN — confirme en test
// direct (fetch() echoue, https.request() en HTTP/1.1 reussit avec un
// payload strictement identique). Cause exacte cote Neon non confirmee,
// mais le contournement est fiable et teste.
//
// Note architecture : chaque route (/api/auth/sign-in/email.ts etc.) appelle
// ce helper avec un chemin fixe plutot que via une route catch-all
// [...path].ts — un catch-all dynamique s'est avere ne pas se router
// correctement sur ce projet (404 systematique malgre plusieurs
// verifications), alors que les routes nommees fonctionnent de maniere
// fiable partout ailleurs dans ce projet (products.ts, orders.ts, etc.).

import https from 'node:https';

export const config = {
  api: {
    bodyParser: false,
  },
};

const NEON_AUTH_URL = process.env.NEON_AUTH_URL || '';

export interface VercelRequest {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>;
}

export interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string | string[]): void;
  send(body: unknown): void;
}

async function readRawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

// Liste blanche plutot que liste noire : Neon Auth valide l'origine/hote de
// la requete (rejette avec "Invalid hostname header" si un en-tete revele
// qu'elle passe par un proxy sur un autre domaine, ex. x-forwarded-host
// ajoute automatiquement par Vercel). Ne relayer que le strict necessaire.
const FORWARD_REQUEST_HEADERS = new Set(['content-type', 'cookie', 'authorization', 'accept']);
const HOP_BY_HOP_RESPONSE_HEADERS = new Set(['content-encoding', 'content-length', 'transfer-encoding', 'connection']);

interface UpstreamResponse {
  statusCode: number;
  headers: Record<string, string | string[] | undefined>;
  body: Buffer;
}

function requestNeonAuth(
  targetUrl: URL,
  method: string,
  headers: Record<string, string>,
  body: Buffer | undefined,
): Promise<UpstreamResponse> {
  return new Promise((resolve, reject) => {
    const upstreamReq = https.request(
      {
        hostname: targetUrl.hostname,
        path: `${targetUrl.pathname}${targetUrl.search}`,
        method,
        headers: {
          ...headers,
          ...(body ? { 'content-length': Buffer.byteLength(body) } : {}),
        },
      },
      upstreamRes => {
        const chunks: Buffer[] = [];
        upstreamRes.on('data', chunk => chunks.push(chunk));
        upstreamRes.on('end', () => {
          resolve({
            statusCode: upstreamRes.statusCode || 502,
            headers: upstreamRes.headers as Record<string, string | string[] | undefined>,
            body: Buffer.concat(chunks),
          });
        });
      },
    );
    upstreamReq.on('error', reject);
    if (body) upstreamReq.write(body);
    upstreamReq.end();
  });
}

export async function proxyToNeonAuth(req: VercelRequest, res: VercelResponse, targetPath: string): Promise<void> {
  if (!NEON_AUTH_URL) {
    res.status(500).send({ error: 'NEON_AUTH_URL manquante cote serveur' });
    return;
  }

  const originalUrl = req.url || '';
  const queryIndex = originalUrl.indexOf('?');
  const queryString = queryIndex >= 0 ? originalUrl.slice(queryIndex) : '';
  const targetUrl = new URL(`${NEON_AUTH_URL}/${targetPath}${queryString}`);

  const forwardHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || !FORWARD_REQUEST_HEADERS.has(key.toLowerCase())) continue;
    forwardHeaders[key] = Array.isArray(value) ? value.join(', ') : value;
  }
  // Origin fixe explicitement (jamais relaye depuis le client) : Neon Auth
  // l'exige pour valider la requete, et c'est la seule valeur confirmee
  // fonctionner en test reel.
  const originHeader = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
  forwardHeaders.origin = originHeader?.includes('vercel.app') || originHeader?.includes('localhost')
    ? originHeader
    : 'https://davis-sono-shop.vercel.app';

  const method = req.method || 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : await readRawBody(req);

  try {
    const upstream = await requestNeonAuth(targetUrl, method, forwardHeaders, body);

    res.status(upstream.statusCode);

    for (const [key, value] of Object.entries(upstream.headers)) {
      if (value === undefined || HOP_BY_HOP_RESPONSE_HEADERS.has(key.toLowerCase())) continue;
      res.setHeader(key, value);
    }

    res.send(upstream.body);
  } catch (err) {
    console.error(`Erreur proxy /api/auth/${targetPath}:`, err);
    res.status(502).send({ error: "Erreur de connexion au service d'authentification" });
  }
}
