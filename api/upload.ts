// Fonction serverless Vercel — upload d'images produit vers Vercel Blob.
// Remplace supabase.storage (Neon n'a pas d'equivalent Storage).
//
// Le fichier est envoye par le client en octets bruts (pas en multipart) via
// fetch(url, { body: file }) : content-type = type MIME du fichier, corps =
// octets bruts. On desactive donc le body-parser par defaut de Vercel et on
// lit le flux nous-memes.
//
// Variable d'environnement requise (creee automatiquement par Vercel quand un
// store Blob est rattache au projet) : BLOB_READ_WRITE_TOKEN.
import { put } from '@vercel/blob';
import { verifyAdmin } from './_neon.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[] | undefined>;
  // Node request est un flux asynchrone (IncomingMessage) — on l'itere directement.
  [Symbol.asyncIterator](): AsyncIterableIterator<Buffer>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

class PayloadTooLargeError extends Error {}

async function readRawBody(req: VercelRequest, maxBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let total = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    total += buf.length;
    if (total > maxBytes) throw new PayloadTooLargeError('Fichier trop volumineux');
    chunks.push(buf);
  }
  return Buffer.concat(chunks);
}

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({
      error:
        'BLOB_READ_WRITE_TOKEN manquant. Rattachez un store Vercel Blob au projet (Vercel > Storage > Blob) puis redeployez.',
    });
    return;
  }

  const isAdmin = await verifyAdmin(req.headers.authorization);
  if (!isAdmin) {
    res.status(401).json({ error: 'Non autorise' });
    return;
  }

  const productId = firstValue(req.query.productId) || 'divers';
  const contentType = firstValue(req.headers['content-type'] as string | string[] | undefined) || '';

  if (!ALLOWED_CONTENT_TYPES.has(contentType)) {
    res.status(400).json({ error: 'Type de fichier non autorise (image/jpeg, image/png ou image/webp uniquement)' });
    return;
  }

  const ext = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';

  try {
    const body = await readRawBody(req, MAX_UPLOAD_BYTES);
    if (!body.length) {
      res.status(400).json({ error: 'Fichier vide' });
      return;
    }

    const blob = await put(`products/${productId}/${Date.now()}.${ext}`, body, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });

    res.status(200).json({ url: blob.url });
  } catch (err) {
    if (err instanceof PayloadTooLargeError) {
      res.status(413).json({ error: 'Fichier trop volumineux (5 Mo maximum)' });
      return;
    }
    console.error('Erreur upload Vercel Blob:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur upload image' });
  }
}
