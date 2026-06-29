import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Product, ProductCategory } from '../types';
import toast from 'react-hot-toast';

interface UseProductsOptions {
  category?:    ProductCategory;
  search?:      string;
  badge?:       string;
  isRentable?:  boolean;
  isActive?:    boolean;
  priceMin?:    number;
  priceMax?:    number;
  limit?:       number;
  offset?:      number;
  sortBy?:      'price_asc' | 'price_desc' | 'newest' | 'popular' | 'relevance';
}

interface UseProductsReturn {
  products:  Product[];
  total:     number;
  isLoading: boolean;
  error:     string | null;
  refetch:   () => void;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase.from('products').select('*', { count: 'exact' });

      if (options.isActive !== false) query = query.eq('is_active', true);
      if (options.category)           query = query.eq('category', options.category);
      if (options.badge)              query = query.eq('badge', options.badge);
      if (options.isRentable)         query = query.eq('is_rentable', true);
      if (options.search)             query = query.ilike('name', `%${options.search}%`);
      if (options.priceMin != null)   query = query.gte('price', options.priceMin);
      if (options.priceMax != null)   query = query.lte('price', options.priceMax);

      // Tri
      switch (options.sortBy) {
        case 'price_asc':  query = query.order('price', { ascending: true });  break;
        case 'price_desc': query = query.order('price', { ascending: false }); break;
        case 'newest':     query = query.order('created_at', { ascending: false }); break;
        case 'popular':    query = query.order('views', { ascending: false });  break;
        default:           query = query.order('created_at', { ascending: false });
      }

      if (options.limit)  query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit ?? 12) - 1);

      const { data, error: err, count } = await query;
      if (err) throw err;

      setProducts(data as Product[]);
      setTotal(count ?? 0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur lors du chargement des produits';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    options.category, options.search, options.badge,
    options.isRentable, options.isActive, options.priceMin,
    options.priceMax, options.limit, options.offset, options.sortBy,
  ]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, total, isLoading, error, refetch: fetch };
}

// Hook pour un produit unique par slug
export function useProduct(slug: string) {
  const [product,   setProduct]   = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetch = async () => {
      setIsLoading(true);
      const { data, error: err } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (err) {
        setError('Produit introuvable');
      } else {
        setProduct(data as Product);
        // Incrémente les vues (ignoré silencieusement si la fonction n'existe pas encore)
        supabase.rpc('increment_views', { product_id: data.id }).then(() => {});
      }
      setIsLoading(false);
    };

    fetch();
  }, [slug]);

  return { product, isLoading, error };
}

// CRUD admin
export const productService = {
  async create(data: Partial<Product>): Promise<Product> {
    const { data: created, error } = await supabase
      .from('products')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created as Product;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const { data: updated, error } = await supabase
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated as Product;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async duplicate(product: Product): Promise<Product> {
    const { id, created_at, updated_at, slug, views, ...rest } = product;
    const newSlug = `${slug}-copie-${Date.now()}`;
    const { data, error } = await supabase
      .from('products')
      .insert({ ...rest, slug: newSlug, name: `${product.name} (copie)`, is_active: false })
      .select()
      .single();
    if (error) throw error;
    toast.success('Produit dupliqué avec succès');
    return data as Product;
  },

  async uploadImage(file: File, productId: string): Promise<string> {
    const ext  = file.name.split('.').pop();
    const path = `products/${productId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) throw error;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  },
};
