// Fonction serverless Vercel — assistant IA de Davis Sono Shop.
// Toute cle secrete reste cote serveur : ANTHROPIC_API_KEY doit etre definie
// dans Vercel > Settings > Environment Variables (jamais commit dans le code).
// Point d'entree unique multi-actions pour limiter le nombre de fonctions deployees.

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

import { fetchActiveProducts, verifyAdmin } from './_neon.js';
import type { ProductRow } from './_neon.js';
import { callClaude, ANTHROPIC_API_KEY } from './_claude.js';
import type { ChatMessage } from './_claude.js';
import { checkRateLimit, clientIp } from './_rateLimit.js';

const MODEL_CHAT = 'claude-haiku-4-5-20251001';
const MODEL_ADMIN = 'claude-sonnet-5';

const SHOP_CONTEXT =
  "Tu es l'assistant virtuel de Davis Sono Shop, boutique de materiel audio professionnel et " +
  "d'instruments de musique a Lome, Togo (quartier Novissi, non loin de l'UTB). " +
  'Contact boutique : 98 42 32 32 / 90 54 83 82 / 71 66 66 68.';

function extractJson<T>(raw: string, fallback: T): T {
  try {
    const arrayMatch = raw.match(/\[[\s\S]*\]/);
    const objectMatch = raw.match(/\{[\s\S]*\}/);
    const candidate = arrayMatch?.[0] ?? objectMatch?.[0] ?? raw;
    return JSON.parse(candidate) as T;
  } catch {
    return fallback;
  }
}

function formatCatalogForChat(products: ProductRow[]): string {
  return products
    .map(p => {
      const rental = p.is_rentable ? `, location ${p.rental_price_day ?? '?'} FCFA/jour` : '';
      const stockNote = p.stock === 0 ? ' [rupture de stock]' : '';
      return `- ${p.name} (${p.category}) : ${p.price} FCFA${rental}${stockNote} — ${p.short_description ?? ''}`;
    })
    .join('\n');
}

function formatCatalogForRecommend(products: ProductRow[], excludeSlug?: string): string {
  return products
    .filter(p => p.slug !== excludeSlug)
    .map(p => `${p.slug} | ${p.name} | ${p.category} | ${p.price} FCFA | ${p.short_description ?? ''}`)
    .join('\n');
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Methode non autorisee' });
    return;
  }

  if (!ANTHROPIC_API_KEY) {
    res.status(500).json({
      error:
        "Cle ANTHROPIC_API_KEY manquante sur le serveur. Ajoutez-la dans Vercel > Settings > Environment Variables puis redeployez.",
    });
    return;
  }

  // Chaque appel a un cout Anthropic reel — limite par IP sur toutes les
  // actions (y compris admin_chat/generate_description, deja protegees par
  // verifyAdmin mais pas par un rate limit).
  if (!(await checkRateLimit(`ai:${clientIp(req.headers)}`, 30, 300))) {
    res.status(429).json({ error: 'Trop de requetes, reessayez dans quelques minutes' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  const action = body.action as string;

  try {
    switch (action) {
      case 'chat': {
        const messages = (Array.isArray(body.messages) ? body.messages : []) as ChatMessage[];
        const products = await fetchActiveProducts();
        const catalog = formatCatalogForChat(products);

        const system = `${SHOP_CONTEXT}
Tu reponds en francais, de maniere chaleureuse, concise et professionnelle (3-5 phrases maximum sauf si plus de details sont demandes). Tu aides les clients a choisir du materiel audio/musical en te basant UNIQUEMENT sur le catalogue ci-dessous (n'invente jamais de produit ni de prix absent de la liste). Encourage a finaliser via "Demander un devis" ou WhatsApp quand c'est pertinent. Si le catalogue ne contient pas ce qui est demande, dis-le honnetement et propose une alternative ou le contact WhatsApp.

Catalogue actuel (produits actifs) :
${catalog || 'Aucun produit disponible actuellement.'}`;

        const reply = await callClaude(MODEL_CHAT, system, messages, 500);
        res.status(200).json({ reply });
        return;
      }

      case 'recommend': {
        const context = typeof body.context === 'string' ? body.context : '';
        const excludeSlug = typeof body.excludeSlug === 'string' ? body.excludeSlug : undefined;
        const products = await fetchActiveProducts();
        const catalog = formatCatalogForRecommend(products, excludeSlug);

        const system = `${SHOP_CONTEXT}
Choisis jusqu'a 4 produits pertinents dans la liste ci-dessous en fonction du contexte fourni par l'utilisateur. Reponds UNIQUEMENT avec un tableau JSON valide d'objets {"slug": string, "reason": string}, "reason" etant une phrase courte en francais expliquant la recommandation. N'invente aucun slug hors de cette liste.

Produits disponibles (slug | nom | categorie | prix | description) :
${catalog || 'Aucun produit disponible.'}`;

        const userMsg = context || 'Recommande des produits populaires et complementaires du catalogue.';
        const raw = await callClaude(MODEL_CHAT, system, [{ role: 'user', content: userMsg }], 400);
        const recommendations = extractJson<{ slug: string; reason: string }[]>(raw, []);

        res.status(200).json({ recommendations: Array.isArray(recommendations) ? recommendations : [] });
        return;
      }

      case 'admin_chat': {
        const isAdmin = await verifyAdmin(req.headers.authorization);
        if (!isAdmin) {
          res.status(401).json({ error: 'Non autorise' });
          return;
        }

        const messages = (Array.isArray(body.messages) ? body.messages : []) as ChatMessage[];
        const statsContext = typeof body.statsContext === 'string' ? body.statsContext : '';

        const system = `Tu es l'assistant IA interne de la gerance de Davis Sono Shop (Lome, Togo). Tu aides le gerant a analyser ses ventes, comprendre ses chiffres, rediger des reponses clients et prendre de meilleures decisions commerciales. Sois direct, concret et chiffre quand possible, en francais.

Donnees actuelles du dashboard :
${statsContext || 'Aucune donnee fournie.'}`;

        const reply = await callClaude(MODEL_ADMIN, system, messages, 800);
        res.status(200).json({ reply });
        return;
      }

      case 'generate_description': {
        const isAdmin = await verifyAdmin(req.headers.authorization);
        if (!isAdmin) {
          res.status(401).json({ error: 'Non autorise' });
          return;
        }

        const name = typeof body.name === 'string' ? body.name : '';
        const category = typeof body.category === 'string' ? body.category : '';
        const hints = typeof body.hints === 'string' ? body.hints : '';

        if (!name.trim()) {
          res.status(400).json({ error: 'Nom du produit requis' });
          return;
        }

        const system =
          'Tu es un redacteur commercial pour Davis Sono Shop, boutique de materiel audio et instruments de musique a Lome, Togo. Tu ecris en francais, ton professionnel et vendeur mais honnete, sans emojis. Reponds UNIQUEMENT avec un objet JSON valide : {"short_description": string (100 caracteres maximum), "description": string (80 a 150 mots, peut contenir des retours a la ligne)}.';

        const userMsg = `Produit : ${name}\nCategorie : ${category || 'non precisee'}\nInfos complementaires : ${hints || 'aucune'}`;
        const raw = await callClaude(MODEL_ADMIN, system, [{ role: 'user', content: userMsg }], 500);
        const result = extractJson<{ short_description: string; description: string }>(raw, {
          short_description: '',
          description: raw,
        });

        res.status(200).json(result);
        return;
      }

      default:
        res.status(400).json({ error: 'Action inconnue' });
    }
  } catch (err) {
    console.error('Erreur assistant IA:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur serveur IA' });
  }
}
