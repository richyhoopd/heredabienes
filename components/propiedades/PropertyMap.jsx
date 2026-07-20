import { Info, MapPin } from 'lucide-react';

export default function PropertyMap({ property }) {
  if (!property) return null;

  const exacta = property.mostrarDireccionExacta !== false;
  const tieneCoords = property.lat != null && property.lng != null;

  const zonaTexto = [property.colonia, property.municipio, property.estado].filter(Boolean).join(', ');
  const direccionTexto = [
    [property.calle, property.numeroExterior].filter(Boolean).join(' '),
    property.colonia,
    property.municipio,
    property.estado,
    property.cp,
  ]
    .filter(Boolean)
    .join(', ');

  let consulta = '';
  let zoom = 15;

  if (exacta && tieneCoords) {
    consulta = `${property.lat},${property.lng}`;
    zoom = 17;
  } else if (exacta && direccionTexto) {
    consulta = direccionTexto;
    zoom = 17;
  } else if (zonaTexto) {
    consulta = zonaTexto;
    zoom = 14;
  }

  if (!consulta) return null;

  const src = `https://www.google.com/maps?q=${encodeURIComponent(consulta)}&z=${zoom}&hl=es&output=embed`;

  return (
    <section aria-labelledby="mapa" className="py-8">
      <h2 id="mapa" className="mb-2 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Ubicación
      </h2>

      <p className="mb-4 flex items-start gap-2 text-sm text-gray-600 font-body">
        <MapPin size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
        <span>{exacta ? direccionTexto || zonaTexto : zonaTexto}</span>
      </p>

      <div className="overflow-hidden rounded-2xl shadow-md">
        <iframe
          title={`Mapa de ${property.titulo}`}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-64 w-full border-0 sm:h-96"
          allowFullScreen
        />
      </div>

      {!exacta && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-gray-soft px-4 py-3 text-sm text-gray-500 font-body">
          <Info size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          Por privacidad del propietario, el mapa muestra la zona aproximada. La dirección exacta se
          comparte al agendar una visita.
        </p>
      )}
    </section>
  );
}
