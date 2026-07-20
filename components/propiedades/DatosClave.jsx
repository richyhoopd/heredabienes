import {
  Bath,
  BedDouble,
  Building2,
  CalendarClock,
  Car,
  Home,
  Layers,
  Maximize2,
  Ruler,
  Tag,
} from 'lucide-react';
import { formatSuperficie, TIPOS_INMUEBLE, OPERACIONES } from '../../lib/format';
import { etiqueta } from '../../lib/opciones';

export default function DatosClave({ property }) {
  if (!property) return null;

  const datos = [];

  if (property.superficieTerrenoM2) {
    datos.push({ icono: Maximize2, label: 'Terreno', valor: formatSuperficie(property.superficieTerrenoM2) });
  }
  if (property.superficieConstruccionM2) {
    datos.push({ icono: Ruler, label: 'Construcción', valor: formatSuperficie(property.superficieConstruccionM2) });
  }
  if (property.tipoInmueble) {
    datos.push({ icono: Building2, label: 'Tipo', valor: etiqueta(TIPOS_INMUEBLE, property.tipoInmueble) });
  }
  if (property.operacion) {
    datos.push({ icono: Tag, label: 'Operación', valor: etiqueta(OPERACIONES, property.operacion) });
  }
  if (property.recamaras) {
    datos.push({ icono: BedDouble, label: 'Recámaras', valor: String(property.recamaras) });
  }
  if (property.banos || property.mediosBanos) {
    const partes = [];
    if (property.banos) partes.push(`${property.banos} completo${property.banos > 1 ? 's' : ''}`);
    if (property.mediosBanos) partes.push(`${property.mediosBanos} medio${property.mediosBanos > 1 ? 's' : ''}`);
    datos.push({ icono: Bath, label: 'Baños', valor: partes.join(' · ') });
  }
  if (property.estacionamientos) {
    datos.push({ icono: Car, label: 'Estacionamientos', valor: String(property.estacionamientos) });
  }
  if (property.niveles) {
    datos.push({ icono: Layers, label: 'Niveles', valor: String(property.niveles) });
  }
  if (property.antiguedadAnios) {
    datos.push({
      icono: CalendarClock,
      label: 'Antigüedad',
      valor: `${property.antiguedadAnios} año${property.antiguedadAnios > 1 ? 's' : ''}`,
    });
  }

  if (datos.length === 0) return null;

  return (
    <section aria-labelledby="datos-clave" className="py-8">
      <h2 id="datos-clave" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        Datos clave
      </h2>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {datos.map((dato) => {
          const Icono = dato.icono ?? Home;
          return (
            <div
              key={dato.label}
              className="rounded-2xl bg-gray-soft p-4 text-center sm:text-left"
            >
              <Icono size={22} className="mx-auto mb-2 text-primary sm:mx-0" aria-hidden="true" />
              <dt className="text-xs uppercase tracking-wide text-gray-400 font-display">{dato.label}</dt>
              <dd className="mt-0.5 text-sm font-bold text-gray-900 font-display sm:text-base">{dato.valor}</dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}
