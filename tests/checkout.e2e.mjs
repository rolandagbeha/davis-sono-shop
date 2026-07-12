/**
 * Test bout-en-bout du parcours checkout — cree une commande via la meme
 * fonction SQL que utilise api/orders.ts (create_order_with_stock_check),
 * et verifie les garanties de securite ajoutees suite a l'audit :
 *   1. Le prix/sous-total est toujours recalcule depuis le vrai prix produit
 *      en base, jamais depuis ce qu'envoie le client.
 *   2. Le stock est verifie et decremente de facon atomique (pas de
 *      survente possible).
 *   3. Une commande dont le stock est insuffisant est integralement
 *      rejetee (aucune ligne inseree, aucun stock touche).
 *
 * Necessite DATABASE_URL dans l'environnement (voir .env). Cree et nettoie
 * ses propres donnees de test — ne touche a aucune donnee reelle.
 *
 * Usage : node --env-file=.env tests/checkout.e2e.mjs
 */
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL manquante — voir .env');
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const TEST_SLUG = `e2e-test-product-${Date.now()}`;
let failures = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  OK: ${message}`);
  } else {
    console.error(`  FAIL: ${message}`);
    failures++;
  }
}

async function createOrder(orderNumber, items) {
  const [order] = await sql.query(
    'SELECT * FROM create_order_with_stock_check($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)',
    [orderNumber, 'Test E2E', '90000000', null, 'Adresse test', 'Novissi', null, 'cash', JSON.stringify(items)],
  );
  return order;
}

async function main() {
  console.log('--- Setup : produit de test ---');
  const [product] = await sql.query(
    `INSERT INTO products (name, slug, category, price, stock, is_active)
     VALUES ('Produit Test E2E', $1, 'accessoires', 100000, 2, true) RETURNING *`,
    [TEST_SLUG],
  );
  console.log(`  Produit cree : ${product.name}, prix ${product.price}, stock ${product.stock}`);

  console.log('\n--- Test 1 : commande normale ---');
  const order1 = await createOrder(`E2E-${Date.now()}-1`, [{ product_id: product.id, quantity: 1 }]);
  assert(order1.subtotal === 100000, `sous-total = ${order1.subtotal} (attendu 100000)`);
  assert(order1.status === 'pending', `statut = ${order1.status}`);

  console.log('\n--- Test 2 : prix truque par le client (doit etre ignore) ---');
  const order2 = await createOrder(`E2E-${Date.now()}-2`, [
    { product_id: product.id, quantity: 1, price: 1, subtotal: 1, total: 1 },
  ]);
  assert(order2.subtotal === 100000, `sous-total ignore le prix truque, reste = ${order2.subtotal}`);

  console.log('\n--- Test 3 : stock insuffisant (doit etre rejete entierement) ---');
  const [beforeStock] = await sql.query('SELECT stock FROM products WHERE id = $1', [product.id]);
  let rejected = false;
  try {
    await createOrder(`E2E-${Date.now()}-3`, [{ product_id: product.id, quantity: 999 }]);
  } catch (e) {
    rejected = /stock insuffisant/i.test(e.message);
  }
  assert(rejected, 'commande rejetee avec message stock insuffisant');
  const [afterStock] = await sql.query('SELECT stock FROM products WHERE id = $1', [product.id]);
  assert(afterStock.stock === beforeStock.stock, `stock inchange apres rejet (${afterStock.stock})`);

  console.log('\n--- Test 4 : stock final coherent (2 initial - 1 - 1 = 0) ---');
  const [finalStock] = await sql.query('SELECT stock FROM products WHERE id = $1', [product.id]);
  assert(finalStock.stock === 0, `stock final = ${finalStock.stock} (attendu 0)`);

  console.log('\n--- Cleanup ---');
  await sql.query("DELETE FROM orders WHERE order_number LIKE 'E2E-%'");
  await sql.query('DELETE FROM products WHERE id = $1', [product.id]);
  console.log('  Donnees de test supprimees.');

  console.log(`\n=== ${failures === 0 ? 'TOUS LES TESTS PASSENT' : `${failures} ECHEC(S)`} ===`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch(e => {
  console.error('Erreur inattendue:', e);
  process.exit(1);
});
