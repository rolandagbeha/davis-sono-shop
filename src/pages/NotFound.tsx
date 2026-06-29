import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music2, Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        {/* Icône animée */}
        <motion.div
          animate={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gold/10 rounded-3xl mb-8"
        >
          <Music2 size={48} className="text-gold" />
        </motion.div>

        <h1 className="text-8xl font-heading font-bold text-gold mb-4">404</h1>
        <h2 className="text-2xl font-heading font-semibold text-white mb-4">
          Page introuvable
        </h2>
        <p className="text-muted mb-10 leading-relaxed">
          Cette page n'existe pas ou a été déplacée.
          Retournez à l'accueil ou explorez notre catalogue.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/" className="btn-primary">
            <Home size={18} />
            Retour à l'accueil
          </Link>
          <Link to="/catalogue" className="btn-secondary">
            <Search size={18} />
            Voir le catalogue
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
