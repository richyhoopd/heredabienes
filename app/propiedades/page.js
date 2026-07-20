import { Suspense } from 'react';
import { listProperties, listMunicipios } from '../../lib/api/properties';
import { createPublicSupabase } from '../../lib/supabase/server';
import PropertyCard from '../../components/propiedades/PropertyCard';
import PropertyFilters from '../../components/propiedades/PropertyFilters';
import EmptyState from '../../components/propiedades/EmptyState';

export const revalidate = 300;

export const metadata = {
  title: 'Propiedades en venta y renta en Jalisco | HeredaBienes',
  description:
    'Terrenos, casas y locales seleccionados en Zapopan, Guadalajara y la Zona Metropolitana. Fichas completas, medidas y contacto directo con el asesor.',
  alternates: { canonical: '/propiedades' },
  openGraph: {
    title: 'Propiedades en venta y renta en Jalisco | HeredaBienes',
    description:
      'Terrenos, casas y locales seleccionados en Zapopan, Guadalajara y la Zona Metropolitana.',
    type: 'website',
    url: '/propiedades',
    images: [
      {
        url: '/og-propiedades.jpg',
        width: 1200,
        height: 630,
        alt: 'Vista aérea de una zona residencial en la Zona Metropolitana de Guadalajara',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Propiedades en venta y renta en Jalisco | HeredaBienes',
    description:
      'Terrenos, casas y locales seleccionados en Zapopan, Guadalajara y la Zona Metropolitana.',
    images: ['/og-propiedades.jpg'],
  },
};

function aNumero(valor) {
  if (valor === undefined || valor === null || valor === '') return undefined;
  const n = Number(valor);
  return Number.isFinite(n) ? n : undefined;
}

// Sin proyecto Supabase configurado (o con la instancia caída), el catálogo
// degrada a "sin resultados" en vez de tumbar el prerender/la request.
async function cargarPropiedades(filtros, supabase) {
  try {
    return await listProperties({ ...filtros, client: supabase });
  } catch (error) {
    console.error('No se pudo cargar el listado de propiedades:', error);
    return [];
  }
}

async function cargarMunicipios(supabase) {
  try {
    return await listMunicipios(supabase);
  } catch (error) {
    console.error('No se pudo cargar la lista de municipios:', error);
    return [];
  }
}

export default async function PropiedadesPage({ searchParams }) {
  const sp = await searchParams;

  const filtros = {
    tipo: sp?.tipo || undefined,
    operacion: sp?.operacion || undefined,
    municipio: sp?.municipio || undefined,
    precioMin: aNumero(sp?.precioMin),
    precioMax: aNumero(sp?.precioMax),
    orden: sp?.orden || undefined,
  };

  const supabase = createPublicSupabase();

  const [propiedades, municipios] = await Promise.all([
    cargarPropiedades(filtros, supabase),
    cargarMunicipios(supabase),
  ]);

  return (
    <main className="min-h-screen bg-gray-soft pb-20">
      {/* Encabezado */}
      <section className="bg-dark px-4 pb-16 pt-12 sm:px-6 sm:pb-20 sm:pt-16 lg:px-8">
        <div className="mx-auto max-w-7xl text-center">
          <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary font-display">
            Catálogo
          </span>
          <h1 className="mb-4 text-3xl font-extrabold leading-tight text-white font-display sm:text-4xl lg:text-5xl">
            Propiedades disponibles
          </h1>
          <p className="mx-auto max-w-2xl text-base text-gray-300 font-body sm:text-lg">
            Inmuebles con documentación revisada por nuestro equipo legal. Cada ficha incluye
            medidas, superficie y contacto directo con el asesor.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Filtros: montados sobre el hero */}
        <div className="-mt-10 mb-8">
          <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-white shadow-md" />}>
            <PropertyFilters municipios={municipios} />
          </Suspense>
        </div>

        <p className="mb-6 text-sm text-gray-500 font-body" aria-live="polite">
          {propiedades.length === 0
            ? 'Sin resultados'
            : `${propiedades.length} ${propiedades.length === 1 ? 'propiedad' : 'propiedades'}`}
        </p>

        {propiedades.length === 0 ? (
          <EmptyState onClearHref="/propiedades" />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {propiedades.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 2} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
