"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  Star,
  GripVertical,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  listImagesByProperty,
  addImage,
  reorderImages,
  deleteImage,
} from "@/lib/api/images";
import { uploadFile, deleteFile } from "@/lib/api/storage";

export default function GaleriaEditor({ propertyId, portadaUrl, onPortadaChange }) {
  const inputRef = useRef(null);
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(null);

  useEffect(() => {
    if (!propertyId) return;
    let vivo = true;
    (async () => {
      setCargando(true);
      try {
        const datos = await listImagesByProperty(propertyId);
        if (vivo) setImagenes(Array.isArray(datos) ? datos : []);
      } catch (err) {
        if (vivo) setError(err?.message || "No se pudieron cargar las imágenes.");
      }
      if (vivo) setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [propertyId]);

  const subir = async (e) => {
    const archivos = Array.from(e.target.files || []);
    if (!archivos.length || !propertyId) return;
    setSubiendo(true);
    setError("");
    let orden = imagenes.length;
    const nuevas = [];
    for (const archivo of archivos) {
      try {
        const { path, url } = await uploadFile(archivo, `${propertyId}/galeria`);
        const fila = await addImage({
          propertyId,
          url,
          storagePath: path,
          alt: "",
          orden: orden++,
        });
        nuevas.push(fila || { id: path, url, storagePath: path, alt: "", orden });
      } catch (err) {
        setError(`No se pudo subir ${archivo.name}: ${err?.message || "error"}`);
      }
    }
    const total = [...imagenes, ...nuevas];
    setImagenes(total);
    if (!portadaUrl && total[0]) onPortadaChange(total[0].url);
    setSubiendo(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const borrar = async (img) => {
    setError("");
    const restantes = imagenes.filter((i) => i.id !== img.id);
    setImagenes(restantes);
    try {
      await deleteImage(img.id);
      if (img.storagePath) await deleteFile(img.storagePath);
    } catch (err) {
      setError(err?.message || "No se pudo eliminar la imagen.");
      setImagenes(imagenes); // revierte
      return;
    }
    if (portadaUrl === img.url) {
      onPortadaChange(restantes[0] ? restantes[0].url : "");
    }
  };

  const soltar = async (destino) => {
    if (arrastrando === null || arrastrando === destino) {
      setArrastrando(null);
      return;
    }
    const copia = [...imagenes];
    const [movida] = copia.splice(arrastrando, 1);
    copia.splice(destino, 0, movida);
    setImagenes(copia);
    setArrastrando(null);
    try {
      await reorderImages(copia.map((i) => i.id));
    } catch (err) {
      setError(err?.message || "No se pudo guardar el nuevo orden.");
    }
  };

  if (!propertyId) {
    return (
      <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center">
        <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">
          Guarda primero la propiedad para subir imágenes.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">
          Galería ({imagenes.length})
        </span>
        <label className="btn-outline cursor-pointer !px-4 !py-2 !text-sm">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={subir}
            disabled={subiendo}
          />
          {subiendo ? "Subiendo…" : "Subir imágenes"}
        </label>
      </div>

      <p className="text-xs text-gray-400 mb-3">
        Arrastra para reordenar. La estrella marca la portada, que es la imagen que
        aparece al compartir el link.
      </p>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-xs rounded-xl p-3 mb-3">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {cargando ? (
        <div className="py-10 text-center">
          <Loader2 className="w-5 h-5 animate-spin text-primary mx-auto" />
        </div>
      ) : imagenes.length === 0 ? (
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-sm text-gray-400">
          Todavía no hay imágenes.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {imagenes.map((img, i) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => setArrastrando(i)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => soltar(i)}
              onDragEnd={() => setArrastrando(null)}
              className={`relative group rounded-xl overflow-hidden border-2 bg-gray-100 ${
                portadaUrl === img.url ? "border-primary" : "border-transparent"
              } ${arrastrando === i ? "opacity-40" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt || ""}
                className="w-full h-32 object-cover pointer-events-none"
              />
              <span className="absolute top-1.5 left-1.5 bg-black/50 text-white rounded-md p-1 cursor-grab">
                <GripVertical className="w-3.5 h-3.5" />
              </span>
              <div className="absolute top-1.5 right-1.5 flex gap-1">
                <button
                  type="button"
                  onClick={() => onPortadaChange(img.url)}
                  title="Marcar como portada"
                  className={`rounded-md p-1 ${
                    portadaUrl === img.url
                      ? "bg-primary text-white"
                      : "bg-black/50 text-white hover:bg-primary"
                  }`}
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => borrar(img)}
                  title="Eliminar imagen"
                  className="rounded-md p-1 bg-black/50 text-white hover:bg-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {portadaUrl === img.url && (
                <span className="absolute bottom-0 inset-x-0 bg-primary text-white text-[10px] font-bold text-center py-0.5">
                  PORTADA
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
