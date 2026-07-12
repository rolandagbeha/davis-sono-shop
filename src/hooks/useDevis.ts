import { useState, useEffect, useCallback } from 'react';
import { client } from '../lib/neon';
import type { Devis, DevisStatus } from '../types';

interface UseDevisOptions {
  status?: DevisStatus;
  limit?:  number;
}

export function useDevis(options: UseDevisOptions = {}) {
  const [devisList, setDevisList] = useState<Devis[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = client
        .from('devis')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (options.status) query = query.eq('status', options.status);
      if (options.limit)  query = query.limit(options.limit);

      const { data, error: err, count } = await query;
      if (err) throw err;
      setDevisList(data as Devis[]);
      setTotal(count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur chargement devis');
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.limit]);

  useEffect(() => { fetch(); }, [fetch]);

  return { devisList, total, isLoading, error, refetch: fetch };
}

export const devisService = {
  // Cree via /api/devis (connexion Postgres directe cote serveur) — meme
  // raison que orderService.create, voir HANDOFF_CLAUDE_CODE.md.
  async create(data: Omit<Devis, 'id' | 'created_at'>): Promise<Devis> {
    const res = await fetch('/api/devis', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Erreur creation devis');
    return body.devis as Devis;
  },

  async updateStatus(id: string, status: DevisStatus): Promise<void> {
    const { error } = await client
      .from('devis')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },
};
