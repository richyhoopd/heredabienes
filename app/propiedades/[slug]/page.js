import { notFound } from 'next/navigation';
import {
  CheckCircle2,
  Landmark,
  Sparkles,
  Target,
  Trees,
} from 'lucide-react';
import {
  getPropertyBySlug,
  listProperties,
  listRelatedProperties,
} from '../../../lib/api/properties';
import { createPublicSupabase } from '../../../lib/supabase/server';
import { formatPrecio } from '../../../lib/format';
import { urlPublicaPropiedad, urlWhatsAppPropiedad } from '../../../lib/whatsapp';
import PropertyGallery from '../../../components/propiedades/PropertyGallery';
import PropertyHeader from '../../../components/propiedades/PropertyHeader';
import StickyCTA from '../../../components/propiedades/StickyCTA';
import DatosClave from '../../../components/propiedades/DatosClave';
import HighlightsGrid from '../../../components/propiedades/HighlightsGrid';
import Descripcion from '../../../components/propiedades/Descripcion';
import MedidasTerreno from '../../../components/propiedades/MedidasTerreno';
import ListaChips from '../../../components/propiedades/ListaChips';
import FormasPago from '../../../components/propiedades/FormasPago';
import PropertyMap from '../../../components/propiedades/PropertyMap';
import AsesorCard from '../../../components/propiedades/AsesorCard';
import RelatedProperties from '../../../components/propiedades/RelatedProperties';
import CompartirRedes from '../../../components/propiedades/CompartirRedes';
import RegistrarVista from '../../../components/analytics/RegistrarVista';

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const supabase = createPublicSupabase();
    const propiedades = await listProperties({ client: supabase });
    return propiedades.map((p) => ({ slug: p.slug }));
  } catch (error) {
    // Sin conexión a Supabase en build: las rutas se generan bajo demanda.
    return [];
  }
}

function descripcionCorta(property) {
  if (property.metaDescription) return property.metaDescription;
  if (property.gancho) return property.gancho;
  if (property.descripcion) {
    const limpio = property.descripcion.replace(/\s+/g, ' ').trim();
    return limpio.length > 155 ? `${limpio.slice(0, 152)}…` : limpio;
  }
  const ubicacion = [property.colonia, property.municipio].filter(Boolean).join(', ');
  return `${property.titulo}${ubicacion ? ` en ${ubicacion}` : ''}. ${formatPrecio(
    property.precio,
    property.moneda,
    property.mostrarPrecio,
  )}.`;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const supabase = createPublicSupabase();
  const property = await getPropertyBySlug(slug, supabase);

  if (!property) {
    return {
      title: 'Propiedad no encontrada | HeredaBienes',
      description: 'La propiedad que buscas ya no está disponible en nuestro catálogo.',
      robots: { index: false, follow: true },
    };
  }

  const ubicacion = [property.colonia, property.municipio].filter(Boolean).join(', ');
  const precio = formatPrecio(property.precio, property.moneda, property.mostrarPrecio);
  const title = property.metaTitle || `${property.titulo}${ubicacion ? ` — ${ubicacion}` : ''} | ${precio}`;
  const description = descripcionCorta(property);
  const url = urlPublicaPropiedad(property.slug);
  const imagen = property.portadaUrl || property.imagenes?.[0]?.url;

  return {
    title,
    description,
    alternates: { canonical: `/propiedades/${property.slug}` },
    openGraph: {
      type: 'website',
      title,
      description,
      url,
      siteName: 'HEREDABIENES',
      locale: 'es_MX',
      images: imagen
        ? [{ url: imagen, width: 1200, height: 630, alt: property.titulo }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: imagen ? [imagen] : [],
    },
  };
}

export default async function PropiedadDetallePage({ params }) {
  const { slug } = await params;
  const supabase = createPublicSupabase();
  const property = await getPropertyBySlug(slug, supabase);

  if (!property || property.publicado === false) notFound();

  const relacionadas = await listRelatedProperties({
    id: property.id,
    municipio: property.municipio,
    tipoInmueble: property.tipoInmueble,
    limit: 3,
    client: supabase,
  });

  const urlPublica = urlPublicaPropiedad(property.slug);
  const whatsappUrl = urlWhatsAppPropiedad(property, urlPublica);
  const precioTexto = formatPrecio(property.precio, property.moneda, property.mostrarPrecio);

  // Bloque 7: se renderiza solo si al menos una de las cinco listas trae elementos.
  const listas = [
    { titulo: 'Ideal para', items: property.idealPara, icono: Target, variante: 'chips' },
    { titulo: 'Ventajas', items: property.ventajas, icono: Sparkles, variante: 'lista' },
    { titulo: 'Entorno', items: property.entorno, icono: Trees, variante: 'chips' },
    { titulo: 'Estatus legal', items: property.estatusLegal, icono: Landmark, variante: 'lista' },
    { titulo: 'Amenidades y servicios', items: property.amenidades, icono: CheckCircle2, variante: 'chips' },
  ].filter((bloque) => Array.isArray(bloque.items) && bloque.items.filter(Boolean).length > 0);

  return (
    <main className="bg-white pb-24 lg:pb-0">
      <RegistrarVista propertyId={property.id} />
      {/* 1. Galería */}
      <div className="sm:mx-auto sm:max-w-5xl sm:px-6 sm:pt-8 lg:px-8">
        <PropertyGallery
          imagenes={property.imagenes}
          portadaUrl={property.portadaUrl}
          titulo={property.titulo}
        />
      </div>

      <div className="mx-auto max-w-5xl px-0 sm:px-6 lg:px-8">
        {/* 2. Encabezado + acciones */}
        <PropertyHeader property={property} urlPublica={urlPublica} whatsappUrl={whatsappUrl} />

        <div className="px-4 sm:px-0">
          {/* 3. Datos clave */}
          <DatosClave property={property} />

          {/* 4. Highlights */}
          <HighlightsGrid highlights={property.highlights} />

          {/* 5. Descripción */}
          <Descripcion texto={property.descripcion} />

          {/* 6. Medidas y superficie */}
          <MedidasTerreno property={property} />

          {/* 7. Listas de contenido */}
          {listas.length > 0 && (
            <section aria-labelledby="caracteristicas" className="py-8">
              <h2
                id="caracteristicas"
                className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl"
              >
                Características
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {listas.map((bloque) => (
                  <ListaChips
                    key={bloque.titulo}
                    titulo={bloque.titulo}
                    items={bloque.items}
                    icono={bloque.icono}
                    variante={bloque.variante}
                  />
                ))}
              </div>
            </section>
          )}

          {/* 8. Formas de pago */}
          <FormasPago formas={property.formasPago} />

          {/* 9. Mapa */}
          <PropertyMap property={property} />

          {/* 10. Asesor + CTA */}
          <AsesorCard property={property} whatsappUrl={whatsappUrl} />

          {/* 10b. Compartir en redes */}
          <CompartirRedes
            url={urlPublica}
            titulo={property.titulo}
            precioTexto={precioTexto}
            propertyId={property.id}
          />
        </div>
      </div>

      {/* 11. Otras propiedades */}
      <RelatedProperties propiedades={relacionadas} />

      <StickyCTA
        whatsappUrl={whatsappUrl}
        fichaPdfUrl={property.fichaPdfUrl}
        precioTexto={precioTexto}
        property={property}
        urlPublica={urlPublica}
      />
    </main>
  );
}
