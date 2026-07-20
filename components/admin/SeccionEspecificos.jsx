"use client";

import { Home } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoNumero } from "./Campos";
import { mostrarHabitacionales } from "@/lib/admin/formulario";

export default function SeccionEspecificos({ form, errores, onChange }) {
  const conHabitacionales = mostrarHabitacionales(form.tipoInmueble);

  return (
    <SeccionColapsable
      titulo="Específicos del inmueble"
      descripcion={
        conHabitacionales
          ? "Recámaras, baños, niveles y antigüedad"
          : "Un terreno no lleva datos habitacionales"
      }
      Icono={Home}
      hayError={Boolean(
        errores.recamaras ||
          errores.banos ||
          errores.mediosBanos ||
          errores.estacionamientos ||
          errores.niveles ||
          errores.antiguedadAnios
      )}
    >
      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        {conHabitacionales && (
          <>
            <CampoNumero
              label="Recámaras"
              name="recamaras"
              value={form.recamaras}
              onChange={onChange}
              error={errores.recamaras}
            />
            <CampoNumero
              label="Baños completos"
              name="banos"
              value={form.banos}
              onChange={onChange}
              error={errores.banos}
            />
            <CampoNumero
              label="Medios baños"
              name="mediosBanos"
              value={form.mediosBanos}
              onChange={onChange}
              error={errores.mediosBanos}
            />
          </>
        )}
        <CampoNumero
          label="Estacionamientos"
          name="estacionamientos"
          value={form.estacionamientos}
          onChange={onChange}
          error={errores.estacionamientos}
        />
        {conHabitacionales && (
          <>
            <CampoNumero
              label="Niveles"
              name="niveles"
              value={form.niveles}
              onChange={onChange}
              error={errores.niveles}
            />
            <CampoNumero
              label="Antigüedad"
              name="antiguedadAnios"
              value={form.antiguedadAnios}
              onChange={onChange}
              error={errores.antiguedadAnios}
              sufijo="años"
            />
          </>
        )}
        {!conHabitacionales && (
          <p className="sm:col-span-3 text-sm text-gray-400">
            Cambia el tipo de inmueble a casa o departamento para capturar recámaras,
            baños, niveles y antigüedad.
          </p>
        )}
      </div>
    </SeccionColapsable>
  );
}
