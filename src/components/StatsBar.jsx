import { useEffect, useRef, useState } from "react";
import { Home, Users, Clock, MapPin } from "lucide-react";

const stats = [
  { icon: Home, number: 500, prefix: "+", suffix: "", label: "Propiedades regularizadas" },
  { icon: Users, number: 1200, prefix: "+", suffix: "", label: "Familias atendidas" },
  { icon: Clock, number: 15, prefix: "", suffix: " años", label: "De experiencia" },
  { icon: MapPin, number: 0, prefix: "", suffix: "Jalisco", label: "Cobertura estatal", isText: true },
];

function AnimatedCounter({ end, prefix, suffix, isText, duration = 2000 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    const el = ref.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [started]);

  useEffect(() => {
    if (!started || isText) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out quad
      const eased = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [started, end, duration, isText]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-extrabold font-display">
      {isText ? suffix : `${prefix}${count.toLocaleString()}${suffix}`}
    </span>
  );
}

export default function StatsBar() {
  return (
    <section className="bg-primary relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className={`flex flex-col items-center text-center text-white ${
                  index < stats.length - 1
                    ? "lg:border-r lg:border-white/20"
                    : ""
                }`}
              >
                <div className="bg-white/15 p-3 rounded-xl mb-4">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <AnimatedCounter
                  end={stat.number}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  isText={stat.isText}
                />
                <p className="text-white/80 mt-2 text-sm font-body">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
