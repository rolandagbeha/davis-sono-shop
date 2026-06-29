/**
 * Upload toutes les images du dossier /images vers Supabase Storage
 * Usage: node scripts/upload-images.mjs <admin-email> <admin-password>
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = 'https://mswvuhjzpbwjloorczdv.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zd3Z1aGp6cGJ3amxvb3JjemR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3NDExNzUsImV4cCI6MjA5ODMxNzE3NX0.NXonKgFCSY7J3q3xVnUoZe0VUKntTHY33Puy8lRtZK0'

const ADMIN_EMAIL    = process.argv[2]
const ADMIN_PASSWORD = process.argv[3]

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error('Usage: node scripts/upload-images.mjs <email> <password>')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
const IMAGES_DIR = path.join(__dirname, '..', 'images')
const BUCKET = 'product-images'
const BASE_URL = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`

function sanitize(filename) {
  return filename
    .replace(/^WhatsApp Image \d{4}-\d{2}-\d{2} at /, '')
    .replace(/ /g, '-')
    .replace(/\(/g, '').replace(/\)/g, '')
    .replace(/\.jpeg$/, '.jpg')
    .toLowerCase()
}

async function main() {
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  })
  if (authError) { console.error('❌ Auth:', authError.message); process.exit(1) }
  console.log('✓ Connecté en tant qu\'admin\n')

  const files = fs.readdirSync(IMAGES_DIR)
    .filter(f => /\.(jpeg|jpg|png)$/i.test(f))
    .sort()

  console.log(`📸 ${files.length} images trouvées\n`)

  const results = []
  let ok = 0, fail = 0

  for (const file of files) {
    const clean = sanitize(file)
    const data  = fs.readFileSync(path.join(IMAGES_DIR, file))

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(clean, data, { contentType: 'image/jpeg', upsert: true })

    if (error) {
      console.error(`✗ ${clean}: ${error.message}`)
      fail++
    } else {
      const url = `${BASE_URL}/${clean}`
      results.push({ original: file, clean, url })
      console.log(`✓ ${clean}`)
      ok++
    }
  }

  console.log(`\n✅ ${ok} uploadées, ${fail} erreurs`)
  console.log('\n--- MAPPING (original → URL) ---')
  results.forEach(r => console.log(`${r.original} => ${r.url}`))

  // Sauvegarder le mapping dans un fichier JSON
  const out = path.join(__dirname, 'image-mapping.json')
  fs.writeFileSync(out, JSON.stringify(results, null, 2))
  console.log(`\nMapping sauvegardé dans ${out}`)
}

main().catch(console.error)
