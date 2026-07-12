/**
 * Génère public/sitemap.xml : pages statiques + une entrée par produit actif.
 * Lancé automatiquement avant chaque build (voir package.json).
 * Lit directement Postgres (Neon) via DATABASE_URL — voir api/_db.ts pour le
 * pourquoi (le Data API exige un jeton JWT meme pour un acces anonyme).
 */
import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SITE_URL = 'https://davis-sono-shop.vercel.app'
const OUT_FILE = path.join(__dirname, '..', 'public', 'sitemap.xml')

const STATIC_PAGES = [
  { loc: '/',          changefreq: 'weekly',  priority: '1.0' },
  { loc: '/catalogue', changefreq: 'daily',   priority: '0.9' },
  { loc: '/services',  changefreq: 'monthly', priority: '0.6' },
  { loc: '/devis',     changefreq: 'monthly', priority: '0.6' },
  { loc: '/suivi',     changefreq: 'monthly', priority: '0.3' },
]

function urlEntry({ loc, changefreq, priority, lastmod }) {
  return [
    '  <url>',
    `    <loc>${SITE_URL}${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n')
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.warn('⚠️  DATABASE_URL manquante, sitemap statique conservé (pages produit non incluses)')
    process.exit(0)
  }

  const sql = neon(databaseUrl)
  let products = []
  try {
    products = await sql.query('SELECT slug, updated_at FROM products WHERE is_active = true')
  } catch (e) {
    console.error('❌ Impossible de récupérer les produits, sitemap statique conservé:', e.message)
    process.exit(0) // ne bloque jamais le build
  }

  const entries = [
    ...STATIC_PAGES.map(urlEntry),
    ...products.map((p) =>
      urlEntry({
        loc: `/produit/${p.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: p.updated_at ? new Date(p.updated_at).toISOString().slice(0, 10) : undefined,
      })
    ),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n')

  fs.writeFileSync(OUT_FILE, xml)
  console.log(`✓ sitemap.xml généré (${STATIC_PAGES.length} pages statiques + ${products.length} produits)`)
}

main().catch((e) => {
  console.error('❌ Erreur génération sitemap, build non bloqué:', e)
  process.exit(0)
})
