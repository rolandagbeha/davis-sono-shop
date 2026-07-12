// Connexion Postgres directe (contourne le Data API) — utilisee par les
// endpoints publics /api/products, /api/orders, /api/devis.
//
// Pourquoi : le plugin d'authentification "anonymous" de Neon Auth n'est pas
// disponible sur ce projet (route /sign-in/anonymous absente, verifie via
// tests directs), donc le Data API rejette toute requete non authentifiee
// meme quand les policies RLS autorisent le role "anonymous". Voir
// HANDOFF_CLAUDE_CODE.md pour le detail.
//
// Variable d'environnement requise (Vercel > Settings > Environment
// Variables) : DATABASE_URL — chaine de connexion Postgres Neon (bouton
// "Connect" sur le dashboard du projet, prendre la version "Pooled
// connection" pour les fonctions serverless).
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || '';

if (!DATABASE_URL) {
  console.warn('DATABASE_URL manquante — les endpoints publics /api/products, /api/orders, /api/devis ne fonctionneront pas.');
}

export const sql = neon(DATABASE_URL);
