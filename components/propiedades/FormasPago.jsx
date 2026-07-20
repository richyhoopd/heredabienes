import { Wallet } from 'lucide-react';

export default function FormasPago({ formas }) {
  const lista = Array.isArray(formas) ? formas.filter((f) => f && String(f).trim()) : [];
  if (lista.length === 0) return null;

  return (
    <section aria-labelledby="formas-pago" className="py-8">
      <h2 id="formas-pago" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Formas de pago
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {lista.map((forma) => (
          <li
            key={forma}
            className="flex items-center gap-3 rounded-2xl border border-primary-light bg-primary-light/50 px-4 py-3.5"
          >
            <Wallet size={20} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-800 font-display">{forma}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
