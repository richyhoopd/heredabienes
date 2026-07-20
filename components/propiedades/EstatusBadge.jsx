const ESTILOS = {
  disponible: { label: 'Disponible', clase: 'bg-green-100 text-green-700 ring-green-200' },
  apartado: { label: 'Apartado', clase: 'bg-amber-100 text-amber-700 ring-amber-200' },
  vendido: { label: 'Vendido', clase: 'bg-gray-200 text-gray-600 ring-gray-300' },
  pausado: { label: 'Pausado', clase: 'bg-gray-200 text-gray-600 ring-gray-300' },
};

export default function EstatusBadge({ estatus, size = 'sm' }) {
  const config = ESTILOS[estatus];
  if (!config) return null;

  const dimension = size === 'md' ? 'text-sm px-3.5 py-1.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold font-display ring-1 ${config.clase} ${dimension}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {config.label}
    </span>
  );
}
