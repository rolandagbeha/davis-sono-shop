import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MessageCircle, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { contactSeller } from '../../lib/whatsapp';

const CATEGORY_SUGGESTIONS = [
  'Enceintes JBL', 'Table de mixage', 'Microphones', 'Guitares', 'Éclairage DJ',
];

// Equalizer SVG animé
function EqualizerSVG() {
  const bars = [60, 80, 45, 90, 55, 75, 40, 85, 65, 50];
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
      {bars.map((h, i) => (
        <motion.rect
          key={i}
          x={i * 20 + 5}
          y={100 - h}
          width={12}
          height={h}
          rx={4}
          fill={i % 3 === 0 ? '#F5C518' : i % 3 === 1 ? '#00D4FF' : '#ffffff'}
          animate={{ y: [100 - h, 100 - h * 0.3, 100 - h], height: [h, h * 0.3, h] }}
          transition={{ duration: 1.5 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </svg>
  );
}

export function Hero() {
  const [search,   setSearch]   = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalogue?search=${encodeURIComponent(search)}`);
    else navigate('/catalogue');
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-mesh">
      {/* Fond gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-deep via-bg-deep to-bg-surface" />

      {/* Equalizer en fond */}
      <div className="absolute bottom-0 left-0 right-0 h-40">
        <EqualizerSVG />
      </div>

      {/* Glow décoratif */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-main px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-full px-4 py-2 mb-8"
          >
            <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-gold font-heading text-sm font-medium">
              N°1 de la sono à Lomé — Togo 🇹🇬
            </span>
          </motion.div>

          {/* Titre principal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold leading-tight mb-6"
          >
            Équipez votre{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-dark">
              passion
            </span>
            <br />
            musicale
          </motion.h1>

          {/* Sous-titre */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg sm:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Vente, location et installation d'équipements audio professionnels.
            Formations en musique et ingénierie du son — Lomé, Novissi.
          </motion.p>

          {/* Barre de recherche */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSearch}
            className="flex gap-0 max-w-2xl mx-auto mb-6 shadow-gold rounded-btn overflow-hidden border border-gold/20"
          >
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher : enceinte, micro, mixage…"
              className="flex-1 bg-bg-card px-6 py-4 text-white placeholder-muted outline-none font-body"
            />
            <button
              type="submit"
              className="bg-gold hover:bg-gold-dark px-6 py-4 text-bg-deep font-heading font-semibold flex items-center gap-2 transition-colors"
            >
              <Search size={20} />
              <span className="hidden sm:inline">Chercher</span>
            </button>
          </motion.form>

          {/* Suggestions de catégories */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-2 mb-12"
          >
            <span className="text-muted text-sm">Populaires :</span>
            {CATEGORY_SUGGESTIONS.map(cat => (
              <button
                key={cat}
                onClick={() => navigate(`/catalogue?search=${encodeURIComponent(cat)}`)}
                className="text-sm text-muted hover:text-gold border border-white/10 hover:border-gold/30 px-3 py-1 rounded-full transition-colors"
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* CTA Boutons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => navigate('/catalogue')}
              className="btn-primary text-base px-8 py-4 shadow-gold"
            >
              Explorer le catalogue
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => contactSeller()}
              className="btn-whatsapp text-base px-8 py-4"
            >
              <MessageCircle size={20} />
              WhatsApp direct
            </button>
          </motion.div>

          {/* Stats rapides */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/10"
          >
            {[
              { value: '500+', label: 'Clients satisfaits' },
              { value: '10+',  label: 'Années d\'expérience' },
              { value: '200+', label: 'Événements sonorisés' },
              { value: '100+', label: 'Produits disponibles' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-heading font-bold text-gold">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
