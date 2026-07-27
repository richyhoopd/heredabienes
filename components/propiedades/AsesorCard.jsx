import { Mail, MessageCircle, Phone, UserRound } from 'lucide-react';
import { EMAIL_FALLBACK, WHATSAPP_FALLBACK, telefonoAWhatsApp } from '../../lib/whatsapp';
import TrackedLink from '../analytics/TrackedLink';

export default function AsesorCard({ property, whatsappUrl }) {
  const nombre = property?.asesorNombre || 'Equipo HeredaBienes';
  const email = property?.asesorEmail || EMAIL_FALLBACK;
  const telefono = property?.asesorTelefono
    ? telefonoAWhatsApp(property.asesorTelefono)
    : WHATSAPP_FALLBACK;

  return (
    <section aria-labelledby="asesor" className="py-8">
      <h2 id="asesor" className="mb-5 text-xl font-bold text-gray-900 font-display sm:text-2xl">
        ¿Te interesa esta propiedad?
      </h2>

      <div className="overflow-hidden rounded-2xl bg-dark p-6 text-white sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20">
            <UserRound size={26} className="text-primary" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-widest text-gray-400 font-display">
              Tu asesor
            </p>
            <p className="text-lg font-bold text-white font-display">{nombre}</p>
          </div>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-gray-300 font-body">
          Resolvemos dudas de precio, documentación y agenda de visita. Todas nuestras propiedades
          pasan por revisión legal antes de publicarse.
        </p>

        <div className="flex flex-col gap-3">
          <TrackedLink
            evento="whatsapp"
            propertyId={property?.id}
            detalle="asesor"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-green-600 px-6 py-3.5 text-sm font-semibold font-display text-white transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <MessageCircle size={18} aria-hidden="true" />
            Escribir por WhatsApp
          </TrackedLink>
          <TrackedLink
            evento="llamada"
            propertyId={property?.id}
            href={`tel:+${telefono}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/30 px-6 py-3.5 text-sm font-semibold font-display text-white transition-colors hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Phone size={18} aria-hidden="true" />
            Llamar ahora
          </TrackedLink>
          <TrackedLink
            evento="email"
            propertyId={property?.id}
            href={`mailto:${email}?subject=${encodeURIComponent(`Interés en: ${property?.titulo ?? 'propiedad'}`)}`}
            className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold font-display text-gray-300 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <Mail size={18} aria-hidden="true" />
            {email}
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
