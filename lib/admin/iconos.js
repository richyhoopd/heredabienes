// ----------------------------------------------------------------------------
// Set fijo de iconos disponibles para los highlights de una propiedad.
// Se guarda el string `valor` en la BD, nunca el componente: la página
// pública resuelve el mismo mapa para renderizar el icono correcto.
// ----------------------------------------------------------------------------
import {
  MapPin,
  TrendingUp,
  Building2,
  Trees,
  Ruler,
  ShieldCheck,
  Sparkles,
  Landmark,
  Car,
  Droplets,
  Zap,
  Route,
} from "lucide-react";

export const ICONOS_HIGHLIGHT = [
  { valor: "map-pin", label: "Ubicación", Icono: MapPin },
  { valor: "trending-up", label: "Plusvalía", Icono: TrendingUp },
  { valor: "building", label: "Zona urbana", Icono: Building2 },
  { valor: "trees", label: "Entorno natural", Icono: Trees },
  { valor: "ruler", label: "Superficie", Icono: Ruler },
  { valor: "shield", label: "Legal", Icono: ShieldCheck },
  { valor: "sparkles", label: "Premium", Icono: Sparkles },
  { valor: "landmark", label: "Inversión", Icono: Landmark },
  { valor: "car", label: "Accesos", Icono: Car },
  { valor: "droplets", label: "Agua", Icono: Droplets },
  { valor: "zap", label: "Servicios", Icono: Zap },
  { valor: "route", label: "Vialidades", Icono: Route },
];

export function getIcono(valor) {
  const encontrado = ICONOS_HIGHLIGHT.find((i) => i.valor === valor);
  return encontrado ? encontrado.Icono : Sparkles;
}
