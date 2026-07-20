/**
 * Normaliza las constantes de lib/format.js a una forma única {value, label}.
 * Acepta tanto string[] como {value,label}[] para no acoplarse a la fase 2.
 */

function capitalizar(texto) {
  const limpio = String(texto ?? '').replace(/[_-]/g, ' ').trim();
  if (!limpio) return '';
  return limpio.charAt(0).toUpperCase() + limpio.slice(1);
}

export function opciones(lista) {
  if (!Array.isArray(lista)) return [];
  return lista.map((item) => {
    if (item && typeof item === 'object') {
      return { value: item.value ?? item.id ?? '', label: item.label ?? capitalizar(item.value ?? '') };
    }
    return { value: item, label: capitalizar(item) };
  });
}

export function etiqueta(lista, value) {
  if (!value) return '';
  const encontrada = opciones(lista).find((o) => o.value === value);
  return encontrada ? encontrada.label : capitalizar(value);
}
