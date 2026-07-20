import { Download, MapPin, MessageCircle } from 'lucide-react';
import { formatPrecio } from '../../lib/format';
import EstatusBadge from './EstatusBadge';
import TipoBadge from './TipoBadge';
import ShareButton from './ShareButton';

export default function PropertyHeader({ property, urlPublica, whatsappUrl }) {
  const direccion = property.mostrarDireccionExacta
    ? [
        [property.calle, property.numeroExterior].filter(Boolean).join(' '),
        property.numeroInterior ? `Int. ${property.numeroInterior}` : '',
        property.colonia,
        property.municipio,
        property.estado,
      ]
        .filter(Boolean)
        .join(', ')
    : [property.colonia, property.municipio, property.estado].filter(Boolean).join(', ');

  return (
    <header className="border-b border-gray-100 bg-white px-4 py-6 sm:px-0 sm:py-8">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <TipoBadge tipo={property.tipoInmueble} operacion={property.operacion} />
        <EstatusBadge estatus={property.estatus} size="md" />
      </div>

      <h1 className="mb-2 text-2xl font-extrabold leading-tight text-gray-900 font-display sm:text-3xl lg:text-4xl">
        {property.titulo}
      </h1>

      {property.gancho ? (
        <p className="mb-3 text-base text-gray-500 font-body sm:text-lg">{property.gancho}</p>
      ) : null}

      {direccion ? (
        <p className="mb-5 flex items-start gap-2 text-sm text-gray-600 font-body sm:text-base">
          <MapPin size={18} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <span>{direccion}</span>
        </p>
      ) : null}

      <div className="mb-6">
        <p className="text-3xl font-extrabold text-primary font-display sm:text-4xl">
          {formatPrecio(property.precio, property.moneda, property.mostrarPrecio)}
        </p>
        {property.precioNota ? (
          <p className="mt-1 text-sm font-semibold text-green-600 font-body">{property.precioNota}</p>
        ) : null}
      </div>

      {/* Acciones: en móvil se repiten en la StickyCTA del fondo */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3 text-sm font-semibold font-display text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        >
          <MessageCircle size={18} aria-hidden="true" />
          Preguntar por WhatsApp
        </a>

        {property.fichaPdfUrl ? (
          <a
            href={property.fichaPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold font-display text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Download size={18} aria-hidden="true" />
            Descargar ficha PDF
          </a>
        ) : null}

        <ShareButton
          url={urlPublica}
          titulo={property.titulo}
          texto={property.gancho || property.titulo}
        />
      </div>
    </header>
  );
}
