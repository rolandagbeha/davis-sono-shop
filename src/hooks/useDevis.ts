import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
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
      let query = supabase
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
  async create(data: Omit<Devis, 'id' | 'created_at'>): Promise<Devis> {
    const { data: created, error } = await supabase
      .from('devis')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created as Devis;
  },

  async updateStatus(id: string, status: DevisStatus): Promise<void> {
    const { error } = await supabase
      .from('devis')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  },
};
