import {
  Scale,
  ClipboardList,
  Gavel,
  Award,
  BookOpen,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Scale,
    title: "Asesoría Legal",
    description:
      "Diagnóstico gratuito de tu caso para elegir la vía correcta.",
  },
  {
    number: "02",
    icon: ClipboardList,
    title: "Expediente",
    description:
      "Recopilación de documentos y pruebas necesarias.",
  },
  {
    number: "03",
    icon: Gavel,
    title: "Gestión",
    description:
      "Presentación de demanda o trámite administrativo.",
  },
  {
    number: "04",
    icon: Award,
    title: "Resolución",
    description:
      "Sentencia del Juez o Título de Propiedad.",
  },
  {
    number: "05",
    icon: BookOpen,
    title: "Inscripción",
    description:
      "Registro Público para obtener la Escritura.",
  },
];

export default function ProcessSteps() {
  return (
    <section className="py-20 sm:py-24 bg-white" id="proceso">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            La Ruta
          </span>
          <h2 className="section-title">
            Hacia la{" "}
            <span className="text-primary">Seguridad Jurídica</span>
          </h2>
          <div className="section-divider mt-4" />
          <p className="section-subtitle">
            Un proceso claro y transparente, de principio a fin. Nosotros nos
            encargamos de todo para que tú solo te preocupes por disfrutar tu
            patrimonio.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-20 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-primary/30" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="relative flex flex-col items-center text-center group">
                  {/* Mobile connector */}
                  {index < steps.length - 1 && (
                    <div className="sm:hidden absolute top-full left-1/2 w-0.5 h-8 border-l-2 border-dashed border-primary/30" />
                  )}

                  {/* Number circle */}
                  <div className="relative z-10 mb-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform duration-300 group-hover:rotate-3">
                      <Icon size={28} className="text-white" strokeWidth={1.5} />
                    </div>
                    <span className="absolute -top-2 -right-2 bg-dark text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center font-display">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-body max-w-xs leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
