import { Hero }               from '../components/home/Hero';
import { PromoBanner }        from '../components/home/PromoBanner';
import { CategoryGrid }       from '../components/home/CategoryGrid';
import { FeaturedProducts }   from '../components/home/FeaturedProducts';
import { ServicesSection }    from '../components/home/ServicesSection';
import { WhatsAppBanner }     from '../components/home/WhatsAppBanner';
import { StatsSection }       from '../components/home/StatsSection';
import { TestimonialsSection } from '../components/home/TestimonialsSection';

export default function Home() {
  return (
    <main>
      <Hero />
      <PromoBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <ServicesSection />
      <WhatsAppBanner />
      <StatsSection />
      <TestimonialsSection />
    </main>
  );
}
