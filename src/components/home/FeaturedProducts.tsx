import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/useProducts';
import { ProductCard } from '../product/ProductCard';
import { ProductCardSkeleton } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { ChevronRight, Speaker } from 'lucide-react';

export function FeaturedProducts() {
  const navigate  = useNavigate();
  const { products, isLoading } = useProducts({ limit: 8, sortBy: 'popular' });

  return (
    <section className="section-padding">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-10"
        >
          <div>
            <span className="text-gold font-heading font-medium text-sm tracking-wider uppercase mb-3 block">
              Bestsellers
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
              Produits populaires
            </h2>
          </div>
          <button
            onClick={() => navigate('/catalogue')}
            className="hidden sm:flex items-center gap-2 text-gold hover:text-gold-dark font-heading font-medium transition-colors"
          >
            Voir tout
            <ChevronRight size={18} />
          </button>
        </motion.div>

        {isLoading ? (
          <div className="products-grid">
            {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Speaker size={64} />}
            title="Aucun produit disponible"
            description="Les produits seront disponibles prochainement."
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="products-grid"
          >
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        <div className="text-center mt-10 sm:hidden">
          <button onClick={() => navigate('/catalogue')} className="btn-secondary">
            Voir tout le catalogue
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
