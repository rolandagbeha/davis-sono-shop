import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { client } from '../lib/neon';

// Types minimaux — le SupabaseAuthAdapter de @neondatabase/neon-js retourne
// des objets compatibles avec la forme User / Session de @supabase/supabase-js
// (voir https://neon.com/docs/auth/migrate/from-supabase).
interface NeonUser {
  id: string;
  email?: string;
  [key: string]: unknown;
}

interface NeonSession {
  access_token: string;
  user: NeonUser;
  [key: string]: unknown;
}

interface AuthContextValue {
  user: NeonUser | null;
  session: NeonSession | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<NeonUser | null>(null);
  const [session,   setSession]   = useState<NeonSession | null>(null);
  const [isAdmin,   setIsAdmin]   = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Un compte Neon Auth authentifié n'est pas forcément admin : on vérifie
  // l'appartenance réelle à la table "admins" en sondant une table protégée
  // par la policy RLS is_admin() (voir neon/schema.sql). On interroge la
  // table "settings" plutôt que d'appeler is_admin() en RPC directement :
  // le cache de routes du Data API ne connaît pas encore les fonctions tout
  // juste créées après une migration de schéma, alors qu'une table déjà
  // exposée fonctionne immédiatement (Postgres évalue la policy RLS à la
  // volée, sans dépendre de ce cache).
  const checkIsAdmin = async (): Promise<boolean> => {
    const { data, error } = await client.from('settings').select('key').limit(1);
    if (error) return false;
    return Array.isArray(data) && data.length > 0;
  };

  const refreshSession = async () => {
    const { data } = await client.auth.getSession();
    const currentSession = (data?.session ?? null) as NeonSession | null;
    setSession(currentSession);
    setUser(currentSession?.user ?? null);
    setIsAdmin(currentSession ? await checkIsAdmin() : false);
  };

  useEffect(() => {
    refreshSession().finally(() => setIsLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await refreshSession();
  };

  const signOut = async () => {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    setSession(null);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}
