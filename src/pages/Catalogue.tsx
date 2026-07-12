import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Grid3X3, List, SlidersHorizontal, X, ChevronLeft, ChevronRight, Speaker } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import type { ProductSortBy } from '../hooks/useProducts';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/Spinner';
import { SearchBar } from '../components/ui/SearchBar';
import { EmptyState } from '../components/ui/EmptyState';
import type { ProductCategory } from '../types';

const CATEGORIES: { value: ProductCategory | ''; label: string }[] = [
  { value: '',               label: 'Toutes les categories' },
  { value: 'sonorisation',   label: 'Sonorisation' },
  { value: 'mixeurs',        label: 'Mixeurs & EQ' },
  { value: 'amplificateurs', label: 'Amplificateurs' },
  { value: 'claviers',       label: 'Claviers' },
  { value: 'guitares',       label: 'Guitares & Basses' },
  { value: 'batteries',      label: 'Batteries & Percus' },
  { value: 'instruments',    label: 'Instruments' },
  { value: 'accessoires',    label: 'Accessoires' },
];

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix decroissant' },
  { value: 'newest',    label: 'Nouveautes' },
  { value: 'popular',   label: 'Populaires' },
];

const PAGE_SIZE = 12;

export default function Catalogue() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [layout,        setLayout]      = useState<'grid' | 'list'>('grid');
  const [filtersOpen,   setFiltersOpen] = useState(false);

  const category  = (searchParams.get('category') || '') as ProductCategory | '';
  const search    = searchParams.get('search') || '';
  const badge     = searchParams.get('badge') || '';
  const rentable  = searchParams.get('rentable') === 'true';
  const sortBy    = (searchParams.get('sort') || 'relevance') as ProductSortBy;
  const priceMin  = searchParams.get('pmin') ? parseInt(searchParams.get('pmin')!) : undefined;
  const priceMax  = searchParams.get('pmax') ? parseInt(searchParams.get('pmax')!) : undefined;
  const page      = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const categoryLabel = CATEGORIES.find(c => c.value === category)?.label;
  useDocumentMeta({
    title: categoryLabel && category ? categoryLabel : 'Catalogue',
    description: 'Decouvrez notre catalogue de materiel audio professionnel et instruments de musique a Lome, Togo : enceintes, mixeurs, amplis, guitares, claviers et plus.',
  });

  const { products, total, isLoading } = useProducts({
    category:   category || undefined,
    search:     search || undefined,
    badge:      badge || undefined,
    isRentable: rentable || undefined,
    priceMin,
    priceMax,
    sortBy,
    limit:  PAGE_SIZE,
    offset: (page - 1) * PAGE_SIZE,
  });

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const goToPage = useCallback((newPage: number) => {
    const next = new URLSearchParams(searchParams);
    if (newPage <= 1) next.delete('page');
    else next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchParams, setSearchParams]);

  const setParam = useCallback((key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div>
        <h4 className="font-heading font-semibold text-white mb-3 text-sm">Categorie</h4>
        <div className="space-y-2">
          {CATEGORIES.map(cat => (
            <label key={cat.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="category"
                checked={category === cat.value}
                onChange={() => setParam('category', cat.value)}
                className="accent-gold"
              />
              <span className={`text-sm transition-colors ${category === cat.value ? 'text-gold' : 'text-muted group-hover:text-white'}`}>
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Badge */}
      <div>
        <h4 className="font-heading font-semibold text-white mb-3 text-sm">Badge</h4>
        <div className="space-y-2">
          {[
            { value: '',    label: 'Tous les produits' },
            { value: 'new', label: 'Nouveautes' },
            { value: 'hot', label: 'Populaires' },
            { value: 'sale', label: 'Promotions' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="badge"
                checked={badge === opt.value}
                onChange={() => setParam('badge', opt.value)}
                className="accent-gold"
              />
              <span className={`text-sm transition-colors ${badge === opt.value ? 'text-gold' : 'text-muted group-hover:text-white'}`}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Prix */}
      <div>
        <h4 className="font-heading font-semibold text-white mb-3 text-sm">Prix (FCFA)</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              step={5000}
              aria-label="Prix minimum"
              placeholder="Min"
              value={searchParams.get('pmin') ?? ''}
              onChange={e => setParam('pmin', e.target.value)}
              className="input !py-1.5 !px-2 text-sm w-full"
            />
            <span className="text-muted text-xs flex-shrink-0">–</span>
            <input
              type="number"
              min={0}
              step={5000}
              aria-label="Prix maximum"
              placeholder="Max"
              value={searchParams.get('pmax') ?? ''}
              onChange={e => setParam('pmax', e.target.value)}
              className="input !py-1.5 !px-2 text-sm w-full"
            />
          </div>
          {(priceMin != null || priceMax != null) && (
            <button
              type="button"
              onClick={() => { setParam('pmin', ''); setParam('pmax', ''); }}
              className="text-xs text-gold hover:text-gold-dark transition-colors"
            >
              Effacer le filtre prix
            </button>
          )}
        </div>
      </div>

      {/* Disponibilite */}
      <div>
        <h4 className="font-heading font-semibold text-white mb-3 text-sm">Disponibilite</h4>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rentable}
            onChange={e => setParam('rentable', e.target.checked ? 'true' : '')}
            className="accent-gold"
          />
          <span className="text-sm text-muted hover:text-white transition-colors">
            Disponible a la location
          </span>
        </label>
      </div>

      {/* Reinitialiser */}
      <button
        type="button"
        onClick={() => setSearchParams(new URLSearchParams())}
        className="text-sm text-muted hover:text-gold transition-colors flex items-center gap-1"
      >
        <X size={14} />
        Tout reinitialiser
      </button>
    </div>
  );

  return (
    <div className="min-h-screen pt-20">
      {/* Header catalogue */}
      <div className="bg-bg-card border-b border-white/5 py-8">
        <div className="container-main px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading font-bold text-white mb-2">Catalogue</h1>
          <p className="text-muted">
            {isLoading ? 'Chargement…' : `${total} produit${total > 1 ? 's' : ''} trouve${total > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="container-main px-4 sm:px-6 lg:px-8 py-8">
        {/* Barre d'outils */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <SearchBar
            value={search}
            onChange={v => setParam('search', v)}
            placeholder="Rechercher un produit…"
            className="flex-1"
          />

          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Filtre mobile */}
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden btn-secondary !py-2 !px-3 gap-2"
            >
              <SlidersHorizontal size={16} />
              Filtres
            </button>

            {/* Tri */}
            <select
              value={sortBy}
              onChange={e => setParam('sort', e.target.value)}
              title="Trier les produits"
              aria-label="Trier par"
              className="input !py-2 !px-3 !w-auto text-sm"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>

            {/* Toggle layout */}
            <div className="flex border border-white/10 rounded-btn overflow-hidden">
              <button
                type="button"
                title="Affichage grille"
                onClick={() => setLayout('grid')}
                className={`p-2 transition-colors ${layout === 'grid' ? 'bg-gold text-bg-deep' : 'text-muted hover:text-white'}`}
              >
                <Grid3X3 size={18} />
              </button>
              <button
                type="button"
                title="Affichage liste"
                onClick={() => setLayout('list')}
                className={`p-2 transition-colors ${layout === 'list' ? 'bg-gold text-bg-deep' : 'text-muted hover:text-white'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar filtres desktop */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Filter size={16} className="text-gold" />
                <span className="font-heading font-semibold text-white text-sm">Filtres</span>
              </div>
              <FilterPanel />
            </div>
          </aside>

          {/* Grille produits */}
          <div className="flex-1">
            {isLoading ? (
              <div className={layout === 'grid' ? 'products-grid' : 'space-y-4'}>
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<Speaker size={64} />}
                title="Aucun produit trouve"
                description="Essayez de modifier vos filtres ou votre recherche."
                action={{ label: 'Voir tous les produits', onClick: () => setSearchParams(new URLSearchParams()) }}
              />
            ) : (
              <div
                className={layout === 'grid' ? 'products-grid' : 'space-y-4'}
              >
                {products.map(product => (
                  <ProductCard key={product.id} product={product} layout={layout} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  type="button"
                  title="Page precedente"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="p-2 rounded-btn border border-white/10 text-muted hover:text-white hover:border-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<number[]>((acc, p) => {
                    if (acc.length > 0 && p - acc[acc.length - 1] > 1) acc.push(-1);
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === -1 ? (
                      <span key={`ellipsis-${idx}`} className="text-muted px-1 select-none">…</span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => goToPage(p)}
                        className={`w-9 h-9 rounded-btn font-mono text-sm transition-colors ${
                          p === page
                            ? 'bg-gold text-bg-deep font-bold'
                            : 'border border-white/10 text-muted hover:text-white hover:border-gold/30'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  type="button"
                  title="Page suivante"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="p-2 rounded-btn border border-white/10 text-muted hover:text-white hover:border-gold/30 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer filtres mobile */}
      <AnimatePresence>
        {filtersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 h-full w-72 bg-bg-card border-r border-white/10 z-50 p-6 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading font-semibold text-white">Filtres</h3>
                <button type="button" title="Fermer les filtres" onClick={() => setFiltersOpen(false)} className="text-muted hover:text-white">
                  <X size={20} />
                </button>
              </div>
              <FilterPanel />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
