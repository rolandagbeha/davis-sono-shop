import { useState, useEffect, useCallback } from 'react';
import { client } from '../lib/neon';
import type { Product, ProductCategory } from '../types';
import toast from 'react-hot-toast';

export type ProductSortBy = 'price_asc' | 'price_desc' | 'newest' | 'popular' | 'relevance';

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
  sortBy?:      ProductSortBy;
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
      const params = new URLSearchParams();
      if (options.category)         params.set('category', options.category);
      if (options.badge)            params.set('badge', options.badge);
      if (options.isRentable)       params.set('isRentable', 'true');
      if (options.search)           params.set('search', options.search);
      if (options.priceMin != null) params.set('priceMin', String(options.priceMin));
      if (options.priceMax != null) params.set('priceMax', String(options.priceMax));
      if (options.sortBy)           params.set('sortBy', options.sortBy);
      if (options.limit)            params.set('limit', String(options.limit));
      if (options.offset)           params.set('offset', String(options.offset));

      const res = await window.fetch(`/api/products?${params.toString()}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'Erreur lors du chargement des produits');

      setProducts(body.products as Product[]);
      setTotal(body.total ?? 0);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur lors du chargement des produits';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [
    options.category, options.search, options.badge,
    options.isRentable, options.priceMin,
    options.priceMax, options.limit, options.offset, options.sortBy,
  ]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, total, isLoading, error, refetch: fetch };
}

// Liste admin (authentifiee, via Data API) — voit aussi les produits
// is_active=false, contrairement a useProducts() qui passe par /api/products
// (public, ne renvoie que les produits actifs). Policy RLS "products_all_admin".
export function useAdminProducts(options: { search?: string } = {}) {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [total,     setTotal]     = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      let query = client.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false });
      if (options.search) query = query.ilike('name', `%${options.search}%`);

      const { data, error: err, count } = await query;
      if (err) throw err;
      setProducts(data as Product[]);
      setTotal(count ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoading(false);
    }
  }, [options.search]);

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
      try {
        const res = await window.fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error ?? 'Produit introuvable');
        setProduct(body.product as Product);
      } catch {
        setError('Produit introuvable');
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
    const { data: created, error } = await client
      .from('products')
      .insert(data)
      .select()
      .single();
    if (error) throw error;
    return created as Product;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const { data: updated, error } = await client
      .from('products')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated as Product;
  },

  async delete(id: string): Promise<void> {
    const { error } = await client.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  async duplicate(product: Product): Promise<Product> {
    const { id, created_at, updated_at, slug, views, ...rest } = product;
    const newSlug = `${slug}-copie-${Date.now()}`;
    const { data, error } = await client
      .from('products')
      .insert({ ...rest, slug: newSlug, name: `${product.name} (copie)`, is_active: false })
      .select()
      .single();
    if (error) throw error;
    toast.success('Produit duplique avec succes');
    return data as Product;
  },

  // Upload via Vercel Blob (fonction serverless /api/upload) — Neon n'a pas
  // d'equivalent au Storage de Supabase. Le fichier est envoye en octets bruts
  // (pas en multipart) pour eviter d'avoir a parser du form-data cote serveur.
  async uploadImage(file: File, productId: string, accessToken?: string): Promise<string> {
    const params = new URLSearchParams({
      productId,
      filename: file.name,
    });

    const res = await fetch(`/api/upload?${params.toString()}`, {
      method: 'POST',
      headers: {
        'content-type': file.type || 'application/octet-stream',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: file,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Erreur upload image' }));
      throw new Error(err.error ?? 'Erreur upload image');
    }
    const { url } = (await res.json()) as { url: string };
    return url;
  },
};
