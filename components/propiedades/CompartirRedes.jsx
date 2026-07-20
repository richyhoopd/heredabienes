'use client';

import { useState } from 'react';
import { Check, Copy, MessageCircle } from 'lucide-react';

// lucide-react 1.x ya no incluye iconos de marca, así que los logos van inline.
function IconoFacebook(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={18} height={18} {...props}>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.96.93-1.96 1.89v2.26h3.33l-.53 3.49h-2.8V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  );
}

function IconoX(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} {...props}>
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.59l5.24 6.93zm-1.29 19.5h2.04L6.49 3.24H4.3z" />
    </svg>
  );
}

// Botones explícitos por red social.
//
// Complementa a ShareButton (Web Share API), que en celular abre el menú nativo
// pero en escritorio solo copia el link. Aquí las redes están visibles siempre,
// que es lo que el asesor necesita para publicar desde la computadora.
//
// Instagram y TikTok no aparecen: no tienen URL de compartir desde web (su API
// exige app nativa). Para esas, la ruta real es copiar el link o descargar la
// imagen, y para eso está el botón de copiar.
export default function CompartirRedes({ url, titulo, precioTexto }) {
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState(false);

  if (!url) return null;

  const texto = [titulo, precioTexto].filter(Boolean).join(' — ');
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(texto);

  const redes = [
    {
      nombre: 'WhatsApp',
      Icono: MessageCircle,
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${texto}\n${url}`)}`,
      clase: 'bg-[#25D366] hover:bg-[#1da851] text-white',
    },
    {
      nombre: 'Facebook',
      Icono: IconoFacebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      clase: 'bg-[#1877F2] hover:bg-[#0f5fd0] text-white',
    },
    {
      nombre: 'X',
      Icono: IconoX,
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      clase: 'bg-dark hover:bg-black text-white',
    },
  ];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setError(false);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
      <h3 className="mb-1 font-display text-base font-bold text-gray-900">
        Comparte esta propiedad
      </h3>
      <p className="mb-4 font-body text-sm text-gray-500">
        El link abre la ficha completa con fotos, medidas y contacto.
      </p>

      <div className="flex flex-wrap gap-2">
        {redes.map(({ nombre, Icono, href, clase }) => (
          <a
            key={nombre}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Compartir en ${nombre}`}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 py-2.5 font-display text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${clase}`}
          >
            <Icono size={18} aria-hidden="true" />
            {nombre}
          </a>
        ))}

        <button
          type="button"
          onClick={copiar}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-gray-300 px-5 py-2.5 font-display text-sm font-semibold text-gray-700 transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          {copiado ? (
            <>
              <Check size={18} aria-hidden="true" />
              Copiado
            </>
          ) : (
            <>
              <Copy size={18} aria-hidden="true" />
              Copiar link
            </>
          )}
        </button>
      </div>

      {error ? (
        <p className="mt-3 font-body text-sm text-gray-600" role="status">
          No se pudo copiar automáticamente. El link es:{' '}
          <span className="break-all font-medium text-primary">{url}</span>
        </p>
      ) : null}
    </div>
  );
}
