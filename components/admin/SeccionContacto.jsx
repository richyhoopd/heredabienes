"use client";

import { UserRound } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto } from "./Campos";

export default function SeccionContacto({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Contacto"
      descripcion="Asesor responsable de esta propiedad"
      Icono={UserRound}
      hayError={Boolean(errores.asesorEmail)}
    >
      <div className="grid gap-4 sm:grid-cols-3 mt-4">
        <CampoTexto
          label="Nombre del asesor"
          name="asesorNombre"
          value={form.asesorNombre}
          onChange={onChange}
          ayuda="Si se deja vacío, se usan los datos generales de Heredabienes."
        />
        <CampoTexto
          label="Teléfono / WhatsApp"
          name="asesorTelefono"
          value={form.asesorTelefono}
          onChange={onChange}
          placeholder="5213313013253"
          ayuda="Formato internacional, sin signos."
        />
        <CampoTexto
          label="Correo"
          name="asesorEmail"
          type="email"
          value={form.asesorEmail}
          onChange={onChange}
          error={errores.asesorEmail}
          placeholder="heredabienes@outlook.com"
        />
      </div>
    </SeccionColapsable>
  );
}
