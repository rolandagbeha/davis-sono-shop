import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name:    'Kofi Mensah',
    role:    'Organisateur d\'événements',
    avatar:  'KM',
    rating:  5,
    text:    'Matériel de top qualité et service impeccable ! J\'ai loué des enceintes JBL pour un concert de 500 personnes. Tout s\'est passé parfaitement. Je recommande Davis Sono à 100%.',
    color:   'from-gold/20 to-transparent',
  },
  {
    name:    'Pasteur Ama Koffi',
    role:    'Église Évangélique, Lomé',
    avatar:  'AK',
    rating:  5,
    text:    'Ils ont installé tout notre système de sonorisation. Qualité professionnelle, prix honnêtes et équipe très compétente. Notre congrégation entend parfaitement maintenant.',
    color:   'from-cyan/20 to-transparent',
  },
  {
    name:    'Sénamé Agbéko',
    role:    'Musicien & Producteur',
    avatar:  'SA',
    rating:  5,
    text:    'J\'ai acheté ma console Behringer X32 ici. Prix compétitif, livraison rapide à domicile et même une formation gratuite pour débuter. Excellent service client !',
    color:   'from-purple-500/20 to-transparent',
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <Star key={i} size={14} className="text-gold fill-gold" />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="section-padding bg-bg-surface/20">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold font-heading font-medium text-sm tracking-wider uppercase mb-3 block">
            Avis clients
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Ce que disent nos clients
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Plus de 500 clients nous font confiance à Lomé et dans toute la région.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className={`card-hover p-6 bg-gradient-to-br ${t.color}`}
            >
              <Quote size={28} className="text-gold/30 mb-4" />
              <p className="text-white/80 text-sm leading-relaxed mb-6 italic">
                "{t.text}"
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gold font-heading font-bold text-sm">{t.avatar}</span>
                </div>
                <div>
                  <div className="font-heading font-semibold text-white text-sm">{t.name}</div>
                  <div className="text-muted text-xs">{t.role}</div>
                  <Stars count={t.rating} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
