"use client";

import { MapPin } from "lucide-react";
import SeccionColapsable from "./SeccionColapsable";
import { CampoTexto, CampoNumero, CampoCheck } from "./Campos";

export default function SeccionUbicacion({ form, errores, onChange }) {
  return (
    <SeccionColapsable
      titulo="Ubicación"
      descripcion="Dirección y coordenadas del mapa"
      Icono={MapPin}
      hayError={Boolean(errores.lat || errores.lng)}
    >
      <div className="grid gap-4 sm:grid-cols-6 mt-4">
        <CampoTexto
          label="Calle"
          name="calle"
          value={form.calle}
          onChange={onChange}
          placeholder="Calle 10"
          className="sm:col-span-4"
        />
        <CampoTexto
          label="Número exterior"
          name="numeroExterior"
          value={form.numeroExterior}
          onChange={onChange}
          placeholder="66"
          className="sm:col-span-1"
        />
        <CampoTexto
          label="Interior"
          name="numeroInterior"
          value={form.numeroInterior}
          onChange={onChange}
          className="sm:col-span-1"
        />
        <CampoTexto
          label="Colonia"
          name="colonia"
          value={form.colonia}
          onChange={onChange}
          placeholder="Colonia Seattle"
          className="sm:col-span-3"
        />
        <CampoTexto
          label="Municipio"
          name="municipio"
          value={form.municipio}
          onChange={onChange}
          placeholder="Zapopan"
          className="sm:col-span-3"
        />
        <CampoTexto
          label="Estado"
          name="estado"
          value={form.estado}
          onChange={onChange}
          placeholder="Jalisco"
          className="sm:col-span-3"
        />
        <CampoTexto
          label="Código postal"
          name="cp"
          value={form.cp}
          onChange={onChange}
          placeholder="45150"
          className="sm:col-span-3"
        />
        <CampoNumero
          label="Latitud"
          name="lat"
          value={form.lat}
          onChange={onChange}
          error={errores.lat}
          placeholder="20.6970"
          className="sm:col-span-3"
        />
        <CampoNumero
          label="Longitud"
          name="lng"
          value={form.lng}
          onChange={onChange}
          error={errores.lng}
          placeholder="-103.4100"
          className="sm:col-span-3"
        />
        <div className="sm:col-span-6">
          <CampoCheck
            label="Mostrar la dirección exacta"
            name="mostrarDireccionExacta"
            checked={form.mostrarDireccionExacta}
            onChange={onChange}
            ayuda="Si se apaga, el sitio muestra solo colonia y municipio, y el mapa se aproxima."
          />
        </div>
      </div>
    </SeccionColapsable>
  );
}
