import HeroCarousel from "../components/HeroCarousel";
import StatsBar from "../components/StatsBar";
import PainPoints from "../components/PainPoints";
import SolutionsMap from "../components/SolutionsMap";
import ProcessSteps from "../components/ProcessSteps";
import WhyUs from "../components/WhyUs";
import Testimonials from "../components/Testimonials";
import CTABanner from "../components/CTABanner";
import FAQSection from "../components/FAQSection";
import ContactForm from "../components/ContactForm";

export default function Home() {
  return (
    <main>
      <HeroCarousel />
      <StatsBar />
      <PainPoints />
      <SolutionsMap />
      <ProcessSteps />
      <WhyUs />
      <Testimonials />
      <CTABanner />
      <FAQSection />
      <ContactForm />
    </main>
  );
}
