import { Compass, Maximize2, Ruler } from 'lucide-react';
import { formatSuperficie } from '../../lib/format';

const ORIENTACIONES = [
  { campo: 'medidaNorte', label: 'Norte' },
  { campo: 'medidaSur', label: 'Sur' },
  { campo: 'medidaOriente', label: 'Oriente' },
  { campo: 'medidaPoniente', label: 'Poniente' },
];

export default function MedidasTerreno({ property }) {
  if (!property) return null;

  const medidas = ORIENTACIONES.map((o) => ({ ...o, valor: property[o.campo] })).filter(
    (o) => o.valor && String(o.valor).trim(),
  );

  const superficies = [];
  if (property.superficieTerrenoM2) {
    superficies.push({ icono: Maximize2, label: 'Superficie de terreno', valor: formatSuperficie(property.superficieTerrenoM2) });
  }
  if (property.superficieConstruccionM2) {
    superficies.push({ icono: Ruler, label: 'Superficie de construcción', valor: formatSuperficie(property.superficieConstruccionM2) });
  }

  const nota = property.medidasNota && String(property.medidasNota).trim();

  if (medidas.length === 0 && superficies.length === 0 && !nota) return null;

  return (
    <section aria-labelledby="medidas" className="py-8">
      <h2 id="medidas" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Medidas y superficie
      </h2>

      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        {superficies.length > 0 && (
          <dl className="grid grid-cols-1 divide-y divide-gray-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {superficies.map((s) => {
              const Icono = s.icono;
              return (
                <div key={s.label} className="flex items-center gap-3 p-5">
                  <Icono size={20} className="shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-400 font-display">{s.label}</dt>
                    <dd className="text-lg font-bold text-gray-900 font-display">{s.valor}</dd>
                  </div>
                </div>
              );
            })}
          </dl>
        )}

        {medidas.length > 0 && (
          <div className={superficies.length > 0 ? 'border-t border-gray-100' : ''}>
            <h3 className="flex items-center gap-2 border-b border-gray-100 bg-gray-soft px-5 py-3 text-sm font-semibold text-gray-700 font-display">
              <Compass size={16} className="text-primary" aria-hidden="true" />
              Medidas por orientación
            </h3>
            <dl className="divide-y divide-gray-100">
              {medidas.map((m) => (
                <div key={m.campo} className="flex items-start justify-between gap-4 px-5 py-3.5">
                  <dt className="text-sm font-semibold text-gray-500 font-display">{m.label}</dt>
                  <dd className="text-right text-sm font-bold text-gray-900 font-body">{m.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </div>

      {nota ? (
        <p className="mt-3 text-sm italic leading-relaxed text-gray-500 font-body">{nota}</p>
      ) : null}
    </section>
  );
}
