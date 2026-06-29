import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Calendar, Music2, Star } from 'lucide-react';

const STATS = [
  { value: 500,  suffix: '+', label: 'Clients satisfaits',    icon: Users,    color: 'text-gold' },
  { value: 10,   suffix: '+', label: 'Années d\'expérience',  icon: Calendar, color: 'text-cyan' },
  { value: 200,  suffix: '+', label: 'Événements sonorisés',  icon: Music2,   color: 'text-purple-400' },
  { value: 4.9,  suffix: '/5', label: 'Note moyenne clients', icon: Star,     color: 'text-green-400' },
];

function CountUp({ target, suffix, isVisible }: { target: number; suffix: string; isVisible: boolean }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!isVisible) return;
    const isDecimal = !Number.isInteger(target);
    const duration  = 1500;
    const steps     = 60;
    const interval  = duration / steps;
    const step      = target / steps;
    let count       = 0;

    const timer = setInterval(() => {
      count += step;
      if (count >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(isDecimal ? Math.round(count * 10) / 10 : Math.floor(count));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isVisible, target]);

  return (
    <span className="font-mono text-4xl sm:text-5xl font-bold">
      {Number.isInteger(target) ? current : current.toFixed(1)}{suffix}
    </span>
  );
}

export function StatsSection() {
  const ref       = useRef(null);
  const isInView  = useInView(ref, { once: true });

  return (
    <section ref={ref} className="section-padding bg-gradient-to-r from-gold/5 via-transparent to-cyan/5">
      <div className="container-main">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white">
            Davis Sono Shop en chiffres
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-bg-surface mb-4 ${stat.color}`}>
                <stat.icon size={28} />
              </div>
              <div className={`${stat.color} mb-2`}>
                <CountUp target={stat.value} suffix={stat.suffix} isVisible={isInView} />
              </div>
              <p className="text-muted font-medium text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
