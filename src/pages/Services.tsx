import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Wrench, Music, GraduationCap, Headphones, Phone, MessageCircle } from 'lucide-react';

const SERVICES_DETAIL = [
  {
    id:          'vente',
    icon:        ShoppingBag,
    color:       'text-gold',
    bg:          'bg-gold/10',
    border:      'border-gold/20',
    title:       'Vente d\'équipements',
    description: 'Large gamme de matériel audio et musical professionnel.',
    details: [
      'Enceintes et subwoofers (JBL, Bose, RCF)',
      'Tables de mixage (Yamaha, Behringer, Allen & Heath)',
      'Microphones (Shure, Sennheiser, AKG)',
      'Instruments (Yamaha, Roland, Fender)',
      'Éclairage DJ et scénique',
      'Câblerie et accessoires',
    ],
  },
  {
    id:          'location',
    icon:        Truck,
    color:       'text-cyan',
    bg:          'bg-cyan/10',
    border:      'border-cyan/20',
    title:       'Location de matériel',
    description: 'Louez du matériel pro pour vos événements et concerts.',
    details: [
      'Enceintes professionnelles par jour/semaine',
      'Systèmes de micros HF',
      'Tables de mixage',
      'Kits d\'éclairage DJ',
      'Livraison et reprise à domicile (Lomé)',
      'Assistance technique optionnelle',
    ],
  },
  {
    id:          'install',
    icon:        Wrench,
    color:       'text-purple-400',
    bg:          'bg-purple-500/10',
    border:      'border-purple-500/20',
    title:       'Installation & Câblage',
    description: 'Installation complète de systèmes audio dans vos locaux.',
    details: [
      'Étude acoustique et conception du système',
      'Installation d\'enceintes murales et plafonnières',
      'Câblage et rack de distribution',
      'Réglage et optimisation du son',
      'Formation de vos équipes techniques',
      'Maintenance préventive incluse (1 an)',
    ],
  },
  {
    id:          'maintenance',
    icon:        Headphones,
    color:       'text-green-400',
    bg:          'bg-green-500/10',
    border:      'border-green-500/20',
    title:       'Maintenance',
    description: 'Entretien et réparation de vos équipements audio.',
    details: [
      'Diagnostic complet de votre matériel',
      'Réparation rapide en atelier',
      'Remplacement de pièces d\'origine',
      'Nettoyage et révision périodique',
      'Contrats de maintenance sur mesure',
      'Intervention d\'urgence sous 24h',
    ],
  },
  {
    id:          'formation',
    icon:        Music,
    color:       'text-orange-400',
    bg:          'bg-orange-500/10',
    border:      'border-orange-500/20',
    title:       'Formation musicale',
    description: 'Apprenez à jouer d\'un instrument avec nos formateurs.',
    details: [
      'Guitare acoustique & électrique',
      'Piano / Clavier',
      'Batterie & percussions',
      'Chant et techniques vocales',
      'Cours individuels ou en groupe',
      'Tous niveaux — dès 8 ans',
    ],
  },
  {
    id:          'ingenierie',
    icon:        GraduationCap,
    color:       'text-pink-400',
    bg:          'bg-pink-500/10',
    border:      'border-pink-500/20',
    title:       'Ingénierie du son',
    description: 'Formations en prise de son, mixage live et studio.',
    details: [
      'Initiation à la prise de son',
      'Mixage live sur console numérique',
      'Traitement et effets audio',
      'Enregistrement en studio',
      'Mastering de base',
      'Certification à l\'issue de la formation',
    ],
  },
];

export default function Services() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <span className="text-gold font-heading font-medium text-sm tracking-wider uppercase mb-3 block">
            Nos prestations
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-white mb-4">
            Services Davis Sono Shop
          </h1>
          <p className="text-muted max-w-2xl mx-auto text-lg">
            De la vente à la formation, nous vous accompagnons à chaque étape de votre projet sonore.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {SERVICES_DETAIL.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              id={service.id}
              className={`card-hover p-6 border ${service.border}`}
            >
              <div className={`w-14 h-14 ${service.bg} rounded-xl flex items-center justify-center mb-5`}>
                <service.icon size={28} className={service.color} />
              </div>
              <h2 className="font-heading font-bold text-white text-xl mb-2">{service.title}</h2>
              <p className="text-muted text-sm mb-5">{service.description}</p>
              <ul className="space-y-2">
                {service.details.map(d => (
                  <li key={d} className="flex items-start gap-2 text-sm">
                    <span className={`${service.color} mt-0.5`}>✓</span>
                    <span className="text-muted">{d}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate(`/devis?service=${service.id}`)}
                className="btn-secondary w-full justify-center mt-6 text-sm"
              >
                Demander un devis
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA contact */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="card p-8 text-center max-w-2xl mx-auto"
        >
          <h3 className="text-2xl font-heading font-bold text-white mb-3">
            Besoin d'un service sur mesure ?
          </h3>
          <p className="text-muted mb-6">
            Contactez-nous directement — nous adaptons nos services à votre budget et vos besoins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+22898423232" className="btn-secondary">
              <Phone size={18} />
              98 42 32 32
            </a>
            <a
              href="https://wa.me/22898423232"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp"
            >
              <MessageCircle size={18} />
              WhatsApp
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
