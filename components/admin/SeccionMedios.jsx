"use client";

import { ImageIcon } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import GaleriaEditor from "./GaleriaEditor";
import SubidaPdf from "./SubidaPdf";

export default function SeccionMedios({ form, propertyId, onChange }) {
  return (
    <SeccionColapsable
      titulo="Medios"
      descripcion="Galería, portada y ficha PDF"
      Icono={ImageIcon}
    >
      <div className="space-y-6 mt-4">
        <GaleriaEditor
          propertyId={propertyId}
          portadaUrl={form.portadaUrl}
          onPortadaChange={(url) => onChange("portadaUrl", url)}
        />
        <div className="border-t border-gray-100 pt-5">
          <SubidaPdf
            propertyId={propertyId}
            valor={form.fichaPdfUrl}
            onChange={(url) => onChange("fichaPdfUrl", url)}
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
