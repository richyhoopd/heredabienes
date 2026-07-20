"use client";

import { useState } from "react";
import { Tag, RefreshCw } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto, CampoSelect, CampoCheck, Campo } from "./Campos";
import { slugify, TIPOS_INMUEBLE, OPERACIONES, ESTATUS } from "@/lib/format";

export default function SeccionIdentidad({ form, errores, onChange }) {
  const [slugManual, setSlugManual] = useState(Boolean(form.slug));

  const cambiarTitulo = (_name, valor) => {
    onChange("titulo", valor);
    if (!slugManual) onChange("slug", slugify(valor));
  };

  const cambiarSlug = (_name, valor) => {
    setSlugManual(true);
    onChange("slug", valor);
  };

  const regenerarSlug = () => {
    setSlugManual(false);
    onChange("slug", slugify(form.titulo || ""));
  };

  const hayError = Boolean(errores.titulo || errores.slug || errores.tipoInmueble);

  return (
    <SeccionColapsable
      titulo="Identidad"
      descripcion="Título, slug, tipo y estado de publicación"
      Icono={Tag}
      hayError={hayError}
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <CampoTexto
          label="Título *"
          name="titulo"
          value={form.titulo}
          onChange={cambiarTitulo}
          error={errores.titulo}
          placeholder="Terreno con Alta Plusvalía en Colonia Seattle"
          className="sm:col-span-2"
        />

        <Campo
          label="Slug *"
          htmlFor="slug"
          error={errores.slug}
          ayuda={`URL pública: /propiedades/${form.slug || "…"}`}
          className="sm:col-span-2"
        >
          <div className="flex gap-2">
            <input
              id="slug"
              value={form.slug ?? ""}
              onChange={(e) => cambiarSlug("slug", e.target.value)}
              className={`flex-1 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                errores.slug ? "border-red-300" : "border-gray-200"
              }`}
            />
            <button
              type="button"
              onClick={regenerarSlug}
              title="Regenerar desde el título"
              className="px-3 rounded-xl border border-gray-200 text-gray-500 hover:text-primary hover:border-primary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </Campo>

        <CampoTexto
          label="Gancho"
          name="gancho"
          value={form.gancho}
          onChange={onChange}
          placeholder="Terreno urbano premium"
          className="sm:col-span-2"
        />

        <CampoSelect
          label="Tipo de inmueble *"
          name="tipoInmueble"
          value={form.tipoInmueble}
          onChange={onChange}
          error={errores.tipoInmueble}
          opciones={TIPOS_INMUEBLE.map((t) => t.value)}
        />
        <CampoSelect
          label="Operación *"
          name="operacion"
          value={form.operacion}
          onChange={onChange}
          opciones={OPERACIONES.map((o) => o.value)}
        />
        <CampoSelect
          label="Estatus"
          name="estatus"
          value={form.estatus}
          onChange={onChange}
          opciones={ESTATUS.map((e) => e.value)}
        />
        <CampoTexto
          label="Orden en el listado"
          name="orden"
          value={form.orden}
          onChange={onChange}
          ayuda="Menor número aparece primero"
        />

        <div className="sm:col-span-2 border-t border-gray-100 pt-2">
          <CampoCheck
            label="Publicada"
            name="publicado"
            checked={form.publicado}
            onChange={onChange}
            ayuda="Si está apagado, la propiedad queda como borrador y no aparece en el sitio."
          />
          <CampoCheck
            label="Destacada"
            name="destacado"
            checked={form.destacado}
            onChange={onChange}
            ayuda="Aparece en la sección de destacadas del Home."
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
