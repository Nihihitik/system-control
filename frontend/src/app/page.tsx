import { Header } from '@/components/header';
import { Hero } from '@/components/marketing/hero';
import { Features } from '@/components/marketing/features';
import { Testimonials } from '@/components/marketing/testimonials';
import { PricingCTA } from '@/components/marketing/pricing-cta';
import { FAQ } from '@/components/marketing/faq';
import { Footer } from '@/components/marketing/footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <PricingCTA />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
