'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { TIPOS_INMUEBLE, OPERACIONES } from '../../lib/format';
import { opciones } from '../../lib/opciones';

// Debe coincidir con los valores que acepta listProperties({ orden }) en lib/api/properties.js
// (ver aplicarOrden: usa guion, no guion bajo -> 'precio-asc' | 'precio-desc').
const ORDENES = [
  { value: 'recientes', label: 'Más recientes' },
  { value: 'precio-asc', label: 'Precio: menor a mayor' },
  { value: 'precio-desc', label: 'Precio: mayor a menor' },
];

const CAMPOS = ['tipo', 'operacion', 'municipio', 'precioMin', 'precioMax', 'orden'];

const claseCampo =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-body text-gray-900 ' +
  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30';
const claseLabel = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 font-display';

export default function PropertyFilters({ municipios = [] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [abierto, setAbierto] = useState(false);

  const valorInicial = (campo) => searchParams.get(campo) ?? '';
  const activos = CAMPOS.filter((campo) => searchParams.get(campo)).length;

  const handleSubmit = (event) => {
    event.preventDefault();
    const datos = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    CAMPOS.forEach((campo) => {
      const valor = String(datos.get(campo) ?? '').trim();
      if (valor) params.set(campo, valor);
    });
    const query = params.toString();
    router.push(query ? `/propiedades?${query}` : '/propiedades', { scroll: false });
    setAbierto(false);
  };

  const limpiar = () => {
    router.push('/propiedades', { scroll: false });
    setAbierto(false);
  };

  return (
    <div className="rounded-2xl bg-white p-4 shadow-md sm:p-6">
      {/* Toggle solo en móvil: en pantallas grandes los filtros están siempre visibles */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls="filtros-propiedades"
        className="flex w-full items-center justify-between rounded-xl bg-gray-soft px-4 py-3 text-sm font-semibold font-display text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-primary" aria-hidden="true" />
          Filtrar propiedades
          {activos > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">{activos}</span>
          )}
        </span>
        {abierto ? <X size={18} aria-hidden="true" /> : null}
      </button>

      <form
        id="filtros-propiedades"
        onSubmit={handleSubmit}
        className={`${abierto ? 'block' : 'hidden'} mt-4 lg:mt-0 lg:block`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <label htmlFor="filtro-tipo" className={claseLabel}>Tipo de inmueble</label>
            <select id="filtro-tipo" name="tipo" defaultValue={valorInicial('tipo')} className={claseCampo}>
              <option value="">Todos</option>
              {opciones(TIPOS_INMUEBLE).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-operacion" className={claseLabel}>Operación</label>
            <select id="filtro-operacion" name="operacion" defaultValue={valorInicial('operacion')} className={claseCampo}>
              <option value="">Todas</option>
              {opciones(OPERACIONES).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-municipio" className={claseLabel}>Municipio</label>
            <select id="filtro-municipio" name="municipio" defaultValue={valorInicial('municipio')} className={claseCampo}>
              <option value="">Todos</option>
              {municipios.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="filtro-precio-min" className={claseLabel}>Precio mínimo</label>
            <input
              id="filtro-precio-min"
              name="precioMin"
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              placeholder="0"
              defaultValue={valorInicial('precioMin')}
              className={claseCampo}
            />
          </div>

          <div>
            <label htmlFor="filtro-precio-max" className={claseLabel}>Precio máximo</label>
            <input
              id="filtro-precio-max"
              name="precioMax"
              type="number"
              inputMode="numeric"
              min="0"
              step="100000"
              placeholder="Sin límite"
              defaultValue={valorInicial('precioMax')}
              className={claseCampo}
            />
          </div>

          <div>
            <label htmlFor="filtro-orden" className={claseLabel}>Ordenar por</label>
            <select id="filtro-orden" name="orden" defaultValue={valorInicial('orden')} className={claseCampo}>
              {ORDENES.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" className="btn-primary justify-center">
            <Search size={18} aria-hidden="true" />
            Buscar
          </button>
          {activos > 0 && (
            <button
              type="button"
              onClick={limpiar}
              className="rounded-full px-5 py-3 text-sm font-semibold font-display text-gray-500 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
