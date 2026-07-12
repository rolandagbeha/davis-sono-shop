import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Wrench, Music, GraduationCap, Headphones, Phone, MessageCircle } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const SERVICES_DETAIL = [
  {
    id:          'vente',
    icon:        ShoppingBag,
    color:       'text-gold',
    bg:          'bg-gold/10',
    border:      'border-gold/20',
    title:       'Vente d\'equipements',
    description: 'Large gamme de materiel audio et musical professionnel.',
    details: [
      'Enceintes et subwoofers (JBL, Bose, RCF)',
      'Tables de mixage (Yamaha, Behringer, Allen & Heath)',
      'Microphones (Shure, Sennheiser, AKG)',
      'Instruments (Yamaha, Roland, Fender)',
      'Eclairage DJ et scenique',
      'Cablerie et accessoires',
    ],
  },
  {
    id:          'location',
    icon:        Truck,
    color:       'text-cyan',
    bg:          'bg-cyan/10',
    border:      'border-cyan/20',
    title:       'Location de materiel',
    description: 'Louez du materiel pro pour vos evenements et concerts.',
    details: [
      'Enceintes professionnelles par jour/semaine',
      'Systemes de micros HF',
      'Tables de mixage',
      'Kits d\'eclairage DJ',
      'Livraison et reprise a domicile (Lome)',
      'Assistance technique optionnelle',
    ],
  },
  {
    id:          'install',
    icon:        Wrench,
    color:       'text-purple-400',
    bg:          'bg-purple-500/10',
    border:      'border-purple-500/20',
    title:       'Installation & Cablage',
    description: 'Installation complete de systemes audio dans vos locaux.',
    details: [
      'Etude acoustique et conception du systeme',
      'Installation d\'enceintes murales et plafonnieres',
      'Cablage et rack de distribution',
      'Reglage et optimisation du son',
      'Formation de vos equipes techniques',
      'Maintenance preventive incluse (1 an)',
    ],
  },
  {
    id:          'maintenance',
    icon:        Headphones,
    color:       'text-green-400',
    bg:          'bg-green-500/10',
    border:      'border-green-500/20',
    title:       'Maintenance',
    description: 'Entretien et reparation de vos equipements audio.',
    details: [
      'Diagnostic complet de votre materiel',
      'Reparation rapide en atelier',
      'Remplacement de pieces d\'origine',
      'Nettoyage et revision periodique',
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
    description: 'Apprenez a jouer d\'un instrument avec nos formateurs.',
    details: [
      'Guitare acoustique & electrique',
      'Piano / Clavier',
      'Batterie & percussions',
      'Chant et techniques vocales',
      'Cours individuels ou en groupe',
      'Tous niveaux — des 8 ans',
    ],
  },
  {
    id:          'ingenierie',
    icon:        GraduationCap,
    color:       'text-pink-400',
    bg:          'bg-pink-500/10',
    border:      'border-pink-500/20',
    title:       'Ingenierie du son',
    description: 'Formations en prise de son, mixage live et studio.',
    details: [
      'Initiation a la prise de son',
      'Mixage live sur console numerique',
      'Traitement et effets audio',
      'Enregistrement en studio',
      'Mastering de base',
      'Certification a l\'issue de la formation',
    ],
  },
];

export default function Services() {
  const navigate = useNavigate();

  useDocumentMeta({
    title: 'Nos Services',
    description: 'Vente, location, installation et maintenance de materiel audio professionnel a Lome, Togo.',
  });

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
            De la vente a la formation, nous vous accompagnons a chaque etape de votre projet sonore.
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
            Contactez-nous directement — nous adaptons nos services a votre budget et vos besoins.
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
