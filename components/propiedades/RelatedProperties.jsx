import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PropertyCard from './PropertyCard';

export default function RelatedProperties({ propiedades }) {
  const lista = Array.isArray(propiedades) ? propiedades.filter(Boolean) : [];
  if (lista.length === 0) return null;

  return (
    <section aria-labelledby="relacionadas" className="bg-gray-soft py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 id="relacionadas" className="text-2xl font-bold text-gray-900 font-display sm:text-3xl">
            Otras propiedades
          </h2>
          <Link
            href="/propiedades"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary font-display transition-colors hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            Ver todo el catálogo
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      </div>
    </section>
  );
}
