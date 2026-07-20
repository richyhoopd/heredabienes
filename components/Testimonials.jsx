import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "María G.",
    location: "Guadalajara",
    initials: "MG",
    color: "bg-pink-500",
    text: "Teníamos una propiedad que llevaba 20 años sin escriturar después del fallecimiento de mi madre. HeredaBienes resolvió todo en 4 meses. Profesionales y muy humanos.",
    rating: 5,
  },
  {
    name: "Roberto L.",
    location: "Zapopan",
    initials: "RL",
    color: "bg-blue-600",
    text: "Mi caso era complicado: varios herederos y nadie de acuerdo. El equipo de HeredaBienes nos guió con mucha paciencia hasta llegar al acuerdo. 100% recomendados.",
    rating: 5,
  },
  {
    name: "Familia Torres",
    location: "Tlaquepaque",
    initials: "FT",
    color: "bg-emerald-500",
    text: "Pensábamos que regularizar la propiedad de mi abuelo sería imposible. En menos de 6 meses ya tenemos la escritura. El costo fue justo y el proceso muy claro.",
    rating: 5,
  },
];

export default function Testimonials() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="py-20 sm:py-24 bg-white" id="testimonios">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <span className="inline-block bg-primary-light text-primary px-4 py-1.5 rounded-full text-sm font-semibold mb-4 font-display">
            Testimonios
          </span>
          <h2 className="section-title">
            Lo que dicen{" "}
            <span className="text-primary">nuestras familias</span>
          </h2>
          <div className="section-divider mt-4" />
        </div>

        {/* Testimonial cards - Desktop: show all, Mobile: carousel */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <TestimonialCard key={index} testimonial={t} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {testimonials.map((t, index) => (
                <div key={index} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={prev}
              className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === current
                      ? "bg-primary w-8 h-2.5"
                      : "bg-gray-300 w-2.5 h-2.5"
                  }`}
                  aria-label={`Testimonio ${index + 1}`}
                />
              ))}
            </div>
            <button
              onClick={next}
              className="p-2 rounded-full bg-gray-100 hover:bg-primary/10 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 relative border-l-4 border-l-primary hover:shadow-xl transition-shadow duration-300">
      {/* Quote icon */}
      <div className="absolute top-6 right-6">
        <Quote size={32} className="text-primary/10" />
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={18} className="text-yellow-400 fill-yellow-400" />
        ))}
      </div>

      {/* Text */}
      <p className="text-gray-600 italic mb-6 font-body leading-relaxed">
        "{testimonial.text}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-3">
        <div
          className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold font-display text-sm`}
        >
          {testimonial.initials}
        </div>
        <div>
          <p className="font-semibold text-gray-900 font-display">
            {testimonial.name}
          </p>
          <p className="text-sm text-gray-400 font-body">{testimonial.location}</p>
        </div>
      </div>
    </div>
  );
}
