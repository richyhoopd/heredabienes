'use client';

import { useEffect, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Trash2,
} from 'lucide-react';
import { deleteSolicitud, listSolicitudes, ETIQUETAS_EXPERIENCIA } from '@/lib/api/solicitudes';
import { telefonoAWhatsApp } from '@/lib/whatsapp';

function formatFecha(iso) {
  try {
    return new Date(iso).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [porConfirmar, setPorConfirmar] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      setSolicitudes(await listSolicitudes());
    } catch (err) {
      setError(
        err?.message?.includes('solicitudes_asesores')
          ? 'Falta la tabla de solicitudes: corre supabase/migracion-eventos-solicitudes.sql en el SQL Editor.'
          : err?.message || 'No se pudieron cargar las solicitudes.',
      );
    }
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const eliminar = async (id) => {
    setOcupado(id);
    try {
      await deleteSolicitud(id);
      setPorConfirmar(null);
      await cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar.');
    }
    setOcupado(null);
  };

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando solicitudes…
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-dark">
          Solicitudes de asesores
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Enviadas desde la página pública “Trabaja con nosotros”.
        </p>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          {error}
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white px-6 py-16 text-center text-gray-500">
          Aún no hay solicitudes.
        </div>
      ) : (
        <ul className="space-y-4">
          {solicitudes.map((s) => (
            <li key={s.id} className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold text-dark">{s.nombre}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{formatFecha(s.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {s.experiencia ? (
                    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-semibold text-primary-dark">
                      {ETIQUETAS_EXPERIENCIA[s.experiencia] || s.experiencia}
                    </span>
                  ) : null}
                  {porConfirmar === s.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        onClick={() => eliminar(s.id)}
                        disabled={ocupado === s.id}
                        className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                      >
                        {ocupado === s.id ? 'Eliminando…' : 'Confirmar'}
                      </button>
                      <button
                        onClick={() => setPorConfirmar(null)}
                        className="text-xs text-gray-500 hover:text-dark"
                      >
                        Cancelar
                      </button>
                    </span>
                  ) : (
                    <button
                      onClick={() => setPorConfirmar(s.id)}
                      aria-label={`Eliminar solicitud de ${s.nombre}`}
                      className="text-gray-400 transition-colors hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <a
                  href={`https://wa.me/${telefonoAWhatsApp(s.telefono)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-medium text-dark hover:text-primary hover:underline"
                >
                  <MessageCircle className="h-4 w-4 text-gray-500" />
                  {s.telefono}
                </a>
                {s.email ? (
                  <a
                    href={`mailto:${s.email}`}
                    className="inline-flex items-center gap-1.5 text-gray-700 hover:text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4 text-gray-500" />
                    {s.email}
                  </a>
                ) : null}
                {s.ciudad ? (
                  <span className="inline-flex items-center gap-1.5 text-gray-700">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {s.ciudad}
                  </span>
                ) : null}
              </div>

              {s.mensaje ? (
                <p className="mt-4 whitespace-pre-line rounded-xl bg-gray-soft p-4 text-sm leading-relaxed text-gray-700">
                  {s.mensaje}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
