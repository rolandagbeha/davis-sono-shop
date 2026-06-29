import { motion } from 'framer-motion';
import { MessageCircle, Phone, ArrowRight } from 'lucide-react';
import { contactSeller } from '../../lib/whatsapp';
import { useNavigate } from 'react-router-dom';

export function WhatsAppBanner() {
  const navigate = useNavigate();

  return (
    <section className="section-padding">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-whatsapp/20 to-bg-card border border-whatsapp/30 p-8 sm:p-12"
        >
          {/* Déco fond */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-whatsapp/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-whatsapp/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse-gold">
                <MessageCircle size={32} className="text-whatsapp" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white mb-2">
                  Besoin d'un devis rapide ?
                </h2>
                <p className="text-muted max-w-md">
                  Contactez-nous directement sur WhatsApp ou demandez un devis en ligne. Réponse garantie sous 2h.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 flex-shrink-0">
              <button
                onClick={() => navigate('/devis')}
                className="btn-secondary whitespace-nowrap"
              >
                Devis en ligne
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => contactSeller()}
                className="btn-whatsapp whitespace-nowrap"
              >
                <MessageCircle size={18} />
                WhatsApp : 98 42 32 32
              </button>
            </div>
          </div>

          {/* Numéros de téléphone */}
          <div className="relative mt-8 pt-6 border-t border-white/10 flex flex-wrap gap-6">
            {[
              { num: '98 42 32 32', href: 'tel:+22898423232' },
              { num: '90 54 83 82', href: 'tel:+22890548382' },
              { num: '71 66 66 68', href: 'tel:+22871666668' },
            ].map(({ num, href }) => (
              <a
                key={num}
                href={href}
                className="flex items-center gap-2 text-muted hover:text-gold transition-colors"
              >
                <Phone size={14} />
                <span className="font-mono text-sm">{num}</span>
              </a>
            ))}
            <span className="text-muted text-sm flex items-center gap-2">
              📍 Lomé, Novissi — non loin de l'UTB
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
