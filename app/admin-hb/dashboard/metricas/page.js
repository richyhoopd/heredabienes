'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { listEventCounts } from '@/lib/api/eventos';
import { listProperties } from '@/lib/api/properties';

// Columnas de la tabla, en orden. 'vista' además muestra únicos.
const COLUMNAS = [
  { evento: 'vista', etiqueta: 'Vistas' },
  { evento: 'click_card', etiqueta: 'Clicks tarjeta' },
  { evento: 'whatsapp', etiqueta: 'WhatsApp' },
  { evento: 'compartir', etiqueta: 'Compartidos' },
  { evento: 'descarga_ficha', etiqueta: 'Fichas' },
  { evento: 'llamada', etiqueta: 'Llamadas' },
  { evento: 'email', etiqueta: 'Emails' },
];

export default function MetricasPage() {
  const [conteos, setConteos] = useState([]);
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [counts, props] = await Promise.all([
          listEventCounts(),
          listProperties({ includeUnpublished: true }),
        ]);
        setConteos(Array.isArray(counts) ? counts : []);
        setPropiedades(Array.isArray(props) ? props : []);
      } catch (err) {
        setError(
          err?.message?.includes('property_event_counts')
            ? 'Faltan las tablas de métricas: corre supabase/migracion-eventos-solicitudes.sql en el SQL Editor.'
            : err?.message || 'No se pudieron cargar las métricas.',
        );
      }
      setCargando(false);
    })();
  }, []);

  // { propertyId: { evento: {total, unicos} } }
  const porPropiedad = useMemo(() => {
    const mapa = {};
    for (const fila of conteos) {
      const clave = fila.property_id || 'sin_propiedad';
      mapa[clave] = mapa[clave] || {};
      mapa[clave][fila.evento] = { total: fila.total, unicos: fila.unicos };
    }
    return mapa;
  }, [conteos]);

  const totales = useMemo(() => {
    const t = {};
    for (const fila of conteos) {
      t[fila.evento] = (t[fila.evento] || 0) + Number(fila.total || 0);
    }
    return t;
  }, [conteos]);

  // Propiedades ordenadas por vistas desc; las que no tienen eventos al final.
  const filas = useMemo(() => {
    const valor = (p) => Number(porPropiedad[p.id]?.vista?.total || 0);
    return [...propiedades].sort((a, b) => valor(b) - valor(a));
  }, [propiedades, porPropiedad]);

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando métricas…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-dark">Métricas del catálogo</h1>
          <p className="mt-1 text-sm text-gray-500">
            Interacciones del público con cada propiedad. Las vistas cuentan una vez por sesión.
          </p>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : (
        <>
          {/* Totales */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
            {COLUMNAS.map(({ evento, etiqueta }) => (
              <div key={evento} className="rounded-xl border border-gray-100 bg-white p-4">
                <p className="text-xs uppercase tracking-wide text-gray-400">{etiqueta}</p>
                <p className="mt-1 font-display text-2xl font-bold text-dark">
                  {totales[evento] || 0}
                </p>
              </div>
            ))}
          </div>

          {/* Tabla por propiedad */}
          <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white">
            <table className="w-full min-w-[860px] text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3 font-medium">Propiedad</th>
                  <th className="px-4 py-3 text-right font-medium">Vistas</th>
                  <th className="px-4 py-3 text-right font-medium">Únicos</th>
                  {COLUMNAS.slice(1).map(({ evento, etiqueta }) => (
                    <th key={evento} className="px-4 py-3 text-right font-medium">
                      {etiqueta}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filas.length === 0 ? (
                  <tr>
                    <td colSpan={COLUMNAS.length + 2} className="px-4 py-10 text-center text-gray-500">
                      Aún no hay propiedades.
                    </td>
                  </tr>
                ) : (
                  filas.map((p) => {
                    const m = porPropiedad[p.id] || {};
                    return (
                      <tr key={p.id} className="border-b border-gray-50 last:border-0">
                        <td className="max-w-[320px] px-4 py-3">
                          <Link
                            href={`/propiedades/${p.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1.5 font-medium text-dark hover:text-primary hover:underline"
                          >
                            <span className="line-clamp-1">{p.titulo}</span>
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          </Link>
                          {!p.publicado && (
                            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-gray-500">
                              Borrador
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-dark">
                          {m.vista?.total || 0}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-600">
                          {m.vista?.unicos || 0}
                        </td>
                        {COLUMNAS.slice(1).map(({ evento }) => (
                          <td key={evento} className="px-4 py-3 text-right text-gray-600">
                            {m[evento]?.total || 0}
                          </td>
                        ))}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </main>
  );
}
