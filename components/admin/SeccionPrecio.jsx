"use client";

import { DollarSign } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoNumero, CampoSelect, CampoTexto, CampoCheck } from "./Campos";
import ChipsPresets from "./ChipsPresets";
import { FORMAS_PAGO } from "@/lib/format";

export default function SeccionPrecio({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Precio"
      descripcion="Monto, moneda y formas de pago"
      Icono={DollarSign}
      hayError={Boolean(errores.precio)}
    >
      <div className="grid gap-4 sm:grid-cols-2 mt-4">
        <CampoNumero
          label="Precio"
          name="precio"
          value={form.precio}
          onChange={onChange}
          error={errores.precio}
          placeholder="38000000"
          ayuda="Solo números, sin comas ni signo de pesos."
        />
        <CampoSelect
          label="Moneda"
          name="moneda"
          value={form.moneda}
          onChange={onChange}
          opciones={["MXN", "USD"]}
        />
        <CampoTexto
          label="Nota del precio"
          name="precioNota"
          value={form.precioNota}
          onChange={onChange}
          placeholder="Por debajo de lo valuado"
          className="sm:col-span-2"
        />
        <div className="sm:col-span-2">
          <CampoCheck
            label="Mostrar el precio en el sitio"
            name="mostrarPrecio"
            checked={form.mostrarPrecio}
            onChange={onChange}
            ayuda='Si se apaga, el sitio muestra "Precio a consultar".'
          />
        </div>
        <div className="sm:col-span-2">
          <ChipsPresets
            label="Formas de pago"
            valores={form.formasPago}
            presets={FORMAS_PAGO}
            onChange={(nuevos) => onChange("formasPago", nuevos)}
            placeholder="Otra forma de pago…"
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
