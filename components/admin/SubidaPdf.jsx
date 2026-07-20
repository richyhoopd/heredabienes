"use client";

import { useRef, useState } from "react";
import { FileText, Trash2, AlertCircle } from "lucide-react";
import { uploadFile } from "@/lib/api/storage";

export default function SubidaPdf({ propertyId, valor, onChange }) {
  const inputRef = useRef(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  const subir = async (e) => {
    const archivo = (e.target.files || [])[0];
    if (!archivo || !propertyId) return;
    if (archivo.type !== "application/pdf") {
      setError("El archivo debe ser un PDF.");
      return;
    }
    setError("");
    setSubiendo(true);
    try {
      const { url } = await uploadFile(archivo, `${propertyId}/ficha`);
      onChange(url);
    } catch (err) {
      setError(err?.message || "No se pudo subir el PDF.");
    }
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (!propertyId) {
    return (
      <p className="text-sm text-gray-500 border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
        Guarda primero la propiedad para subir la ficha PDF.
      </p>
    );
  }

  return (
    <div>
      <span className="block text-sm font-semibold text-gray-700 mb-2">
        Ficha técnica (PDF)
      </span>

      {valor ? (
        <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-3">
          <FileText className="w-5 h-5 text-primary shrink-0" />
          <a
            href={valor}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-0 truncate text-sm text-primary hover:underline"
          >
            {valor.split("/").pop()}
          </a>
          <button
            type="button"
            onClick={() => onChange("")}
            title="Quitar del formulario"
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="btn-outline cursor-pointer !px-4 !py-2 !text-sm inline-flex">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={subir}
            disabled={subiendo}
          />
          {subiendo ? "Subiendo…" : "Subir PDF"}
        </label>
      )}

      {error && (
        <p className="flex items-center gap-1 text-xs text-red-600 mt-2">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
