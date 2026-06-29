import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { formatFCFA } from '../../utils/formatPrice';
import { useCart } from '../../context/CartContext';

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCart();
  const { product, quantity }          = item;

  return (
    <div className="flex gap-4 py-4 border-b border-white/10 last:border-0">
      {/* Image */}
      <div className="w-16 h-16 bg-bg-surface rounded-lg overflow-hidden flex-shrink-0">
        {product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-bg-surface" />
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="font-heading font-medium text-white text-sm line-clamp-2 mb-1">
          {product.name}
        </p>
        <p className="price text-base">{formatFCFA(product.price)}</p>

        <div className="flex items-center justify-between mt-2">
          {/* Sélecteur quantité */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="w-7 h-7 bg-bg-surface rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-gold/20 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="font-mono text-sm text-white w-6 text-center">{quantity}</span>
            <button
              onClick={() => updateQuantity(product.id, quantity + 1)}
              disabled={quantity >= product.stock}
              className="w-7 h-7 bg-bg-surface rounded-lg flex items-center justify-center text-muted hover:text-white hover:bg-gold/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Supprimer */}
          <button
            onClick={() => removeItem(product.id)}
            className="text-muted hover:text-red-400 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Sous-total */}
      <div className="text-right flex-shrink-0">
        <p className="price text-sm">{formatFCFA(product.price * quantity)}</p>
      </div>
    </div>
  );
}
