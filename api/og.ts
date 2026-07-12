// Fonction serverless Vercel — sert index.html avec des balises Open Graph
// specifiques au produit pour /produit/:slug (voir vercel.json > rewrites).
//
// Pourquoi : useDocumentMeta.ts met a jour <title>/<meta> cote client apres
// l'hydratation React, mais les crawlers de partage (WhatsApp, Facebook,
// Twitter) ne executent pas le JS — ils lisent uniquement le HTML brut de la
// premiere reponse. Sans ca, tout lien produit partage affiche le logo/texte
// generique du site, jamais la photo/le prix du produit reel.
//
// Approche : recupere le vrai index.html buide (deja deploye, mêmes assets
// hashes que le build courant) via une requete HTTP vers le propre domaine,
// puis remplace les balises title/description/OG/Twitter par les valeurs du
// produit avant de renvoyer le HTML. Si le produit n'existe pas ou en cas
// d'erreur, renvoie le HTML generique tel quel (fallback silencieux — la SPA
// affichera son propre message "produit introuvable" cote client).
import { sql } from './_db.js';

interface VercelRequest {
  query: Record<string, string | string[] | undefined>;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  setHeader(name: string, value: string): void;
  send(body: string): void;
}

function firstValue(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatFCFA(n: number): string {
  return new Intl.NumberFormat('fr-FR').format(n) + ' FCFA';
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const slug = firstValue(req.query.slug);
  const host = firstValue(req.headers['x-forwarded-host'] as string | string[] | undefined) ||
               firstValue(req.headers.host as string | string[] | undefined) ||
               'davis-sono-shop.vercel.app';
  const proto = firstValue(req.headers['x-forwarded-proto'] as string | string[] | undefined) || 'https';
  const origin = `${proto}://${host}`;

  try {
    const baseHtml = await (await fetch(`${origin}/index.html`)).text();

    if (!slug) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(baseHtml);
      return;
    }

    const rows = await sql.query(
      'SELECT name, short_description, price, images, slug FROM products WHERE slug = $1 AND is_active = true LIMIT 1',
      [slug],
    );
    const product = rows[0] as { name: string; short_description: string | null; price: number; images: string[]; slug: string } | undefined;

    if (!product) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(baseHtml);
      return;
    }

    const title = `${product.name} — ${formatFCFA(product.price)} | Davis Sono Shop`;
    const description = (product.short_description || 'Materiel audio professionnel et instruments de musique a Lome, Togo.').slice(0, 200);
    const image = product.images?.[0] || `${origin}/logo.jpg`;
    const url = `${origin}/produit/${product.slug}`;

    const t = escapeHtml(title);
    const d = escapeHtml(description);
    const i = escapeHtml(image);
    const u = escapeHtml(url);

    let html = baseHtml
      .replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${d}" />`)
      .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${t}" />`)
      .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${d}" />`)
      .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${i}" />`)
      .replace(/<meta property="og:type" content="[^"]*"\s*\/>/, `<meta property="og:type" content="product" />`)
      .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${t}" />`)
      .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${d}" />`)
      .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${i}" />`);

    // og:url n'existe pas dans le template de base — l'ajouter juste apres og:image.
    html = html.replace(
      /(<meta property="og:image" content="[^"]*"\s*\/>)/,
      `$1\n    <meta property="og:url" content="${u}" />`,
    );

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  } catch (err) {
    console.error('Erreur /api/og:', err);
    // Fallback : ne jamais faire planter la page produit a cause de l'OG.
    try {
      const baseHtml = await (await fetch(`${origin}/index.html`)).text();
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(200).send(baseHtml);
    } catch {
      res.status(500).send('Erreur serveur');
    }
  }
}
