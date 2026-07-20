"use client";

import { Plus, Trash2, Wand2 } from "lucide-react";
import { ICONOS_HIGHLIGHT, getIcono } from "@/lib/admin/iconos";

const MAX = 4;

export default function EditorHighlights({
  valores = [],
  onChange,
  presets = [],
  error,
}) {
  const actualizar = (indice, campo, valor) => {
    const copia = valores.map((h, i) =>
      i === indice ? { ...h, [campo]: valor } : h
    );
    onChange(copia);
  };

  const agregar = () => {
    if (valores.length >= MAX) return;
    onChange([...valores, { icono: "sparkles", titulo: "", texto: "" }]);
  };

  const quitar = (indice) => {
    onChange(valores.filter((_, i) => i !== indice));
  };

  const usarPresets = () => {
    onChange(presets.slice(0, MAX).map((h) => ({ ...h })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700">
          Highlights ({valores.length}/{MAX})
        </span>
        {presets.length > 0 && valores.length === 0 && (
          <button
            type="button"
            onClick={usarPresets}
            className="text-xs text-primary font-semibold inline-flex items-center gap-1 hover:underline"
          >
            <Wand2 className="w-3.5 h-3.5" /> Usar los sugeridos
          </button>
        )}
      </div>

      <div className="space-y-3">
        {valores.map((h, i) => {
          const Icono = getIcono(h.icono);
          return (
            <div
              key={i}
              className="border border-gray-200 rounded-xl p-3 bg-gray-soft/50"
            >
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                  <Icono className="w-5 h-5 text-primary" />
                </span>
                <div className="flex-1 space-y-2">
                  <input
                    value={h.titulo ?? ""}
                    placeholder="Título (ej. Zona Premium)"
                    onChange={(e) => actualizar(i, "titulo", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <input
                    value={h.texto ?? ""}
                    placeholder="Texto corto (ej. Colonia Seattle, Zapopan)"
                    onChange={(e) => actualizar(i, "texto", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  <select
                    value={h.icono ?? "sparkles"}
                    onChange={(e) => actualizar(i, "icono", e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {ICONOS_HIGHLIGHT.map((op) => (
                      <option key={op.valor} value={op.valor}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label="Quitar highlight"
                  className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {valores.length < MAX && (
        <button
          type="button"
          onClick={agregar}
          className="mt-3 w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-primary hover:text-primary inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Agregar highlight
        </button>
      )}

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
