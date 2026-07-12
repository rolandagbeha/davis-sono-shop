import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShoppingCart, MessageCircle, FileText, MapPin,
  Package, ChevronRight, Minus, Plus, Star,
} from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductSpecs } from '../components/product/ProductSpecs';
import { RelatedProducts } from '../components/product/RelatedProducts';
import { AIRecommendations } from '../components/product/AIRecommendations';
import { Badge } from '../components/ui/Badge';
import { Spinner } from '../components/ui/Spinner';
import { useCart } from '../context/CartContext';
import { formatFCFA, formatRentalPrice } from '../utils/formatPrice';
import { quickOrderViaWhatsApp, contactSeller } from '../lib/whatsapp';

type TabKey = 'description' | 'specs' | 'livraison';

export default function ProductDetail() {
  const { slug }          = useParams<{ slug: string }>();
  const { product, isLoading, error } = useProduct(slug ?? '');
  const { addItem }       = useCart();
  const navigate          = useNavigate();
  const [qty,    setQty]  = useState(1);
  const [tab,    setTab]  = useState<TabKey>('description');

  useDocumentMeta({
    title: product?.name ?? 'Produit',
    description: product?.short_description || product?.description || undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-heading font-bold text-white">Produit introuvable</h1>
        <Link to="/catalogue" className="btn-primary">Retour au catalogue</Link>
      </div>
    );
  }

  const isOOS  = product.stock === 0;
  const isLow  = product.stock > 0 && product.stock <= product.stock_alert;

  const handleAddToCart = () => {
    addItem(product, qty);
  };

  const handleBuyNow = () => {
    addItem(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="container-main px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-8">
          <Link to="/"         className="hover:text-gold transition-colors">Accueil</Link>
          <ChevronRight size={14} />
          <Link to="/catalogue" className="hover:text-gold transition-colors">Catalogue</Link>
          <ChevronRight size={14} />
          <Link
            to={`/catalogue?category=${product.category}`}
            className="hover:text-gold transition-colors capitalize"
          >
            {product.category}
          </Link>
          <ChevronRight size={14} />
          <span className="text-white truncate max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Galerie */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <ProductGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Infos produit */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Badge + categorie */}
            <div className="flex items-center gap-3">
              <span className="text-muted text-sm capitalize">{product.category}</span>
              <Badge badge={product.badge} />
            </div>

            {/* Nom */}
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-white leading-tight">
              {product.name}
            </h1>

            {/* Prix */}
            <div className="space-y-2">
              <div className="price text-4xl">{formatFCFA(product.price)}</div>
              {product.is_rentable && product.rental_price_day && (
                <div className="flex items-center gap-2">
                  <span className="badge bg-purple-500/20 text-purple-400">Location disponible</span>
                  <span className="text-muted text-sm">{formatRentalPrice(product.rental_price_day)}</span>
                </div>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <Package size={16} className={isOOS ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-green-400'} />
              <span className={`text-sm font-medium ${isOOS ? 'text-red-400' : isLow ? 'text-orange-400' : 'text-green-400'}`}>
                {isOOS
                  ? 'Rupture de stock'
                  : isLow
                    ? `Stock limite — ${product.stock} restant${product.stock > 1 ? 's' : ''}`
                    : 'En stock'}
              </span>
            </div>

            {/* Description courte */}
            <p className="text-muted leading-relaxed">{product.short_description}</p>

            {/* Selecteur quantite */}
            {!isOOS && (
              <div className="flex items-center gap-4">
                <span className="text-muted text-sm">Quantite :</span>
                <div className="flex items-center gap-3 bg-bg-surface rounded-btn px-3 py-2">
                  <button
                    onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="text-muted hover:text-white transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="font-mono text-white w-6 text-center">{qty}</span>
                  <button
                    onClick={() => setQty(q => Math.min(product.stock, q + 1))}
                    className="text-muted hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={isOOS}
                className="btn-secondary w-full justify-center"
              >
                <ShoppingCart size={18} />
                Ajouter au panier
              </button>
              <button
                onClick={handleBuyNow}
                disabled={isOOS}
                className="btn-primary w-full justify-center"
              >
                Acheter maintenant
              </button>
              <button
                onClick={() => navigate(`/devis?product=${product.id}&name=${encodeURIComponent(product.name)}`)}
                className="btn-secondary w-full justify-center col-span-full sm:col-span-1"
              >
                <FileText size={18} />
                Demander un devis
              </button>
              <button
                onClick={() => quickOrderViaWhatsApp(product.name, product.price)}
                className="btn-whatsapp w-full justify-center col-span-full sm:col-span-1"
              >
                <MessageCircle size={18} />
                Commander via WhatsApp
              </button>
            </div>

            {/* Bloc vendeur style Alibaba */}
            <div className="card p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold/20 rounded-lg flex items-center justify-center">
                  <Star size={18} className="text-gold" />
                </div>
                <div>
                  <div className="font-heading font-semibold text-white text-sm">Davis Sono Shop</div>
                  <div className="flex items-center gap-1 text-muted text-xs">
                    <Star size={10} className="fill-gold text-gold" />
                    <Star size={10} className="fill-gold text-gold" />
                    <Star size={10} className="fill-gold text-gold" />
                    <Star size={10} className="fill-gold text-gold" />
                    <Star size={10} className="fill-gold text-gold" />
                    <span>5.0 — Vendeur verifie</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted text-sm">
                <MapPin size={14} />
                <span>Lome, Novissi — non loin de l'UTB, Togo</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => contactSeller()}
                  className="btn-secondary !py-1.5 !px-4 text-sm flex-1 justify-center"
                >
                  <MessageCircle size={14} />
                  Contacter
                </button>
                <Link
                  to="/catalogue"
                  className="btn-secondary !py-1.5 !px-4 text-sm flex-1 justify-center"
                >
                  <Package size={14} />
                  Tous les produits
                </Link>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Onglets description / specs / livraison */}
        <div className="mb-16">
          <div className="flex border-b border-white/10 gap-1 mb-8">
            {([
              { key: 'description', label: 'Description' },
              { key: 'specs',       label: 'Specifications' },
              { key: 'livraison',   label: 'Livraison & Retours' },
            ] as { key: TabKey; label: string }[]).map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-5 py-3 font-heading font-medium text-sm border-b-2 -mb-px transition-colors ${
                  tab === t.key
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="prose prose-invert max-w-none text-muted leading-relaxed whitespace-pre-line"
            >
              {product.description || 'Description non disponible.'}
            </motion.div>
          )}

          {tab === 'specs' && (
            <motion.div key="specs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ProductSpecs specs={product.specs} />
            </motion.div>
          )}

          {tab === 'livraison' && (
            <motion.div
              key="livraison"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 text-muted"
            >
              <div className="card p-4">
                <h4 className="font-heading font-semibold text-white mb-2">Livraison</h4>
                <ul className="space-y-2 text-sm">
                  <li>Retrait en boutique : Lome, Novissi (non loin de l'UTB) — Gratuit</li>
                  <li>Livraison Lome centre : 2 000 FCFA</li>
                  <li>Livraison zones peripheriques : a confirmer</li>
                  <li>Commandez et nous convenons de la livraison ensemble</li>
                </ul>
              </div>
              <div className="card p-4">
                <h4 className="font-heading font-semibold text-white mb-2">Retours & Garantie</h4>
                <ul className="space-y-2 text-sm">
                  <li>Retour sous 7 jours si produit defectueux</li>
                  <li>Service de maintenance disponible</li>
                  <li>Support client : 98 42 32 32 / 90 54 83 82</li>
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Produits similaires */}
        <RelatedProducts currentId={product.id} category={product.category} />

        {/* Recommandations IA */}
        <AIRecommendations
          context={`Le client consulte actuellement : ${product.name} (categorie ${product.category}, ${product.price} FCFA). Recommande des produits complementaires ou similaires susceptibles de l'interesser.`}
          excludeSlug={product.slug}
        />
      </div>
    </div>
  );
}
