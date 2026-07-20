'use client';

import { useState } from 'react';
import { AlertTriangle, Download, Loader2 } from 'lucide-react';

// Botón "Descargar ficha": si la propiedad ya tiene un PDF subido a mano
// (property.fichaPdfUrl), enlaza directo a ese archivo (comportamiento
// original, intacto). Si no, genera el PDF al vuelo en el navegador con
// @react-pdf/renderer, cargado de forma diferida para no engordar el bundle
// de la ficha (import() solo ocurre al hacer click).
export default function DescargarFichaButton({ property, urlPublica, variant = 'full' }) {
  const [estado, setEstado] = useState('idle'); // idle | generando | error

  if (property?.fichaPdfUrl) {
    return variant === 'icon' ? (
      <a
        href={property.fichaPdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Descargar ficha PDF"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Download size={20} aria-hidden="true" />
      </a>
    ) : (
      <a
        href={property.fichaPdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold font-display text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <Download size={18} aria-hidden="true" />
        Descargar ficha PDF
      </a>
    );
  }

  const generar = async () => {
    if (estado === 'generando') return;
    setEstado('generando');
    try {
      const { descargarFichaPdf } = await import('../../lib/pdf/generarFichaPdf');
      await descargarFichaPdf(property, urlPublica);
      setEstado('idle');
    } catch (error) {
      setEstado('error');
    }
  };

  const Icono = estado === 'generando' ? Loader2 : estado === 'error' ? AlertTriangle : Download;

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={generar}
        disabled={estado === 'generando'}
        aria-label={
          estado === 'generando'
            ? 'Generando ficha PDF'
            : estado === 'error'
              ? 'No se pudo generar la ficha, reintentar'
              : 'Descargar ficha PDF'
        }
        aria-live="polite"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60"
      >
        <Icono size={20} className={estado === 'generando' ? 'animate-spin' : ''} aria-hidden="true" />
      </button>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <button
        type="button"
        onClick={generar}
        disabled={estado === 'generando'}
        aria-live="polite"
        className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-6 py-3 text-sm font-semibold font-display text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-transparent disabled:hover:text-primary"
      >
        <Icono size={18} className={estado === 'generando' ? 'animate-spin' : ''} aria-hidden="true" />
        {estado === 'generando'
          ? 'Generando ficha…'
          : estado === 'error'
            ? 'Reintentar descarga'
            : 'Descargar ficha'}
      </button>
      {estado === 'error' ? (
        <p className="text-xs text-red-600 font-body">
          No se pudo generar el PDF. Intenta de nuevo.
        </p>
      ) : null}
    </div>
  );
}
