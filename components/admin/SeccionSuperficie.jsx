"use client";

import { Ruler } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoNumero, CampoTexto, CampoTextarea } from "./Campos";
import { mostrarMedidas } from "@/lib/admin/formulario";

export default function SeccionSuperficie({ form, errores, onChange }) {
  const conMedidas = mostrarMedidas(form.tipoInmueble);

  return (
    <SeccionColapsable
      titulo="Superficie y medidas"
      descripcion={
        conMedidas
          ? "Área y linderos por orientación"
          : "Área de terreno y construcción"
      }
      Icono={Ruler}
      hayError={Boolean(errores.superficieTerrenoM2 || errores.superficieConstruccionM2)}
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <CampoNumero
          label="Superficie de terreno"
          name="superficieTerrenoM2"
          value={form.superficieTerrenoM2}
          onChange={onChange}
          error={errores.superficieTerrenoM2}
          sufijo="m²"
          placeholder="1500"
        />
        <CampoNumero
          label="Superficie de construcción"
          name="superficieConstruccionM2"
          value={form.superficieConstruccionM2}
          onChange={onChange}
          error={errores.superficieConstruccionM2}
          sufijo="m²"
          placeholder="0"
        />

        {conMedidas && (
          <>
            <div className="sm:col-span-2 border-t border-gray-100 pt-3">
              <p className="text-sm font-semibold text-gray-700">
                Medidas por orientación
              </p>
              <p className="text-xs text-gray-400">
                Texto libre: admite quiebres, por ejemplo “36.00 m + quiebre de 10.00 m”.
              </p>
            </div>
            <CampoTexto
              label="Norte"
              name="medidaNorte"
              value={form.medidaNorte}
              onChange={onChange}
              placeholder="46.00 m"
            />
            <CampoTexto
              label="Sur"
              name="medidaSur"
              value={form.medidaSur}
              onChange={onChange}
              placeholder="36.00 m + quiebre de 10.00 m"
            />
            <CampoTexto
              label="Oriente"
              name="medidaOriente"
              value={form.medidaOriente}
              onChange={onChange}
              placeholder="35.00 m"
            />
            <CampoTexto
              label="Poniente"
              name="medidaPoniente"
              value={form.medidaPoniente}
              onChange={onChange}
              placeholder="33.00 m"
            />
            <div className="sm:col-span-2">
              <CampoTextarea
                label="Nota de las medidas"
                name="medidasNota"
                value={form.medidasNota}
                onChange={onChange}
                rows={2}
                placeholder="Medidas aproximadas sujetas a levantamiento topográfico."
              />
            </div>
          </>
        )}
      </div>
    </SeccionColapsable>
  );
}
