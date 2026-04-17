import {
  Home,
  Users,
  Clock,
  MapPin,
  Heart,
  Shield,
  Eye,
  Handshake,
  Target,
} from "lucide-react";
import CTABanner from "../components/CTABanner";

const values = [
  { icon: Heart, label: "Honestidad", color: "bg-red-50 text-red-500" },
  { icon: Shield, label: "Profesionalismo", color: "bg-blue-50 text-blue-500" },
  { icon: Handshake, label: "Empatía", color: "bg-green-50 text-green-500" },
  { icon: Eye, label: "Transparencia", color: "bg-purple-50 text-purple-500" },
  { icon: Target, label: "Compromiso familiar", color: "bg-amber-50 text-amber-500" },
];

const team = [
  {
    name: "Lic. Jose Ivan Parra Parra",
    role: "Director General",
    image: "/ceo_img.jpeg",
  },
  {
    name: "Se busca",
    role: "Socia",
    image: "/wanted_poster.png",
  },
];

const achievements = [
  { icon: Home, number: "+500", label: "Propiedades regularizadas" },
  { icon: Users, number: "+1,200", label: "Familias atendidas" },
  { icon: Clock, number: "15 años", label: "De experiencia" },
  { icon: MapPin, number: "Jalisco", label: "Cobertura estatal" },
];

export default function Nosotros() {
  return (
    <main>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1600&q=80"
          alt="Equipo de HeredaBienes"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-dark/70" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-block bg-primary/20 text-primary-light px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10 font-display">
            Conócenos
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white font-display mb-4">
            Somos HeredaBienes.
          </h1>
          <p className="text-lg text-gray-300 font-body">
            Un grupo inmobiliario dedicado a proteger el patrimonio de las
            familias en Jalisco a través de soluciones jurídicas integrales.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Misión */}
            <div className="bg-gray-soft rounded-3xl p-8 sm:p-10 border border-gray-100">
              <div className="bg-primary/10 p-3 rounded-xl w-fit mb-5">
                <Target size={28} className="text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4 font-display">
                Nuestra Misión
              </h3>
              <p className="text-gray-500 font-body leading-relaxed">
                Facilitar el acceso de las familias mexicanas a la propiedad
                legal de sus inmuebles, eliminando barreras jurídicas y
                administrativas con asesoría experta, honesta y cercana.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-primary rounded-3xl p-8 sm:p-10 text-white">
              <div className="bg-white/15 p-3 rounded-xl w-fit mb-5">
                <Eye size={28} />
              </div>
              <h3 className="text-2xl font-bold mb-4 font-display">
                Nuestra Visión
              </h3>
              <p className="text-white/80 font-body leading-relaxed">
                Ser el grupo inmobiliario de mayor confianza en Jalisco para la
                gestión patrimonial y regularización de propiedades heredadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="section-title">
              Nuestros <span className="text-primary">Valores</span>
            </h2>
            <div className="section-divider mt-4" />
          </div>

          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col items-center text-center min-w-[140px] hover:-translate-y-1"
                >
                  <div className={`p-3 rounded-xl mb-3 ${value.color}`}>
                    <Icon size={24} />
                  </div>
                  <p className="font-semibold text-gray-900 font-display text-sm">
                    {value.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
              Nuestro Equipo
            </span>
            <h2 className="section-title">
              Profesionales que{" "}
              <span className="text-primary">respaldan tu caso</span>
            </h2>
            <div className="section-divider mt-4" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center">
                  <h4 className="text-lg font-bold text-gray-900 font-display">
                    {member.name}
                  </h4>
                  <p className="text-primary text-sm font-body mt-1">
                    {member.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-gray-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((a, index) => {
              const Icon = a.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="bg-primary-light p-3 rounded-xl w-fit mx-auto mb-3">
                    <Icon size={24} className="text-primary" />
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900 font-display">
                    {a.number}
                  </p>
                  <p className="text-sm text-gray-500 font-body mt-1">
                    {a.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <CTABanner />
    </main>
  );
}
