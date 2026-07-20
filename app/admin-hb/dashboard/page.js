'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Pencil,
  Copy,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { listProperties, deleteProperty, duplicateProperty } from '@/lib/api/properties';
import { formatPrecio } from '@/lib/format';

const COLOR_ESTATUS = {
  disponible: 'bg-green-50 text-green-700 border-green-200',
  apartado: 'bg-amber-50 text-amber-700 border-amber-200',
  vendido: 'bg-gray-100 text-gray-600 border-gray-200',
  pausado: 'bg-red-50 text-red-600 border-red-200',
};

export default function DashboardPropiedades() {
  const router = useRouter();
  const [propiedades, setPropiedades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [porConfirmar, setPorConfirmar] = useState(null);
  const [ocupado, setOcupado] = useState(null);

  // Sin cliente inyectado a propósito: en el navegador listProperties usa el
  // cliente de Supabase del navegador, que sí lleva la cookie de sesión y por
  // lo tanto pasa RLS para ver propiedades no publicadas.
  const cargar = async () => {
    setCargando(true);
    setError('');
    try {
      const datos = await listProperties({ includeUnpublished: true });
      setPropiedades(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(err?.message || 'No se pudieron cargar las propiedades.');
    }
    setCargando(false);
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return propiedades;
    return propiedades.filter((p) =>
      [p.titulo, p.colonia].filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [propiedades, busqueda]);

  const duplicar = async (id) => {
    setOcupado(id);
    try {
      const copia = await duplicateProperty(id);
      await cargar();
      if (copia?.id) router.push(`/admin-hb/dashboard/${copia.id}`);
    } catch (err) {
      setError(err?.message || 'No se pudo duplicar.');
    }
    setOcupado(null);
  };

  const eliminar = async (id) => {
    setOcupado(id);
    try {
      await deleteProperty(id);
      setPorConfirmar(null);
      await cargar();
    } catch (err) {
      setError(err?.message || 'No se pudo eliminar.');
    }
    setOcupado(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold font-display text-dark">Propiedades</h1>
          <p className="text-sm text-gray-500">
            {propiedades.length} en total ·{' '}
            {propiedades.filter((p) => p.publicado).length} publicadas
          </p>
        </div>
        <Link href="/admin-hb/dashboard/nueva" className="btn-primary">
          <Plus className="w-4 h-4" /> Nueva propiedad
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por título o colonia…"
          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="py-20 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">
            {busqueda
              ? 'Ninguna propiedad coincide con la búsqueda.'
              : 'Todavía no hay propiedades. Crea la primera.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-md overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-soft text-gray-500 text-left">
              <tr>
                <th className="px-4 py-3 font-semibold">Título</th>
                <th className="px-4 py-3 font-semibold">Ubicación</th>
                <th className="px-4 py-3 font-semibold">Precio</th>
                <th className="px-4 py-3 font-semibold">Estatus</th>
                <th className="px-4 py-3 font-semibold">Visibilidad</th>
                <th className="px-4 py-3 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtradas.map((p) => (
                <tr key={p.id} className="hover:bg-gray-soft/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-dark">{p.titulo}</div>
                    <div className="text-xs text-gray-400">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {[p.colonia, p.municipio].filter(Boolean).join(', ') || '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {p.precio ? formatPrecio(p.precio, p.moneda) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full border text-xs font-semibold capitalize ${
                        COLOR_ESTATUS[p.estatus] || COLOR_ESTATUS.pausado
                      }`}
                    >
                      {p.estatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.publicado ? (
                      <span className="inline-flex items-center gap-1 text-green-700 text-xs font-semibold">
                        <Eye className="w-3.5 h-3.5" /> Publicada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-semibold">
                        <EyeOff className="w-3.5 h-3.5" /> Borrador
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {porConfirmar === p.id ? (
                        <>
                          <button
                            onClick={() => eliminar(p.id)}
                            disabled={ocupado === p.id}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold disabled:opacity-60"
                          >
                            {ocupado === p.id ? 'Eliminando…' : 'Confirmar'}
                          </button>
                          <button
                            onClick={() => setPorConfirmar(null)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs"
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <Link
                            href={`/admin-hb/dashboard/${p.id}`}
                            title="Editar"
                            className="p-2 rounded-lg hover:bg-primary-light text-gray-500 hover:text-primary"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => duplicar(p.id)}
                            disabled={ocupado === p.id}
                            title="Duplicar"
                            className="p-2 rounded-lg hover:bg-primary-light text-gray-500 hover:text-primary disabled:opacity-50"
                          >
                            {ocupado === p.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => setPorConfirmar(p.id)}
                            title="Eliminar"
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
