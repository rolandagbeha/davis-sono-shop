import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, Eye, MessageCircle, PackageCheck } from 'lucide-react';
import type { Product } from '../../types';
import { formatFCFA } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';
import { Badge } from '../ui/Badge';
import { quickOrderViaWhatsApp } from '../../lib/whatsapp';

interface ProductCardProps {
  product:  Product;
  layout?:  'grid' | 'list';
}

export function ProductCard({ product, layout = 'grid' }: ProductCardProps) {
  const { addItem } = useCart();
  const [imgError, setImgError] = useState(false);

  const thumbUrl = product.images[0] || '';
  const isOOS    = product.stock === 0;
  const isLow    = product.stock > 0 && product.stock <= product.stock_alert;

  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="card-hover flex gap-4 p-4 w-full"
      >
        {/* Image */}
        <Link to={`/produit/${product.slug}`} className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-bg-surface rounded-card overflow-hidden">
            {thumbUrl && !imgError ? (
              <img
                src={thumbUrl}
                alt={product.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted opacity-40">
                <ShoppingCart size={32} />
              </div>
            )}
          </div>
        </Link>

        {/* Infos */}
        <div className="flex-1 flex flex-col">
          <div className="flex items-start gap-2 mb-1">
            <Badge badge={product.badge} />
            {isLow && <span className="badge bg-orange-500/20 text-orange-400">Stock limité</span>}
          </div>
          <Link
            to={`/produit/${product.slug}`}
            className="font-heading font-semibold text-white hover:text-gold transition-colors line-clamp-1 mb-1"
          >
            {product.name}
          </Link>
          <p className="text-muted text-sm line-clamp-2 flex-1">{product.short_description}</p>
          <div className="flex items-center justify-between mt-3">
            <div>
              <div className="price text-xl">{formatFCFA(product.price)}</div>
              {product.is_rentable && product.rental_price_day && (
                <div className="text-xs text-muted mt-0.5">
                  Location : {formatFCFA(product.rental_price_day)}/jour
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => addItem(product)}
                disabled={isOOS}
                className="btn-primary !py-2 !px-4 text-sm"
              >
                <ShoppingCart size={15} />
                {isOOS ? 'Rupture' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-hover overflow-hidden group flex flex-col"
    >
      {/* Image */}
      <Link to={`/produit/${product.slug}`} className="relative block">
        <div className="aspect-square bg-bg-surface overflow-hidden">
          {thumbUrl && !imgError ? (
            <img
              src={thumbUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-muted opacity-30 gap-2">
              <ShoppingCart size={48} />
              <span className="text-xs">Image indisponible</span>
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <Badge badge={product.badge} />
          {product.is_rentable && (
            <span className="badge bg-purple-500/80 text-white">Location</span>
          )}
        </div>

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={() => quickOrderViaWhatsApp(product.name, product.price)}
            className="w-10 h-10 bg-whatsapp rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            title="Commander via WhatsApp"
          >
            <MessageCircle size={18} className="text-white" />
          </button>
          <Link
            to={`/produit/${product.slug}`}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-transform"
            title="Voir le produit"
          >
            <Eye size={18} className="text-white" />
          </Link>
        </div>
      </Link>

      {/* Infos produit */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-xs capitalize">{product.category}</span>
          {isLow && (
            <span className="text-xs text-orange-400 font-medium">
              {product.stock} restant{product.stock > 1 ? 's' : ''}
            </span>
          )}
          {isOOS && (
            <span className="text-xs text-red-400 font-medium">Rupture</span>
          )}
          {!isLow && !isOOS && (
            <div className="flex items-center gap-1 text-green-400">
              <PackageCheck size={12} />
              <span className="text-xs">En stock</span>
            </div>
          )}
        </div>

        <Link
          to={`/produit/${product.slug}`}
          className="font-heading font-semibold text-white hover:text-gold transition-colors line-clamp-2 mb-2 flex-1 text-sm leading-tight"
        >
          {product.name}
        </Link>

        <div className="mt-auto">
          <div className="price text-lg mb-1">{formatFCFA(product.price)}</div>
          {product.is_rentable && product.rental_price_day && (
            <div className="text-xs text-muted mb-3">
              Location : {formatFCFA(product.rental_price_day)}/jour
            </div>
          )}
          <button
            onClick={() => addItem(product)}
            disabled={isOOS}
            className="btn-primary w-full justify-center text-sm !py-2"
          >
            <ShoppingCart size={15} />
            {isOOS ? 'Rupture de stock' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
