import { useState, useEffect } from 'react';
import { client } from '../lib/neon';
import type { Product, StockMovement } from '../types';
import toast from 'react-hot-toast';

export function useInventory() {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await client
        .from('products')
        .select('id, name, category, stock, stock_alert, images, is_active')
        .order('stock', { ascending: true });

      if (err) throw err;
      setProducts(data as Product[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur chargement inventaire');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const updateStock = async (
    productId: string,
    newStock: number,
    reason: string,
    type: 'in' | 'out' | 'adjustment' = 'adjustment',
  ) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      // Met à jour le stock produit
      await client
        .from('products')
        .update({ stock: newStock, updated_at: new Date().toISOString() })
        .eq('id', productId);

      // Enregistre le mouvement de stock
      const movement: Omit<StockMovement, 'id' | 'created_at'> = {
        product_id: productId,
        type,
        quantity:   Math.abs(newStock - product.stock),
        reason,
      };
      await client.from('stock_movements').insert(movement);

      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, stock: newStock } : p)),
      );

      toast.success('Stock mis à jour');
    } catch {
      toast.error('Erreur mise à jour stock');
    }
  };

  const getMovements = async (productId: string): Promise<StockMovement[]> => {
    const { data } = await client
      .from('stock_movements')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })
      .limit(20);
    return (data as StockMovement[]) ?? [];
  };

  const lowStockProducts  = products.filter(p => p.stock > 0 && p.stock <= p.stock_alert);
  const outOfStockProducts = products.filter(p => p.stock === 0);

  return {
    products,
    lowStockProducts,
    outOfStockProducts,
    isLoading,
    error,
    refetch: fetch,
    updateStock,
    getMovements,
  };
}
