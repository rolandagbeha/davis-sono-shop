// Client Neon Auth + Neon Data API — remplace l'ancien src/lib/supabase.ts.
//
// SupabaseAuthAdapter conserve exactement la même API que @supabase/supabase-js
// (client.auth.signInWithPassword, .getSession, .getUser, .signOut, .updateUser,
// client.from('table').select()/.insert()/.update()/.delete()/.eq()/.single()...),
// ce qui a permis de migrer le code existant en changeant uniquement l'import.
//
// L'URL d'auth pointe vers /api/auth (meme origine que le site), PAS
// directement vers le domaine Neon Auth : un vrai navigateur envoie
// Sec-Fetch-Site: cross-site sur un appel direct cross-origin, et Neon Auth
// rejette alors sign-in/sign-up avec 403 INVALID_ORIGIN (confirme en test
// reel — un simple curl ne reproduit pas ce comportement, d'ou un faux
// negatif si on ne teste qu'au curl). api/auth/[...path].ts fait le relai
// cote serveur vers le vrai NEON_AUTH_URL. Le Data API, lui, n'a pas ce
// probleme (teste directement en cross-site, fonctionne) : VITE_NEON_DATA_API_URL
// reste donc l'URL Neon directe.
import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js';

const authUrl    = typeof window !== 'undefined' ? `${window.location.origin}/api/auth` : '';
const dataApiUrl = import.meta.env.VITE_NEON_DATA_API_URL as string;

if (!dataApiUrl) {
  console.warn('⚠️  Variable VITE_NEON_DATA_API_URL manquante — vérifie ton .env');
}

export const client = createClient({
  auth: {
    url: authUrl || 'https://placeholder.neon.build/placeholder/auth',
    adapter: SupabaseAuthAdapter(),
    // Requis pour que les visiteurs non connectés obtiennent un jeton anonyme
    // (sinon le Data API rejette toute requête sans Authorization: Bearer).
    // Ne fonctionnera que si le plugin "anonymous" est activé côté Neon Auth —
    // voir HANDOFF_CLAUDE_CODE.md, non confirmé disponible sur ce projet.
    allowAnonymous: true,
  },
  dataApi: {
    url: dataApiUrl || 'https://placeholder.neon.build/placeholder/rest/v1',
  },
});
