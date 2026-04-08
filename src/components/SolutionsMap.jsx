import { useState } from "react";
import {
  Scale,
  FileText,
  Search,
  Landmark,
  Home,
  CreditCard,
  Gift,
  Zap,
  MessageCircle,
} from "lucide-react";

const solutions = [
  {
    id: "intestamentario",
    icon: Scale,
    tab: "Juicio Intestamentario",
    situation: "DUEÑO FALLECIÓ SIN TESTAMENTO",
    title: "Juicio Intestamentario",
    description:
      "La propiedad sigue legalmente a nombre de una persona fallecida. Nadie tiene poder legal para venderla, rentarla o hipotecarla hasta que se designen herederos.",
    documents: [
      "Acta de Defunción",
      "Actas de Nacimiento",
      "Acta de Matrimonio",
      "Escrituras de la propiedad",
    ],
    where: "Juzgados de lo Familiar (Jalisco)",
    steps: [
      {
        title: "Denuncia del Intestado",
        desc: "Se notifica al juez del fallecimiento",
      },
      {
        title: "Declaratoria de Herederos",
        desc: "El juez reconoce a los herederos legales",
      },
      {
        title: "Inventario y Avalúo",
        desc: "Se listan los bienes y su valor",
      },
      {
        title: "Adjudicación",
        desc: "Se emite nueva escritura a nombre de los herederos",
      },
    ],
    highlight: null,
  },
  {
    id: "proforma",
    icon: FileText,
    tab: "Acción Proforma",
    situation: "VENDEDOR NO FIRMA LAS ESCRITURAS",
    title: "Acción Proforma",
    description:
      "Tienes un contrato privado de compraventa y pagaste el precio acordado, pero el vendedor se niega a acudir al notario o te da largas.",
    documents: [
      "Contrato privado de compraventa",
      "Recibos de pago",
      "Identificación oficial",
    ],
    where: "Juzgados Civiles (Jalisco)",
    steps: [
      {
        title: "Demanda Civil",
        desc: 'Se inicia un juicio de "Otorgamiento y Firma de Escritura"',
      },
      {
        title: "Pruebas",
        desc: "Se presenta el contrato original y recibos de pago",
      },
      {
        title: "Sentencia",
        desc: "El juez condena al vendedor a firmar la escritura",
      },
    ],
    highlight: "Si el vendedor no firma, ¡EL JUEZ FIRMA POR ÉL EN REBELDÍA!",
  },
  {
    id: "inmatriculacion",
    icon: Search,
    tab: "Inmatriculación",
    situation: "PREDIO NO APARECE EN REGISTRO PÚBLICO",
    title: "Inmatriculación",
    description:
      'La propiedad existe físicamente, pero no tiene antecedentes en el Registro Público. Legalmente es "invisible", como una persona sin acta de nacimiento.',
    documents: [
      "Constancia catastral",
      "Comprobantes de pago de predial",
      "Identificación oficial",
    ],
    where: "Catastro y Registro Público de la Propiedad",
    steps: [
      {
        title: "Certificado de No Inscripción",
        desc: "El Registro Público certifica que el predio NO está registrado",
      },
      {
        title: "Constancia Catastral",
        desc: "Se demuestra existencia en el padrón municipal",
      },
      {
        title: "Resolución",
        desc: "Un Juez autoriza crear la primera escritura",
      },
      {
        title: "Alta en RPP",
        desc: "Se genera el primer folio real de la propiedad",
      },
    ],
    highlight: null,
  },
  {
    id: "dominio-pleno",
    icon: Landmark,
    tab: "Dominio Pleno ante el RAN",
    situation: "TERRENO DE UN EJIDO",
    title: "Dominio Pleno ante el RAN",
    description:
      "La tierra pertenece legalmente al Ejido. Tienes un Certificado Parcelario que te da derecho de uso (usufructo), pero no es una Escritura Pública.",
    documents: [
      "Certificado Parcelario",
      "Acta de asamblea ejidal",
      "Identificación oficial",
    ],
    where: "Registro Agrario Nacional (RAN)",
    steps: [
      {
        title: "Asamblea Dura",
        desc: "La Asamblea Ejidal autoriza la adopción del Dominio Pleno",
      },
      {
        title: "Gestión ante el RAN",
        desc: "Se inscribe el acta de asamblea",
      },
      {
        title: "Título de Propiedad",
        desc: "El RAN cancela el Certificado Parcelario y emite el Título",
      },
    ],
    highlight: null,
  },
  {
    id: "usucapion",
    icon: Home,
    tab: "Usucapión",
    situation: "POSESIÓN SIN PAPELES",
    title: "Usucapión",
    description:
      "Llevas años viviendo en la propiedad, pagas servicios y predial, los vecinos te reconocen como dueño, pero no tienes escrituras ni contrato de compraventa.",
    documents: [
      "Comprobantes de servicios",
      "Recibos de predial",
      "Testimonios de vecinos",
    ],
    where: "Juzgados Civiles (Jalisco)",
    steps: [
      { title: "Posesión Pacífica", desc: "Sin violencia" },
      { title: "Continua", desc: "Sin interrupciones" },
      { title: "Pública", desc: "A la vista de todos" },
      {
        title: "En concepto de Propietario",
        desc: "5 años (Buena Fe) o 10 años (Mala Fe)",
      },
    ],
    highlight: null,
  },
  {
    id: "cancelacion-hipoteca",
    icon: CreditCard,
    tab: "Cancelación de Hipoteca",
    situation: "CRÉDITO PAGADO SIN LIBERAR",
    title: "Cancelación de Hipoteca",
    description:
      'Terminaste de pagar al Banco o INFONAVIT y tienes tu carta de "Saldo Cero", pero en el Registro Público la casa sigue apareciendo con deuda.',
    documents: [
      "Carta de saldo cero",
      "Escrituras originales",
      "Identificación oficial",
    ],
    where: "Notarías Públicas",
    steps: [
      {
        title: "Carta de Instrucción",
        desc: "Solicita a la institución financiera la carta dirigida al notario",
      },
      {
        title: "Notario Público",
        desc: "Elige un notario para elaborar la escritura de cancelación",
      },
      {
        title: "Firma del Banco",
        desc: "El representante legal del banco firma la liberación",
      },
      {
        title: "Registro Público",
        desc: "Se inscribe la cancelación para borrar el gravamen",
      },
    ],
    highlight: null,
  },
  {
    id: "donacion-formal",
    icon: Gift,
    tab: "Donación Formal",
    situation: "DONACIÓN VERBAL DE PADRES A HIJOS",
    title: "Donación Formal",
    description:
      "Las donaciones verbales de bienes inmuebles son NULAS. Si el dueño fallece sin firmar, la propiedad entra a Juicio Sucesorio y se reparte entre todos los herederos legales.",
    documents: ["Escrituras", "Predial al corriente", "Avalúo"],
    where: "Notarías Públicas",
    steps: [
      {
        title: "Acudir con Escrituras y Predial",
        desc: "",
      },
      {
        title: "Realizar Avalúo de la propiedad",
        desc: "",
      },
      {
        title: "Firmar Escritura de Donación ante Notario",
        desc: "",
      },
    ],
    highlight: "Las donaciones entre padres e hijos están EXENTAS de ISR",
  },
];

export default function SolutionsMap() {
  const [activeTab, setActiveTab] = useState(0);
  const active = solutions[activeTab];
  const Icon = active.icon;

  return (
    <section
      className="py-20 sm:py-24 bg-dark relative overflow-hidden"
      id="soluciones"
    >
      {/* Subtle background texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            Mapa de Soluciones
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 font-display">
            Una Solución Para{" "}
            <span className="text-amber-400">Cada Problema</span>
          </h2>
          <div className="w-16 h-1 bg-amber-400 mx-auto mb-6 rounded-full" />
          <p className="text-lg text-gray-400 max-w-2xl mx-auto font-body">
            Cada situación legal tiene un camino claro. Identifica tu caso y
            conoce exactamente cómo lo resolveremos.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-12">
          {solutions.map((sol, index) => {
            const TabIcon = sol.icon;
            return (
              <button
                key={sol.id}
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold font-display transition-all duration-300 ${
                  activeTab === index
                    ? "bg-amber-500 text-dark shadow-lg shadow-amber-500/30"
                    : "bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white"
                }`}
              >
                <TabIcon size={16} />
                <span className="hidden sm:inline">{sol.tab}</span>
                <span className="sm:hidden">
                  {sol.tab.length > 15
                    ? sol.tab.slice(0, 12) + "..."
                    : sol.tab}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Solution Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Left: Info */}
            <div className="p-8 sm:p-10 lg:p-12">
              {/* Situation label */}
              <div className="flex items-center gap-2 mb-6">
                <Icon size={20} className="text-amber-400" />
                <span className="text-amber-400 text-xs font-bold font-display tracking-widest uppercase">
                  {active.situation}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4 font-display">
                {active.title}
              </h3>

              {/* Description */}
              <p className="text-gray-400 font-body leading-relaxed mb-8">
                {active.description}
              </p>

              {/* Highlight */}
              {active.highlight && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-start gap-3">
                  <Zap
                    size={20}
                    className="text-amber-400 flex-shrink-0 mt-0.5"
                  />
                  <p className="text-amber-300 font-semibold text-sm font-display">
                    {active.highlight}
                  </p>
                </div>
              )}

              {/* Documents */}
              <div className="mb-6">
                <p className="text-white text-sm font-bold font-display mb-3 tracking-wide uppercase">
                  Documentos necesarios:
                </p>
                <div className="flex flex-wrap gap-2">
                  {active.documents.map((doc) => (
                    <span
                      key={doc}
                      className="bg-white/10 text-gray-300 px-3 py-1.5 rounded-lg text-xs font-body border border-white/5"
                    >
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Where to manage */}
              <div className="flex items-center gap-2 mb-8">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <p className="text-gray-400 text-sm font-body">
                  Gestionar en:{" "}
                  <span className="text-gray-200 font-medium">
                    {active.where}
                  </span>
                </p>
              </div>

              {/* CTA */}
              <a
                href="https://wa.me/5213313013253?text=Hola%2C%20quiero%20una%20consulta%20gratuita"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-amber-500 text-dark px-6 py-3 rounded-full font-semibold hover:bg-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:shadow-xl font-display"
              >
                <MessageCircle size={18} />
                Iniciar Este Proceso
              </a>
            </div>

            {/* Right: Steps */}
            <div className="bg-white/[0.03] p-8 sm:p-10 lg:p-12 border-t lg:border-t-0 lg:border-l border-white/10">
              <p className="text-white text-sm font-bold font-display mb-8 tracking-widest uppercase">
                Proceso paso a paso:
              </p>

              <div className="space-y-6">
                {active.steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4 group">
                    {/* Step number */}
                    <div className="flex-shrink-0 relative">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/30 group-hover:bg-amber-500/30 transition-colors">
                        <span className="text-amber-400 font-bold text-sm font-display">
                          {index + 1}
                        </span>
                      </div>
                      {/* Connector line */}
                      {index < active.steps.length - 1 && (
                        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-6 bg-white/10" />
                      )}
                    </div>

                    {/* Step content */}
                    <div className="pt-1.5">
                      <p className="text-white font-semibold font-display text-sm sm:text-base">
                        {step.title}
                        {step.desc && (
                          <span className="text-gray-400 font-normal font-body">
                            {" "}
                            — {step.desc}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
