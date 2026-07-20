import { TIPOS_INMUEBLE, OPERACIONES } from '../../lib/format';
import { etiqueta } from '../../lib/opciones';

export default function TipoBadge({ tipo, operacion }) {
  if (!tipo && !operacion) return null;

  const texto = [
    tipo ? etiqueta(TIPOS_INMUEBLE, tipo) : '',
    operacion ? `en ${etiqueta(OPERACIONES, operacion).toLowerCase()}` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className="inline-flex items-center rounded-full bg-primary-light px-3 py-1 text-xs font-semibold font-display text-primary-dark">
      {texto}
    </span>
  );
}
