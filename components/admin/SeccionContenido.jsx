"use client";

import { FileText } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTextarea } from "./Campos";
import ChipsPresets from "./ChipsPresets";
import EditorHighlights from "./EditorHighlights";
import { PRESETS } from "@/lib/format";

export default function SeccionContenido({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Contenido"
      descripcion="Descripción, listas comerciales y highlights"
      Icono={FileText}
      hayError={Boolean(errores.highlights)}
    >
      <div className="space-y-6 mt-4">
        <CampoTextarea
          label="Descripción"
          name="descripcion"
          value={form.descripcion}
          onChange={onChange}
          rows={6}
          placeholder="Excelente terreno urbano en una de las zonas de mayor plusvalía de Zapopan…"
        />

        <ChipsPresets
          label="Ideal para"
          valores={form.idealPara}
          presets={PRESETS.idealPara}
          onChange={(nuevos) => onChange("idealPara", nuevos)}
        />
        <ChipsPresets
          label="Ventajas"
          valores={form.ventajas}
          presets={PRESETS.ventajas}
          onChange={(nuevos) => onChange("ventajas", nuevos)}
        />
        <ChipsPresets
          label="Entorno"
          valores={form.entorno}
          presets={PRESETS.entorno}
          onChange={(nuevos) => onChange("entorno", nuevos)}
        />
        <ChipsPresets
          label="Estatus legal"
          valores={form.estatusLegal}
          presets={PRESETS.estatusLegal}
          onChange={(nuevos) => onChange("estatusLegal", nuevos)}
        />
        <ChipsPresets
          label="Amenidades y servicios"
          valores={form.amenidades}
          presets={PRESETS.amenidades}
          onChange={(nuevos) => onChange("amenidades", nuevos)}
        />

        <div className="border-t border-gray-100 pt-5">
          <EditorHighlights
            valores={form.highlights}
            presets={PRESETS.highlights}
            onChange={(nuevos) => onChange("highlights", nuevos)}
            error={errores.highlights}
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
