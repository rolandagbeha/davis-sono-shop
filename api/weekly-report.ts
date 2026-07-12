// Fonction serverless Vercel — rapport hebdomadaire automatique de l'activite
// de la boutique, envoye par email au gerant. Declenchee automatiquement par
// Vercel Cron (voir vercel.json > "crons"), jamais appelable publiquement.
//
// Securite : Vercel ajoute automatiquement l'en-tete
// "Authorization: Bearer $CRON_SECRET" a ses propres appels Cron des lors que
// la variable d'environnement CRON_SECRET est definie sur le projet — on
// verifie ce jeton ici pour rejeter tout appel externe. Voir
// HANDOFF_CLAUDE_CODE.md pour la configuration complete.
//
// Utilise une connexion Postgres directe (api/_db.ts) plutot que le Data API :
// meme raison que pour les routes publiques (products/orders/devis), et de
// toute facon ce endpoint n'est jamais appele par un visiteur.

import { sql } from './_db.js';
import { callClaude, ANTHROPIC_API_KEY } from './_claude.js';

interface VercelRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
}

interface VercelResponse {
  status(code: number): VercelResponse;
  json(body: unknown): void;
}

const CRON_SECRET      = process.env.CRON_SECRET || '';
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
const SENDGRID_FROM    = process.env.SENDGRID_FROM_EMAIL || '';
const REPORT_TO_EMAIL  = process.env.REPORT_TO_EMAIL || '';

interface OrderRow { status: string; total: string | number | null; created_at: string; }
interface ProductRow { name: string; stock: number; stock_alert: number; }
interface DevisRow { id: string; }

async function buildStatsContext(): Promise<string> {
  const now = new Date();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [orderRows, productRows, devisRows] = await Promise.all([
    sql.query('SELECT status, total, created_at FROM orders'),
    sql.query('SELECT name, stock, stock_alert FROM products WHERE is_active = true'),
    sql.query("SELECT id FROM devis WHERE status = 'new'"),
  ]);

  const orders   = orderRows as OrderRow[];
  const products = productRows as ProductRow[];
  const devis    = devisRows as DevisRow[];

  const weekOrders  = orders.filter(o => o.status !== 'cancelled' && o.created_at >= weekStart);
  const revenueWeek = weekOrders.reduce((s, o) => s + Number(o.total ?? 0), 0);
  const outOfStock  = products.filter(p => p.stock === 0).map(p => p.name);
  const lowStock    = products.filter(p => p.stock > 0 && p.stock <= p.stock_alert).map(p => p.name);

  return [
    `Periode analysee : 7 derniers jours (jusqu'au ${now.toLocaleDateString('fr-FR')})`,
    `Commandes cette semaine : ${weekOrders.length}`,
    `Chiffre d'affaires cette semaine : ${revenueWeek} FCFA`,
    `Commandes au total (toutes periodes confondues) : ${orders.length}`,
    `Devis en attente de traitement : ${devis.length}`,
    `Produits en rupture de stock : ${outOfStock.length ? outOfStock.join(', ') : 'aucun'}`,
    `Produits a stock faible : ${lowStock.length ? lowStock.join(', ') : 'aucun'}`,
  ].join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function toEmailHtml(statsContext: string, analysis: string): string {
  return `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h2 style="color:#c9a227; margin-bottom: 4px;">Rapport hebdomadaire — Davis Sono Shop</h2>
      <p style="color:#666; font-size: 13px; margin-top: 0;">Genere automatiquement le ${new Date().toLocaleDateString('fr-FR')}</p>
      <div style="background:#f5f5f5; border-radius:8px; padding:14px 16px; white-space: pre-wrap; font-size:13px; line-height:1.6;">${escapeHtml(statsContext)}</div>
      <h3 style="margin-top:22px;">Analyse et recommandations</h3>
      <div style="white-space: pre-wrap; line-height:1.6; font-size:14px;">${escapeHtml(analysis)}</div>
    </div>
  `;
}

async function sendReportEmail(html: string): Promise<void> {
  const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: REPORT_TO_EMAIL }] }],
      from: { email: SENDGRID_FROM, name: 'Davis Sono Shop' },
      subject: `Rapport hebdomadaire — Davis Sono Shop (${new Date().toLocaleDateString('fr-FR')})`,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  // SendGrid renvoie 202 (mis en file) et non 200 — voir doc SendGrid.
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Erreur envoi SendGrid (${res.status}) : ${errText}`);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const authHeaderRaw = req.headers.authorization;
  const authHeader = Array.isArray(authHeaderRaw) ? authHeaderRaw[0] : authHeaderRaw;

  if (!CRON_SECRET) {
    res.status(500).json({
      error: 'CRON_SECRET manquant sur le serveur. Ajoutez-le dans Vercel > Settings > Environment Variables (voir HANDOFF_CLAUDE_CODE.md).',
    });
    return;
  }

  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    res.status(401).json({ error: 'Non autorise' });
    return;
  }

  if (!ANTHROPIC_API_KEY || !SENDGRID_API_KEY || !SENDGRID_FROM || !REPORT_TO_EMAIL) {
    res.status(500).json({
      error:
        'Variables manquantes pour le rapport hebdomadaire (ANTHROPIC_API_KEY, SENDGRID_API_KEY, ' +
        'SENDGRID_FROM_EMAIL, REPORT_TO_EMAIL) — voir HANDOFF_CLAUDE_CODE.md.',
    });
    return;
  }

  try {
    const statsContext = await buildStatsContext();

    const analysis = await callClaude(
      'claude-sonnet-5',
      "Tu es l'assistant IA interne de la gerance de Davis Sono Shop (Lome, Togo). " +
        "A partir des donnees fournies, redige une courte analyse (5 a 8 phrases) : tendance de " +
        "la semaine, alertes de stock a traiter en priorite, et une recommandation commerciale " +
        'concrete. Reponds en francais, ton direct et concret, sans markdown.',
      [{ role: 'user', content: statsContext }],
      500,
    );

    await sendReportEmail(toEmailHtml(statsContext, analysis));

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erreur rapport hebdomadaire:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Erreur rapport hebdomadaire' });
  }
}
