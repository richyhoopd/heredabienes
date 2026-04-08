import { Link } from "react-router-dom";
import {
  FileText,
  Shield,
  PenTool,
  Building,
  TrendingUp,
  Landmark,
  CreditCard,
  BarChart2,
  ArrowRight,
} from "lucide-react";

const services = [
  {
    icon: FileText,
    title: "Sucesiones y Herencias",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=80",
    description:
      "Tramitamos juicios sucesorios testamentarios e intestamentarios. Te guiamos en cada paso para que tu herencia quede correctamente adjudicada.",
  },
  {
    icon: Shield,
    title: "Regularización de Propiedades",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=80",
    description:
      "Regularizamos inmuebles sin escrituras, propiedades ejidales, predios irregulares y todo tipo de situaciones patrimoniales complejas.",
  },
  {
    icon: PenTool,
    title: "Escrituración",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=400&q=80",
    description:
      "Gestionamos el proceso completo de escrituración ante notario público para que tu propiedad quede formalmente a tu nombre.",
  },
  {
    icon: Building,
    title: "Compra y Venta de Inmuebles",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=80",
    description:
      "¿Deseas vender una propiedad heredada o comprar un inmueble? Te asesoramos para cerrar la operación de forma segura y al mejor precio.",
  },
  {
    icon: TrendingUp,
    title: "Asesoría Patrimonial",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    description:
      "Planifica el futuro de tu patrimonio familiar. Te ayudamos a estructurar tu herencia en vida y a proteger tus bienes para las próximas generaciones.",
  },
  {
    icon: Landmark,
    title: "Trámites ante el Registro Público",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=80",
    description:
      "Realizamos inscripciones, cancelaciones de hipotecas, certificados de libertad de gravamen y todos los trámites ante el RPPC de Jalisco.",
  },
  {
    icon: CreditCard,
    title: "Gestión de Predial y Adeudos",
    image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=400&q=80",
    description:
      "Regularizamos adeudos de predial, agua y otros servicios para que tu propiedad esté al corriente antes de cualquier trámite.",
  },
  {
    icon: BarChart2,
    title: "Avalúos y Gestión Notarial",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&q=80",
    description:
      "Coordinamos avalúos catastrales y comerciales, y gestionamos todos los trámites notariales para tus operaciones inmobiliarias.",
  },
];

export default function ServicesGrid({ expanded = false }) {
  return (
    <section className="py-20 sm:py-24 bg-white" id="servicios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            Nuestros Servicios
          </span>
          <h2 className="section-title">
            Soluciones para proteger{" "}
            <span className="text-primary">tu patrimonio</span>
          </h2>
          <div className="section-divider mt-4" />
          <p className="section-subtitle">
            Soluciones integrales para proteger tu patrimonio inmobiliario en Jalisco.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary/20 hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                  {/* Icon badge */}
                  <div className="absolute -bottom-5 left-5">
                    <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-100">
                      <Icon size={24} className="text-primary" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 font-body leading-relaxed">
                    {expanded
                      ? service.description
                      : service.description.length > 120
                      ? service.description.slice(0, 120) + "..."
                      : service.description}
                  </p>
                  <Link
                    to="/servicios"
                    className="inline-flex items-center gap-1.5 text-primary text-sm font-semibold hover:gap-3 transition-all duration-200 font-display"
                  >
                    Saber más
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Hover accent border */}
                <div className="h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </div>
            );
          })}
        </div>

        {/* CTA */}
        {!expanded && (
          <div className="text-center mt-12">
            <Link to="/servicios" className="btn-primary text-lg">
              Ver todos los servicios
              <ArrowRight size={20} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
