import { motion } from 'framer-motion';
import { ShoppingBag, Truck, Wrench, Music, GraduationCap, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SERVICES = [
  {
    icon:        ShoppingBag,
    title:       'Vente d\'équipements',
    description: 'Large gamme de matériel audio et musical de marques professionnelles : JBL, Shure, Yamaha, Behringer, Sennheiser…',
    color:       'text-gold',
    bg:          'bg-gold/10',
  },
  {
    icon:        Truck,
    title:       'Location de matériel',
    description: 'Louez des enceintes, micros, tables de mixage et éclairages pour vos événements. Livraison possible à Lomé.',
    color:       'text-cyan',
    bg:          'bg-cyan/10',
  },
  {
    icon:        Wrench,
    title:       'Installation',
    description: 'Installation complète et câblage de systèmes de sonorisation pour églises, salles, restaurants et événements.',
    color:       'text-purple-400',
    bg:          'bg-purple-500/10',
  },
  {
    icon:        Headphones,
    title:       'Maintenance',
    description: 'Entretien préventif et réparation de vos équipements audio et musicaux. Service rapide et fiable.',
    color:       'text-green-400',
    bg:          'bg-green-500/10',
  },
  {
    icon:        Music,
    title:       'Formation musicale',
    description: 'Cours de guitare, clavier, batterie et chant pour tous niveaux. Apprenez avec nos formateurs qualifiés.',
    color:       'text-orange-400',
    bg:          'bg-orange-500/10',
  },
  {
    icon:        GraduationCap,
    title:       'Ingénierie du son',
    description: 'Formation en prise de son, mixage live et studio. Devenez un professionnel de l\'audio.',
    color:       'text-pink-400',
    bg:          'bg-pink-500/10',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 30 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function ServicesSection() {
  const navigate = useNavigate();

  return (
    <section className="section-padding bg-bg-surface/30">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-gold font-heading font-medium text-sm tracking-wider uppercase mb-3 block">
            Nos prestations
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white mb-4">
            Tout pour votre projet sonore
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            De la vente à l'installation, de la formation à la maintenance — nous vous accompagnons à chaque étape.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {SERVICES.map(service => (
            <motion.div
              key={service.title}
              variants={itemVariants}
              className="card-hover p-6 group"
            >
              <div className={`w-12 h-12 ${service.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <service.icon size={24} className={service.color} />
              </div>
              <h3 className="font-heading font-semibold text-white mb-3">{service.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <button onClick={() => navigate('/services')} className="btn-secondary">
            Voir tous nos services
          </button>
        </motion.div>
      </div>
    </section>
  );
}
