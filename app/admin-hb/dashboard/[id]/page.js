"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

import {
  getPropertyById,
  createProperty,
  updateProperty,
  slugDisponible,
} from "@/lib/api/properties";
import { propiedadVacia, validarPropiedad, aNumero } from "@/lib/admin/formulario";
import { slugify } from "@/lib/format";
import { revalidarPropiedad } from "../acciones";

import SeccionIdentidad from "@/components/admin/SeccionIdentidad";
import SeccionPrecio from "@/components/admin/SeccionPrecio";
import SeccionUbicacion from "@/components/admin/SeccionUbicacion";
import SeccionSuperficie from "@/components/admin/SeccionSuperficie";
import SeccionEspecificos from "@/components/admin/SeccionEspecificos";
import SeccionContenido from "@/components/admin/SeccionContenido";
import SeccionMedios from "@/components/admin/SeccionMedios";
import SeccionContacto from "@/components/admin/SeccionContacto";
import SeccionSeo from "@/components/admin/SeccionSeo";

const NUMERICOS = [
  "precio",
  "orden",
  "superficieTerrenoM2",
  "superficieConstruccionM2",
  "recamaras",
  "banos",
  "mediosBanos",
  "estacionamientos",
  "niveles",
  "antiguedadAnios",
  "lat",
  "lng",
];

function aPayload(form) {
  const salida = { ...form };
  delete salida.id;
  delete salida.imagenes;
  NUMERICOS.forEach((campo) => {
    salida[campo] = aNumero(form[campo]);
  });
  salida.titulo = (form.titulo || "").trim();
  salida.slug = slugify(form.slug || form.titulo || "");
  return salida;
}

export default function FormularioPropiedad() {
  const router = useRouter();
  const params = useParams();
  const esNueva = params.id === "nueva";

  const [propertyId, setPropertyId] = useState(esNueva ? null : params.id);
  const [form, setForm] = useState(propiedadVacia());
  const [slugOriginal, setSlugOriginal] = useState("");
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(!esNueva);
  const [guardando, setGuardando] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState("");
  const [aviso, setAviso] = useState("");

  useEffect(() => {
    if (esNueva) return;
    let vivo = true;
    (async () => {
      try {
        const datos = await getPropertyById(params.id);
        if (!datos) throw new Error("La propiedad no existe.");
        if (!vivo) return;
        const base = propiedadVacia();
        const combinado = { ...base };
        Object.keys(base).forEach((k) => {
          const v = datos[k];
          if (v === null || v === undefined) return;
          combinado[k] = v;
        });
        setForm(combinado);
        setSlugOriginal(datos.slug || "");
      } catch (err) {
        if (vivo) setErrorGlobal(err?.message || "No se pudo cargar la propiedad.");
      }
      if (vivo) setCargando(false);
    })();
    return () => {
      vivo = false;
    };
  }, [esNueva, params.id]);

  const onChange = (campo, valor) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => (prev[campo] ? { ...prev, [campo]: undefined } : prev));
    setAviso("");
  };

  const guardar = async (publicar) => {
    setErrorGlobal("");
    setAviso("");

    const candidato = publicar ? { ...form, publicado: true } : form;
    const errs = validarPropiedad(candidato);
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      setErrorGlobal("Revisa los campos marcados en rojo.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setGuardando(true);
    const payload = aPayload(candidato);

    try {
      const libre = await slugDisponible(payload.slug, propertyId || undefined);
      if (!libre) {
        setErrores({ slug: "Ya existe otra propiedad con ese slug." });
        setErrorGlobal("El slug está ocupado. Cámbialo y vuelve a guardar.");
        setGuardando(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      let guardada;
      if (propertyId) {
        guardada = await updateProperty(propertyId, payload);
      } else {
        guardada = await createProperty(payload);
      }

      const idFinal = guardada?.id || propertyId;
      const slugFinal = guardada?.slug || payload.slug;

      setForm(candidato.publicado === payload.publicado ? candidato : candidato);
      setErrores({});

      try {
        await revalidarPropiedad(slugFinal, slugOriginal);
      } catch {
        // la revalidación no debe bloquear el guardado
      }
      setSlugOriginal(slugFinal);

      if (!propertyId && idFinal) {
        setPropertyId(idFinal);
        router.replace(`/admin-hb/dashboard/${idFinal}`);
      }

      setAviso(
        payload.publicado
          ? "Guardado y publicado. Ya es visible en el sitio."
          : "Guardado como borrador. No es visible en el sitio."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrorGlobal(err?.message || "No se pudo guardar.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setGuardando(false);
  };

  if (cargando) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-20 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 pb-28">
      <Link
        href="/admin-hb/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Volver al listado
      </Link>

      <h1 className="text-2xl font-bold font-display text-dark mb-1">
        {esNueva && !propertyId ? "Nueva propiedad" : form.titulo || "Editar propiedad"}
      </h1>
      <p className="text-sm text-gray-500 mb-6">
        {form.publicado ? "Publicada" : "Borrador"} · {form.tipoInmueble} ·{" "}
        {form.operacion}
      </p>

      {errorGlobal && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3 mb-4">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{errorGlobal}</span>
        </div>
      )}
      {aviso && (
        <div className="flex items-start gap-2 bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl p-3 mb-4">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{aviso}</span>
        </div>
      )}

      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <SeccionIdentidad form={form} errores={errores} onChange={onChange} />
        <SeccionPrecio form={form} errores={errores} onChange={onChange} />
        <SeccionUbicacion form={form} errores={errores} onChange={onChange} />
        <SeccionSuperficie form={form} errores={errores} onChange={onChange} />
        <SeccionEspecificos form={form} errores={errores} onChange={onChange} />
        <SeccionContenido form={form} errores={errores} onChange={onChange} />
        <SeccionMedios form={form} propertyId={propertyId} onChange={onChange} />
        <SeccionContacto form={form} errores={errores} onChange={onChange} />
        <SeccionSeo form={form} errores={errores} onChange={onChange} />
      </form>

      <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 flex flex-wrap items-center justify-end gap-3">
          <span className="mr-auto text-xs text-gray-400 hidden sm:block">
            /propiedades/{form.slug || "…"}
          </span>
          <button
            type="button"
            onClick={() => guardar(false)}
            disabled={guardando}
            className="btn-outline !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {guardando ? "Guardando…" : "Guardar borrador"}
          </button>
          <button
            type="button"
            onClick={() => guardar(true)}
            disabled={guardando}
            className="btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-60"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Guardando…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Guardar y publicar
              </>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
