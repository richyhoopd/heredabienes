"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

export default function ChipsPresets({
  label,
  valores = [],
  presets = [],
  onChange,
  ayuda,
  placeholder = "Agregar…",
}) {
  const [texto, setTexto] = useState("");

  const agregar = (valor) => {
    const limpio = String(valor || "").trim();
    if (!limpio) return;
    const yaEsta = valores.some(
      (v) => v.toLowerCase() === limpio.toLowerCase()
    );
    if (yaEsta) return;
    onChange([...valores, limpio]);
  };

  const quitar = (valor) => {
    onChange(valores.filter((v) => v !== valor));
  };

  const sugerencias = presets.filter(
    (p) => !valores.some((v) => v.toLowerCase() === p.toLowerCase())
  );

  return (
    <div>
      <span className="block text-sm font-semibold text-gray-700 mb-2">{label}</span>

      <div className="flex flex-wrap gap-2 mb-3 min-h-[2rem]">
        {valores.length === 0 && (
          <span className="text-xs text-gray-400 py-1">Sin elementos todavía</span>
        )}
        {valores.map((v) => (
          <span
            key={v}
            className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold pl-3 pr-1.5 py-1.5 rounded-full"
          >
            {v}
            <button
              type="button"
              onClick={() => quitar(v)}
              aria-label={`Quitar ${v}`}
              className="rounded-full hover:bg-white/25 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {sugerencias.length > 0 && (
        <div className="mb-3">
          <span className="block text-xs text-gray-400 mb-1.5">Sugerencias</span>
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => agregar(p)}
                className="inline-flex items-center gap-1 border border-dashed border-gray-300 text-gray-600 text-xs px-3 py-1.5 rounded-full hover:border-primary hover:text-primary"
              >
                <Plus className="w-3 h-3" /> {p}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <input
          value={texto}
          placeholder={placeholder}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              agregar(texto);
              setTexto("");
            }
          }}
          className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="button"
          onClick={() => {
            agregar(texto);
            setTexto("");
          }}
          className="px-4 rounded-xl border-2 border-primary text-primary text-sm font-semibold hover:bg-primary hover:text-white"
        >
          Agregar
        </button>
      </div>
      {ayuda && <p className="text-xs text-gray-400 mt-1">{ayuda}</p>}
    </div>
  );
}
