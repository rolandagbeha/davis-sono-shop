import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Speaker, SlidersHorizontal, Mic, Guitar, Lightbulb, Cable } from 'lucide-react';
import type { ProductCategory } from '../../types';

interface CategoryItem {
  category:    ProductCategory;
  label:       string;
  description: string;
  icon:        React.ElementType;
  color:       string;
}

const CATEGORIES: CategoryItem[] = [
  {
    category:    'enceintes',
    label:       'Enceintes',
    description: 'Baffles, subs, colonnes',
    icon:        Speaker,
    color:       'from-blue-500/20 to-cyan/10',
  },
  {
    category:    'mixage',
    label:       'Mixage',
    description: 'Tables, processeurs, amplis',
    icon:        SlidersHorizontal,
    color:       'from-purple-500/20 to-pink-500/10',
  },
  {
    category:    'micros',
    label:       'Micros & HF',
    description: 'Dynamiques, condensateurs, UHF',
    icon:        Mic,
    color:       'from-gold/20 to-orange-500/10',
  },
  {
    category:    'instruments',
    label:       'Instruments',
    description: 'Guitares, claviers, batteries',
    icon:        Guitar,
    color:       'from-green-500/20 to-cyan/10',
  },
  {
    category:    'eclairage',
    label:       'Éclairage',
    description: 'LED, PAR, têtes mobiles',
    icon:        Lightbulb,
    color:       'from-yellow-500/20 to-gold/10',
  },
  {
    category:    'accessoires',
    label:       'Accessoires',
    description: 'Câbles, stands, pieds',
    icon:        Cable,
    color:       'from-gray-500/20 to-slate-500/10',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 30 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <section className="section-padding">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Explorer par catégorie
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Trouvez rapidement l'équipement qu'il vous faut parmi nos 6 catégories de produits
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat.category}
              variants={itemVariants}
              onClick={() => navigate(`/catalogue?category=${cat.category}`)}
              className={`
                group card-hover p-6 flex flex-col items-center text-center cursor-pointer
                bg-gradient-to-br ${cat.color} hover:border-gold/30
              `}
            >
              <div className="w-14 h-14 bg-bg-surface rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold/10 transition-colors">
                <cat.icon size={28} className="text-muted group-hover:text-gold transition-colors" />
              </div>
              <h3 className="font-heading font-semibold text-white text-sm mb-1">{cat.label}</h3>
              <p className="text-muted text-xs">{cat.description}</p>
            </motion.button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
