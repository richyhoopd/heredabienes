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
  CheckCircle,
} from "lucide-react";
import ContactForm from "../components/ContactForm";

const services = [
  {
    icon: FileText,
    title: "Sucesiones y Herencias",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
    description:
      "Tramitamos juicios sucesorios testamentarios e intestamentarios. Te guiamos en cada paso para que tu herencia quede correctamente adjudicada.",
    includes: [
      "Sucesión testamentaria ante notario",
      "Sucesión intestamentaria (judicial o notarial)",
      "Adjudicación de bienes inmuebles",
      "Inscripción en el Registro Público de la Propiedad",
      "Asesoría personalizada para herederos",
    ],
  },
  {
    icon: Shield,
    title: "Regularización de Propiedades",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80",
    description:
      "Regularizamos inmuebles sin escrituras, propiedades ejidales, predios irregulares y todo tipo de situaciones patrimoniales complejas.",
    includes: [
      "Propiedades sin escrituras",
      "Regularización de predios ejidales",
      "Prescripción adquisitiva (usucapión)",
      "Resolución de conflictos de linderos",
      "Actualización de documentos catastrales",
    ],
  },
  {
    icon: PenTool,
    title: "Escrituración",
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
    description:
      "Gestionamos el proceso completo de escrituración ante notario público para que tu propiedad quede formalmente a tu nombre.",
    includes: [
      "Escrituración de compraventa",
      "Escrituración por donación",
      "Primeras escrituras de inmuebles",
      "Coordinación con notaría pública",
      "Inscripción registral del título",
    ],
  },
  {
    icon: Building,
    title: "Compra y Venta de Inmuebles",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
    description:
      "¿Deseas vender una propiedad heredada o comprar un inmueble? Te asesoramos para cerrar la operación de forma segura y al mejor precio.",
    includes: [
      "Valuación comercial del inmueble",
      "Asesoría en negociación",
      "Due diligence legal completo",
      "Contratos de compraventa",
      "Acompañamiento hasta la escrituración",
    ],
  },
  {
    icon: TrendingUp,
    title: "Asesoría Patrimonial",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    description:
      "Planifica el futuro de tu patrimonio familiar. Te ayudamos a estructurar tu herencia en vida y a proteger tus bienes para las próximas generaciones.",
    includes: [
      "Planeación patrimonial en vida",
      "Asesoría en testamentos",
      "Estructuración de fideicomisos",
      "Protección de bienes familiares",
      "Consultoría fiscal inmobiliaria",
    ],
  },
  {
    icon: Landmark,
    title: "Trámites ante el Registro Público",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80",
    description:
      "Realizamos inscripciones, cancelaciones de hipotecas, certificados de libertad de gravamen y todos los trámites ante el RPPC de Jalisco.",
    includes: [
      "Inscripción de escrituras",
      "Cancelación de hipotecas y gravámenes",
      "Certificados de libertad de gravamen",
      "Constancias de no inscripción",
      "Anotaciones preventivas",
    ],
  },
  {
    icon: CreditCard,
    title: "Gestión de Predial y Adeudos",
    image: "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=800&q=80",
    description:
      "Regularizamos adeudos de predial, agua y otros servicios para que tu propiedad esté al corriente antes de cualquier trámite.",
    includes: [
      "Regularización de predial atrasado",
      "Gestión de adeudos de agua",
      "Convenios de pago municipales",
      "Actualización de datos catastrales",
      "Obtención de constancias al corriente",
    ],
  },
  {
    icon: BarChart2,
    title: "Avalúos y Gestión Notarial",
    image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=800&q=80",
    description:
      "Coordinamos avalúos catastrales y comerciales, y gestionamos todos los trámites notariales para tus operaciones inmobiliarias.",
    includes: [
      "Avalúos catastrales",
      "Avalúos comerciales",
      "Gestión de trámites notariales",
      "Coordinación con peritos valuadores",
      "Dictámenes técnicos de inmuebles",
    ],
  },
];

export default function Servicios() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[40vh] min-h-[300px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&q=80"
          alt="Servicios de HeredaBienes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/70" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Nuestros Servicios
          </h1>
          <p className="text-lg text-gray-300 font-body max-w-2xl mx-auto">
            Soluciones integrales para proteger tu patrimonio inmobiliario en Jalisco.
          </p>
        </div>
      </section>

      {/* Services Detail */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-24">
            {services.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                    isEven ? "" : "lg:direction-rtl"
                  }`}
                >
                  {/* Image */}
                  <div className={`${isEven ? "lg:order-1" : "lg:order-2"}`}>
                    <div className="relative rounded-3xl overflow-hidden shadow-xl group">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-[350px] object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/30 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white p-3 rounded-xl shadow-lg">
                          <Icon size={28} className="text-primary" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`${isEven ? "lg:order-2" : "lg:order-1"}`}>
                    <span className="inline-block bg-primary-light text-primary px-3 py-1 rounded-full text-xs font-semibold mb-3 font-display">
                      Servicio {String(index + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-display">
                      {service.title}
                    </h3>
                    <p className="text-gray-500 mb-6 font-body leading-relaxed">
                      {service.description}
                    </p>

                    {/* Includes list */}
                    <div className="space-y-3 mb-6">
                      <p className="text-sm font-semibold text-gray-700 font-display">
                        Este servicio incluye:
                      </p>
                      {service.includes.map((item, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle
                            size={16}
                            className="text-primary flex-shrink-0 mt-0.5"
                          />
                          <span className="text-sm text-gray-600 font-body">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      to="/contacto"
                      className="btn-primary"
                    >
                      Solicitar información
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactForm />
    </main>
  );
}
