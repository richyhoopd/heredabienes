import { Check } from 'lucide-react';

export default function ListaChips({ titulo, items, icono: Icono, variante = 'chips' }) {
  const lista = Array.isArray(items) ? items.filter((i) => i && String(i).trim()) : [];
  if (lista.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md sm:p-6">
      <h3 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900 font-display sm:text-lg">
        {Icono ? <Icono size={18} className="text-primary" aria-hidden="true" /> : null}
        {titulo}
      </h3>

      {variante === 'lista' ? (
        <ul className="space-y-2.5">
          {lista.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600 font-body">
              <Check size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {lista.map((item) => (
            <li
              key={item}
              className="rounded-full bg-gray-soft px-3.5 py-1.5 text-sm text-gray-700 font-body"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
