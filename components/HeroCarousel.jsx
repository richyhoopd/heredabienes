import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle } from "lucide-react";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80",
    title: "¿Recibiste una propiedad en herencia?",
    subtitle: "Te ayudamos a regularizarla y escriturarla sin complicaciones.",
    cta: "Inicia tu trámite",
    ctaLink: "/contacto",
  },
  {
    image: "https://images.unsplash.com/photo-1582407947304-fd86f28f96da?w=1600&q=80",
    title: "Regulariza tu propiedad con seguridad jurídica",
    subtitle: "Propiedades sin escrituras, intestados sin resolver — nosotros lo gestionamos.",
    cta: "Ver servicios",
    ctaLink: "/servicios",
  },
  {
    image: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1600&q=80",
    title: "Escrituración rápida y sin estrés",
    subtitle: "Más de 500 familias en Jalisco han protegido su patrimonio con nosotros.",
    cta: "Consulta gratis",
    ctaLink: "/contacto",
  },
  {
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=80",
    title: "Asesoría patrimonial personalizada",
    subtitle: "Planifica el futuro de tu familia con expertos inmobiliarios.",
    cta: "Hablar con un asesor",
    ctaLink: "/contacto",
  },
  {
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80",
    title: "Compra y venta de propiedades heredadas",
    subtitle: "Maximiza el valor de tu inmueble con nuestro equipo de expertos.",
    cta: "Conoce más",
    ctaLink: "/servicios",
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index) => {
      setIsAnimating(false);
      setTimeout(() => {
        setCurrent(index);
        setIsAnimating(true);
      }, 50);
    },
    []
  );

  const next = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, isPaused]);

  const handleManualNav = (action) => {
    setIsPaused(true);
    action();
    // Resume autoplay after 10 seconds of no interaction
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden" id="hero">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          {/* Background image */}
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark/80 via-dark/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/40 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
            <div className="max-w-2xl">
              <div
                className={`transition-all duration-700 delay-100 ${
                  index === current && isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <span className="inline-block bg-primary/20 text-primary-light px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
                  Tu patrimonio, en manos confiables
                </span>
              </div>
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 font-display transition-all duration-700 delay-200 ${
                  index === current && isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                {slide.title}
              </h1>
              <p
                className={`text-lg sm:text-xl text-gray-200 mb-8 font-body max-w-xl transition-all duration-700 delay-300 ${
                  index === current && isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                {slide.subtitle}
              </p>
              <div
                className={`flex flex-wrap gap-4 transition-all duration-700 delay-[400ms] ${
                  index === current && isAnimating
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <Link
                  to={slide.ctaLink}
                  className="bg-primary text-white px-8 py-4 rounded-full font-semibold hover:bg-primary-dark transition-all duration-200 inline-flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 text-lg font-display"
                >
                  {slide.cta}
                  <ArrowRight size={20} />
                </Link>
                <Link
                  to="/nosotros"
                  className="border-2 border-white/40 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/10 transition-all duration-200 backdrop-blur-sm font-display"
                >
                  Conócenos
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Badge */}
      <div className="absolute top-24 right-4 sm:right-8 z-10">
        <div className="bg-primary text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/30 flex items-center gap-2 font-display backdrop-blur-sm">
          <CheckCircle size={18} />
          +500 familias atendidas
        </div>
      </div>

      {/* Navigation arrows */}
      <button
        onClick={() => handleManualNav(prev)}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 group"
        aria-label="Anterior"
      >
        <ChevronLeft size={24} className="group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={() => handleManualNav(next)}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all duration-200 group"
        aria-label="Siguiente"
      >
        <ChevronRight size={24} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => handleManualNav(() => goTo(index))}
            className={`transition-all duration-300 rounded-full ${
              index === current
                ? "bg-primary w-10 h-3"
                : "bg-white/40 hover:bg-white/60 w-3 h-3"
            }`}
            aria-label={`Ir a slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Bottom gradient for smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent z-[5]" />
    </section>
  );
}
