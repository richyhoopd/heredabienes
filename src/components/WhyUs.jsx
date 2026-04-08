import { CheckCircle, Sparkles, MessageCircle } from "lucide-react";

const benefits = [
  "Asesoría legal personalizada y gratuita",
  "Financiamiento del proceso completo",
  "Equipo especializado en derecho inmobiliario",
  "Acompañamiento de inicio a fin",
  "Resultados garantizados",
];

const stats = [
  { number: "500+", label: "Casos Resueltos" },
  { number: "98%", label: "Clientes Satisfechos" },
  { number: "15+", label: "Años de Experiencia" },
  { number: "7", label: "Soluciones Legales" },
];

export default function WhyUs() {
  return (
    <section className="py-20 sm:py-24 bg-gray-soft" id="por-que">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80"
                alt="Equipo profesional de Heredum"
                className="w-full h-[500px] object-cover"
                loading="lazy"
              />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -right-4 sm:bottom-6 sm:right-6 bg-primary text-white px-6 py-3 rounded-2xl shadow-xl shadow-primary/30 font-display font-semibold flex items-center gap-2">
              <Sparkles size={20} />
              Consulta gratis disponible
            </div>

            {/* Decorative element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-4 border-primary/20 rounded-3xl -z-10" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-3xl -z-10" />
          </div>

          {/* Content */}
          <div>
            <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
              ¿Por qué Heredum?
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 font-display">
              Seguridad, Firmeza y{" "}
              <span className="text-primary">Confianza</span>
            </h2>
            <p className="text-gray-500 mb-8 font-body text-lg leading-relaxed">
              En Heredum, nos especializamos en la regularización de propiedades
              en Jalisco. Financiamos y gestionamos todo el proceso legal para
              que tu patrimonio esté debidamente protegido.
            </p>

            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex gap-3 group">
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <CheckCircle size={18} className="text-primary" />
                    </div>
                  </div>
                  <p className="font-medium text-gray-700 font-body">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>

            {/* Stats inline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100"
                >
                  <p className="text-2xl font-extrabold text-primary font-display">
                    {stat.number}
                  </p>
                  <p className="text-xs text-gray-500 font-body mt-1">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="https://wa.me/5213313013253?text=Hola%2C%20quiero%20una%20asesor%C3%ADa%20personalizada"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-dark transition-all duration-200 hover:shadow-lg hover:shadow-primary/30 text-lg font-display"
            >
              <MessageCircle size={20} />
              ¡Agenda Tu Asesoría Personalizada!
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
