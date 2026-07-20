'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import DescargarFichaButton from './DescargarFichaButton';

// `property`/`urlPublica` son opcionales: si la página de detalle no los pasa
// (wiring pendiente), se reconstruye un objeto mínimo a partir de
// `fichaPdfUrl` para no cambiar el comportamiento actual (enlace directo o
// nada). Cuando estén disponibles, la barra fija también podrá generar la
// ficha al vuelo, igual que el botón del encabezado.
export default function StickyCTA({ whatsappUrl, fichaPdfUrl, precioTexto, property, urlPublica }) {
  const [visible, setVisible] = useState(false);
  const propiedadFicha = property || (fichaPdfUrl ? { fichaPdfUrl } : null);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 px-4 py-3 shadow-[0_-4px_20px_rgba(10,22,40,0.08)] backdrop-blur-md transition-transform duration-300 lg:hidden ${
        visible ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] uppercase tracking-wide text-gray-400 font-display">Precio</p>
          <p className="truncate text-base font-extrabold text-primary font-display">{precioTexto}</p>
        </div>

        {propiedadFicha ? (
          <DescargarFichaButton property={propiedadFicha} urlPublica={urlPublica} variant="icon" />
        ) : null}

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-green-600 px-5 py-3 text-sm font-semibold font-display text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600"
        >
          <MessageCircle size={18} aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
