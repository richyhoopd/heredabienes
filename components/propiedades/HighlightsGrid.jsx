import {
  Building2,
  Landmark,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  Store,
  TreePine,
  TrendingUp,
  Zap,
} from 'lucide-react';

const ICONOS = {
  zona: Landmark,
  premium: Landmark,
  ubicacion: MapPin,
  estrategica: MapPin,
  servicios: Zap,
  oportunidad: TrendingUp,
  plusvalia: TrendingUp,
  conectividad: Route,
  comercio: Store,
  desarrollo: Building2,
  legal: ShieldCheck,
  entorno: TreePine,
};

function resolverIcono(nombre) {
  if (!nombre) return Sparkles;
  return ICONOS[String(nombre).toLowerCase().trim()] ?? Sparkles;
}

export default function HighlightsGrid({ highlights }) {
  const items = Array.isArray(highlights) ? highlights.filter((h) => h && h.titulo) : [];
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="highlights" className="py-8">
      <h2 id="highlights" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Por qué esta propiedad
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.slice(0, 4).map((item, i) => {
          const Icono = resolverIcono(item.icono);
          return (
            <div key={`${item.titulo}-${i}`} className="flex gap-4 rounded-2xl bg-white p-5 shadow-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-light">
                <Icono size={22} className="text-primary" aria-hidden="true" />
              </div>
              <div>
                <h3 className="mb-1 text-base font-bold text-gray-900 font-display">{item.titulo}</h3>
                {item.texto ? (
                  <p className="text-sm leading-relaxed text-gray-500 font-body">{item.texto}</p>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
