import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="relative overflow-hidden bg-primary py-20 sm:py-24">
      {/* Decorative circles */}
      <svg
        className="absolute top-0 left-0 w-64 h-64 -translate-x-1/2 -translate-y-1/2 opacity-10"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="100" fill="white" />
      </svg>
      <svg
        className="absolute bottom-0 right-0 w-96 h-96 translate-x-1/3 translate-y-1/3 opacity-10"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="100" fill="white" />
      </svg>
      <svg
        className="absolute top-1/2 right-1/4 w-32 h-32 opacity-5"
        viewBox="0 0 200 200"
      >
        <circle cx="100" cy="100" r="100" fill="white" />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 font-display leading-tight">
              ¿Tu propiedad tiene una historia sin resolver?
            </h2>
            <p className="text-lg text-white/80 font-body max-w-lg">
              Nosotros la terminamos. Regularización, escrituración y asesoría
              en Jalisco.
            </p>
          </div>

          {/* Right buttons */}
          <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
            <Link
              href="/contacto"
              className="bg-white text-primary px-8 py-4 rounded-full font-semibold hover:bg-gray-50 transition-all duration-200 inline-flex items-center justify-center gap-2 text-lg shadow-lg shadow-black/10 font-display hover:shadow-xl"
            >
              Agenda tu consulta gratis
              <ArrowRight size={20} />
            </Link>
            <a
              href="https://wa.me/5213313013253?text=Hola%2C%20quiero%20una%20consulta%20gratuita"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200 inline-flex items-center justify-center gap-2 text-lg font-display"
            >
              <MessageCircle size={20} />
              Escríbenos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
