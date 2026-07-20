import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { listFeaturedProperties } from '../../lib/api/properties';
import { createServerSupabase } from '../../lib/supabase/server';
import PropertyCard from './PropertyCard';

export default async function FeaturedProperties({ limit = 3 }) {
  let propiedades = [];
  try {
    const supabase = await createServerSupabase();
    propiedades = await listFeaturedProperties(limit, supabase);
  } catch (error) {
    // El Home no debe caerse si Supabase no responde: simplemente no se muestra la sección.
    return null;
  }

  if (!Array.isArray(propiedades) || propiedades.length === 0) return null;

  return (
    <section className="bg-gray-soft py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center sm:mb-12">
          <div className="section-divider" />
          <h2 className="section-title">Propiedades destacadas</h2>
          <p className="section-subtitle">
            Inmuebles seleccionados con documentación revisada por nuestro equipo legal. Listos para
            escriturar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {propiedades.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/propiedades" className="btn-primary">
            Ver todo el catálogo
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
