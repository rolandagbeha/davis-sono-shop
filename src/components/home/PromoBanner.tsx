import { Tag } from 'lucide-react';

const PROMO_ITEMS = [
  '🎵 Livraison gratuite à Lomé dès 50 000 FCFA',
  '🎙️ Micro Shure SM58 à 75 000 FCFA',
  '🎹 Formation musique dès 15 000 FCFA / mois',
  '📦 Location d\'enceintes pour vos événements',
  '🔧 Maintenance express sous 24h',
  '🎸 Guitares Yamaha dès 89 000 FCFA',
  '🎛️ Tables de mixage professionnelles en stock',
  '💡 Pack lumières DJ à partir de 125 000 FCFA',
];

export function PromoBanner() {
  // On duplique pour créer un défilement infini sans saut
  const items = [...PROMO_ITEMS, ...PROMO_ITEMS];

  return (
    <div className="bg-gold/10 border-y border-gold/20 py-3 overflow-hidden marquee-mask">
      <div className="flex animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-8 text-sm font-heading font-medium text-gold"
          >
            <Tag size={12} className="flex-shrink-0" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
