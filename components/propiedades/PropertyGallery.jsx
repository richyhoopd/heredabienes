'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';

export default function PropertyGallery({ imagenes = [], portadaUrl, titulo = 'Propiedad' }) {
  const fotos = useMemo(() => {
    const lista = Array.isArray(imagenes) ? [...imagenes] : [];
    lista.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    if (lista.length > 0) return lista;
    if (portadaUrl) return [{ id: 'portada', url: portadaUrl, alt: titulo, orden: 0 }];
    return [];
  }, [imagenes, portadaUrl, titulo]);

  const [activa, setActiva] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const total = fotos.length;

  const siguiente = useCallback(() => setActiva((i) => (i + 1) % total), [total]);
  const anterior = useCallback(() => setActiva((i) => (i - 1 + total) % total), [total]);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowRight') siguiente();
      if (e.key === 'ArrowLeft') anterior();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, siguiente, anterior]);

  if (total === 0) return null;

  const actual = fotos[activa];
  const textoAlt = actual.alt || `${titulo} — imagen ${activa + 1} de ${total}`;

  return (
    <section aria-label="Galería de la propiedad">
      {/* Imagen principal: pantalla completa en móvil, con esquinas redondeadas desde sm */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-soft sm:aspect-[16/10] sm:rounded-2xl">
        <Image
          src={actual.url}
          alt={textoAlt}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 1024px"
          className="object-cover"
        />

        <button
          type="button"
          onClick={() => setLightbox(true)}
          aria-label="Ver imagen en pantalla completa"
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <Expand size={18} aria-hidden="true" />
        </button>

        {total > 1 && (
          <>
            <button
              type="button"
              onClick={anterior}
              aria-label="Imagen anterior"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={siguiente}
              aria-label="Imagen siguiente"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-gray-800 transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <ChevronRight size={20} aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-white font-display">
              {activa + 1} / {total}
            </span>
          </>
        )}
      </div>

      {/* Miniaturas: scroll horizontal en móvil */}
      {total > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:px-0">
          {fotos.map((foto, i) => (
            <li key={foto.id ?? foto.url}>
              <button
                type="button"
                onClick={() => setActiva(i)}
                aria-label={`Ver imagen ${i + 1} de ${total}`}
                aria-current={i === activa}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  i === activa ? 'ring-2 ring-primary' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <Image
                  src={foto.url}
                  alt={foto.alt || `${titulo} — miniatura ${i + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Galería de ${titulo}`}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
        >
          <button
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar galería"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <X size={22} aria-hidden="true" />
          </button>

          <div className="relative h-[75vh] w-full max-w-5xl">
            <Image
              src={actual.url}
              alt={textoAlt}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {total > 1 && (
            <>
              <button
                type="button"
                onClick={anterior}
                aria-label="Imagen anterior"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronLeft size={24} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={siguiente}
                aria-label="Imagen siguiente"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ChevronRight size={24} aria-hidden="true" />
              </button>
              <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-sm text-white font-display">
                {activa + 1} / {total}
              </span>
            </>
          )}
        </div>
      )}
    </section>
  );
}
