"use client";

import { Globe } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto, CampoTextarea } from "./Campos";

export default function SeccionSeo({ form, errores, onChange }) {
  const largoTitle = (form.metaTitle || "").length;
  const largoDesc = (form.metaDescription || "").length;

  return (
    <SeccionColapsable
      titulo="SEO y vista previa al compartir"
      descripcion="Lo que se ve en Google y en WhatsApp"
      Icono={Globe}
      abiertaInicial={false}
    >
      <div className="space-y-4 mt-4">
        <CampoTexto
          label="Meta title"
          name="metaTitle"
          value={form.metaTitle}
          onChange={onChange}
          error={errores.metaTitle}
          ayuda={`${largoTitle}/60 caracteres. Si se deja vacío se genera del título.`}
        />
        <CampoTextarea
          label="Meta description"
          name="metaDescription"
          value={form.metaDescription}
          onChange={onChange}
          rows={3}
          ayuda={`${largoDesc}/160 caracteres. Si se deja vacío se genera del título y el precio.`}
        />
        <div className="bg-gray-soft rounded-xl p-4">
          <p className="text-xs text-gray-400 mb-1">Vista previa</p>
          <p className="text-primary font-semibold text-sm truncate">
            {form.metaTitle || form.titulo || "Título de la propiedad"}
          </p>
          <p className="text-xs text-green-700">
            heredabienes.com.mx/propiedades/{form.slug || "…"}
          </p>
          <p className="text-xs text-gray-600 line-clamp-2">
            {form.metaDescription ||
              form.descripcion ||
              "Descripción de la propiedad."}
          </p>
        </div>
      </div>
    </SeccionColapsable>
  );
}
