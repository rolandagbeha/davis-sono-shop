import { useEffect, useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { aiRecommend } from '../../lib/ai';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from './ProductCard';

interface AIRecommendationsProps {
  context:     string;
  excludeSlug?: string;
  title?:      string;
}

export function AIRecommendations({ context, excludeSlug, title }: AIRecommendationsProps) {
  const { products, isLoading: productsLoading } = useProducts({ limit: 80 });
  const [slugs, setSlugs] = useState<{ slug: string; reason: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    aiRecommend(context, excludeSlug)
      .then(recs => { if (!cancelled) setSlugs(recs); })
      .catch(() => { if (!cancelled) setFailed(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [context, excludeSlug]);

  const matched = slugs
    .map(r => ({ reason: r.reason, product: products.find(p => p.slug === r.slug) }))
    .filter((m): m is { reason: string; product: NonNullable<typeof m.product> } => !!m.product);

  const isLoading = loading || productsLoading;

  if (!isLoading && (failed || matched.length === 0)) return null;

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={18} className="text-gold" />
        <h3 className="font-heading font-bold text-white text-xl">
          {title ?? "Recommandé par notre IA"}
        </h3>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-muted text-sm">
          <Loader2 size={16} className="animate-spin" />
          Analyse du catalogue en cours…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {matched.map(({ product, reason }) => (
            <div key={product.id} className="flex flex-col gap-2">
              <ProductCard product={product} />
              <p className="text-muted text-xs italic px-1 line-clamp-2">{reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
