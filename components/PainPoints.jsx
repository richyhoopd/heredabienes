import Link from "next/link";
import { ArrowRight } from "lucide-react";

const painPoints = [
  {
    image:
      "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    question: "¿Tienes una casa intestada?",
    description:
      "El dueño falleció y nadie puede vender, rentar ni hipotecar la propiedad hasta que se designe a los herederos legalmente.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    question: "¿Tienes una casa pero no las escrituras?",
    description:
      "Llevas años viviendo en tu propiedad, pagas servicios y predial, pero no tienes documentos legales que te acrediten como dueño.",
  },
];

export default function PainPoints() {
  return (
    <section className="py-20 sm:py-24 bg-white" id="te-identificas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            ¿Te identificas?
          </span>
          <h2 className="section-title">
            Sabemos Por Lo Que{" "}
            <span className="text-primary">Estás Pasando</span>
          </h2>
          <div className="section-divider mt-4" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {painPoints.map((point, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-3xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/20"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={point.image}
                  alt={point.question}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 font-display">
                  {point.question}
                </h3>
                <p className="text-gray-500 font-body leading-relaxed mb-6">
                  {point.description}
                </p>

                {/* CTA */}
                <Link
                  href="/servicios"
                  className="inline-flex items-center gap-2 text-primary font-semibold text-sm hover:gap-3 transition-all duration-200 font-display"
                >
                  Conoce más
                  <ArrowRight size={16} />
                </Link>
              </div>

              {/* Bottom accent */}
              <div className="h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
