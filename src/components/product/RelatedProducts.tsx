import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Spinner';
import type { ProductCategory } from '../../types';

interface RelatedProductsProps {
  currentId: string;
  category:  ProductCategory;
}

export function RelatedProducts({ currentId, category }: RelatedProductsProps) {
  const { products, isLoading } = useProducts({ category, limit: 4 });
  const related = products.filter(p => p.id !== currentId).slice(0, 4);

  if (!isLoading && related.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-heading font-bold text-white mb-6">
        Produits similaires
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : related.map(p => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </section>
  );
}
