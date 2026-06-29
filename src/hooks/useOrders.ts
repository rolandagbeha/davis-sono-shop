import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Order, OrderStatus } from '../types';
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
      let query = supabase
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

export const orderService = {
  async create(orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
    if (error) throw error;

    // Décrémente le stock pour chaque article
    for (const item of orderData.items) {
      supabase.rpc('decrement_stock', {
        p_product_id: item.product_id,
        p_quantity:   item.quantity,
      }).then(() => {});
    }

    return data as Order;
  },

  async updateStatus(
    orderId: string,
    newStatus: OrderStatus,
    order: Order,
  ): Promise<void> {
    const { error } = await supabase
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
    const { data, error } = await supabase
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
