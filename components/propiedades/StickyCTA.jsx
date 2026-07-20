'use client';

import { useEffect, useState } from 'react';
import { Download, MessageCircle } from 'lucide-react';

export default function StickyCTA({ whatsappUrl, fichaPdfUrl, precioTexto }) {
  const [visible, setVisible] = useState(false);

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

        {fichaPdfUrl ? (
          <a
            href={fichaPdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Descargar ficha PDF"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Download size={20} aria-hidden="true" />
          </a>
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
