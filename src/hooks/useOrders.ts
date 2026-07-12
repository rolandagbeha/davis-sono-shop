import { useState, useEffect, useCallback } from 'react';
import { client } from '../lib/neon';
import type { Order, OrderStatus, PaymentMethod } from '../types';
import toast from 'react-hot-toast';
import { notifyClientStatusChange } from '../lib/whatsapp';

interface UseOrdersOptions {
  status?:  OrderStatus;
  limit?:   number;
  offset?:  number;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders,    setOrders]    = useState<Order[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = client
        .from('orders')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (options.status) query = query.eq('status', options.status);
      if (options.limit)  query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);

      const { data, error: err, count } = await query;
      if (err) throw err;
      setOrders(data as Order[]);
      setTotal(count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur chargement commandes');
    } finally {
      setIsLoading(false);
    }
  }, [options.status, options.limit, options.offset]);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, total, isLoading, error, refetch: fetch };
}

export interface CreateOrderInput {
  order_number:           string;
  client_name:            string;
  client_phone:           string;
  client_email?:          string;
  client_address:         string;
  client_neighborhood:    string;
  delivery_instructions?: string;
  payment_method:         PaymentMethod;
  items:                  { product_id: string; quantity: number }[];
}

export const orderService = {
  // Cree via /api/orders (connexion Postgres directe cote serveur) : le Data
  // API exige un jeton JWT meme pour un visiteur non connecte, et le plugin
  // d'auth "anonymous" de Neon n'est pas disponible sur ce projet — voir
  // HANDOFF_CLAUDE_CODE.md et api/_db.ts.
  //
  // Seuls product_id + quantity sont envoyes par article : le prix, le
  // sous-total et le total sont toujours recalcules cote serveur a partir du
  // vrai prix/stock en base (create_order_with_stock_check), jamais a partir
  // de valeurs fournies par le navigateur — voir audit securite section 2.
  async create(orderData: CreateOrderInput): Promise<Order> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body.error ?? 'Erreur creation commande');
    return body.order as Order;
  },

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    order: Order,
  ): Promise<void> {
    const { error } = await client
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) throw error;

    // Notifie le client via WhatsApp
    notifyClientStatusChange(
      order.order_number,
      order.client_name,
      order.client_phone,
      newStatus,
    );

    toast.success('Statut mis à jour');
  },

  async getById(id: string): Promise<Order | null> {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return null;
    return data as Order;
  },

  // Export CSV des commandes
  exportCsv(orders: Order[]): void {
    const headers = [
      'Numéro', 'Client', 'Téléphone', 'Total', 'Statut', 'Paiement', 'Date',
    ];
    const rows = orders.map(o => [
      o.order_number,
      o.client_name,
      o.client_phone,
      o.total,
      o.status,
      o.payment_method,
      new Date(o.created_at).toLocaleDateString('fr-FR'),
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(','))
      .join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
