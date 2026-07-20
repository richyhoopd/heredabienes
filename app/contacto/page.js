import { MapPin } from "lucide-react";
import ContactForm from "@/components/ContactForm";
import FAQSection from "@/components/FAQSection";

export const metadata = {
  title: "Contacto | HEREDABIENES. Grupo Inmobiliario",
  description:
    "Agenda tu consulta gratuita. WhatsApp +52 1 33 1301 3253 · heredabienes@outlook.com · Guadalajara, Jalisco.",
  alternates: { canonical: "/contacto" },
};

export default function Contacto() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[35vh] min-h-[280px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=80"
          alt="Contacto HeredaBienes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Hablemos de tu caso
          </h1>
          <p className="text-lg text-gray-300 font-body max-w-2xl mx-auto">
            Tu primera consulta es gratuita. Cuéntanos tu situación y te orientamos.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <ContactForm />

      {/* Map placeholder */}
      <section className="py-16 bg-gray-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden">
            <div className="h-[300px] bg-gray-100 flex flex-col items-center justify-center relative">
              {/* Map background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `radial-gradient(circle, #0098FF 1px, transparent 1px)`,
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              <div className="relative z-10 text-center">
                <div className="bg-primary/10 p-4 rounded-2xl w-fit mx-auto mb-4">
                  <MapPin size={40} className="text-primary" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 font-display mb-2">
                  Guadalajara, Jalisco
                </h3>
                <p className="text-gray-500 font-body text-sm">
                  Zona Metropolitana de Guadalajara
                </p>
                <a
                  href="https://maps.google.com/?q=Guadalajara,+Jalisco,+Mexico"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-primary font-semibold text-sm hover:underline font-display"
                >
                  Ver en Google Maps
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection limit={3} />
    </main>
  );
}
