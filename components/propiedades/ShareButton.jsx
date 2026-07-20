'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

export default function ShareButton({ url, titulo, texto = '', className = '' }) {
  const [copiado, setCopiado] = useState(false);

  const compartir = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: titulo, text: texto || titulo, url });
        return;
      } catch (error) {
        if (error?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      // Sin prompt() por restricción global: si el portapapeles también falla,
      // no queda feedback adicional (caso extremo de navegadores sin Web Share ni Clipboard API).
    }
  };

  return (
    <button
      type="button"
      onClick={compartir}
      aria-live="polite"
      className={`inline-flex items-center justify-center gap-2 rounded-full border-2 border-gray-200 px-6 py-3 text-sm font-semibold font-display text-gray-700 transition-colors hover:border-primary hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${className}`}
    >
      {copiado ? <Check size={18} aria-hidden="true" /> : <Share2 size={18} aria-hidden="true" />}
      {copiado ? '¡Link copiado!' : 'Compartir'}
    </button>
  );
}
