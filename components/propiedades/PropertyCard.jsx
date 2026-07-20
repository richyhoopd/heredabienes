import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Maximize2 } from 'lucide-react';
import { formatPrecio, formatSuperficie } from '../../lib/format';
import EstatusBadge from './EstatusBadge';
import TipoBadge from './TipoBadge';

export default function PropertyCard({ property, priority = false }) {
  if (!property) return null;

  const ubicacion = [property.colonia, property.municipio].filter(Boolean).join(', ');
  const superficie = property.superficieTerrenoM2 || property.superficieConstruccionM2;
  const noDisponible = property.estatus === 'vendido' || property.estatus === 'apartado';

  return (
    <Link
      href={`/propiedades/${property.slug}`}
      className="card group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-soft">
        {property.portadaUrl ? (
          <Image
            src={property.portadaUrl}
            alt={`Portada de ${property.titulo}`}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              noDisponible ? 'grayscale-[35%]' : ''
            }`}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-gray-400 font-body">
            Sin fotografía
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold font-display text-primary-dark shadow-sm">
            <TipoBadge tipo={property.tipoInmueble} operacion={property.operacion} />
          </span>
        </div>

        {noDisponible && (
          <div className="absolute right-3 top-3">
            <EstatusBadge estatus={property.estatus} />
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="mb-1.5 line-clamp-2 text-lg font-bold font-display text-gray-900 transition-colors group-hover:text-primary">
          {property.titulo}
        </h3>

        {ubicacion && (
          <p className="mb-3 flex items-center gap-1.5 text-sm text-gray-500 font-body">
            <MapPin size={14} className="shrink-0 text-primary" aria-hidden="true" />
            <span className="line-clamp-1">{ubicacion}</span>
          </p>
        )}

        <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-gray-100 pt-3">
          <span className="text-xl font-extrabold font-display text-primary">
            {formatPrecio(property.precio, property.moneda, property.mostrarPrecio)}
          </span>
          {superficie ? (
            <span className="flex items-center gap-1.5 text-sm text-gray-500 font-body">
              <Maximize2 size={14} className="text-gray-400" aria-hidden="true" />
              {formatSuperficie(superficie)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
