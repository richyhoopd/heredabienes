'use client';

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "¿Cuánto tiempo tarda regularizar una propiedad heredada en Jalisco?",
    answer:
      "Dependiendo del caso, entre 3 y 12 meses. Con testamento, el proceso es más rápido. Nuestro equipo te dará un estimado real desde la primera consulta.",
  },
  {
    question: "¿Qué pasa si no hay testamento?",
    answer:
      "Se tramita una sucesión intestamentaria ante notario público o juez, según corresponda. Te acompañamos en todo el proceso.",
  },
  {
    question: "¿Qué impuestos debo pagar al heredar una propiedad?",
    answer:
      "El principal es el ISAI (Impuesto sobre Adquisición de Inmuebles), que en Jalisco puede estar exento en herencias en línea directa (padres a hijos). También aplican gastos notariales y de registro.",
  },
  {
    question: "¿Pueden regularizarse propiedades ejidales?",
    answer:
      "Sí, aunque el proceso es distinto. Coordinamos con el Registro Agrario Nacional y las autoridades ejidales correspondientes.",
  },
  {
    question: "¿Qué documentos necesito para iniciar?",
    answer:
      "Básicamente: INE, acta de defunción del propietario anterior, testamento (si existe), escrituras o documentos de la propiedad, y actas de nacimiento de herederos. En la consulta inicial te indicamos exactamente qué aplica a tu caso.",
  },
  {
    question: "¿Trabajan solo en Guadalajara o en todo Jalisco?",
    answer:
      "Atendemos casos en todo el estado de Jalisco, incluyendo zonas metropolitanas y municipios del interior.",
  },
  {
    question: "¿Cuánto cuesta el servicio?",
    answer:
      "El costo depende del tipo de trámite y la complejidad del caso. Ofrecemos una consulta inicial gratuita donde te damos un presupuesto exacto sin compromisos.",
  },
  {
    question: "¿Puedo iniciar el proceso si hay conflicto entre herederos?",
    answer:
      "Sí. Contamos con abogados especializados en mediación y litigio familiar para estos casos.",
  },
];

export default function FAQSection({ limit }) {
  const [openIndex, setOpenIndex] = useState(null);
  const displayFaqs = limit ? faqs.slice(0, limit) : faqs;

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 sm:py-24 bg-gray-soft" id="faq">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            FAQ
          </span>
          <h2 className="section-title">
            Preguntas <span className="text-primary">frecuentes</span>
          </h2>
          <div className="section-divider mt-4" />
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          {displayFaqs.map((faq, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl border transition-all duration-300 ${
                openIndex === index
                  ? "border-primary/30 shadow-md shadow-primary/5"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
              >
                <h3 className="font-semibold text-gray-900 pr-4 font-display text-sm sm:text-base">
                  {faq.question}
                </h3>
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                    openIndex === index
                      ? "bg-primary text-white rotate-180"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <ChevronDown size={18} />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-96" : "max-h-0"
                }`}
              >
                <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-gray-500 font-body leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
