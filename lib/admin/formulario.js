// ----------------------------------------------------------------------------
// Utilidades puras del formulario de propiedades del admin.
// Módulo sin 'use client': lo importan tanto Client Components (el formulario)
// como, potencialmente, código de servidor. Sin React, sin Supabase.
// ----------------------------------------------------------------------------

export function propiedadVacia() {
  return {
    id: null,
    slug: "",
    titulo: "",
    gancho: "",
    tipoInmueble: "terreno",
    operacion: "venta",
    estatus: "disponible",
    publicado: false,
    destacado: false,
    orden: 0,
    precio: "",
    moneda: "MXN",
    mostrarPrecio: true,
    precioNota: "",
    formasPago: [],
    calle: "",
    numeroExterior: "",
    numeroInterior: "",
    colonia: "",
    municipio: "",
    estado: "Jalisco",
    cp: "",
    lat: "",
    lng: "",
    mostrarDireccionExacta: true,
    superficieTerrenoM2: "",
    superficieConstruccionM2: "",
    medidaNorte: "",
    medidaSur: "",
    medidaOriente: "",
    medidaPoniente: "",
    medidasNota: "",
    recamaras: "",
    banos: "",
    mediosBanos: "",
    estacionamientos: "",
    niveles: "",
    antiguedadAnios: "",
    descripcion: "",
    idealPara: [],
    ventajas: [],
    entorno: [],
    estatusLegal: [],
    amenidades: [],
    highlights: [],
    portadaUrl: "",
    fichaPdfUrl: "",
    asesorNombre: "",
    asesorTelefono: "",
    asesorEmail: "",
    metaTitle: "",
    metaDescription: "",
    imagenes: [],
  };
}

const SIN_HABITACIONALES = ["terreno"];
const SIN_MEDIDAS = ["casa", "departamento"];

export function mostrarHabitacionales(tipo) {
  return !SIN_HABITACIONALES.includes(tipo);
}

export function mostrarMedidas(tipo) {
  return !SIN_MEDIDAS.includes(tipo);
}

export function aNumero(valor) {
  if (valor === "" || valor === null || valor === undefined) return null;
  const n = Number(String(valor).replace(/[, ]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export function validarPropiedad(form) {
  const errores = {};

  if (!form.titulo || !form.titulo.trim()) {
    errores.titulo = "El título es obligatorio.";
  }
  if (!form.tipoInmueble) {
    errores.tipoInmueble = "Selecciona el tipo de inmueble.";
  }
  if (!form.slug || !form.slug.trim()) {
    errores.slug = "El slug es obligatorio.";
  } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug.trim())) {
    errores.slug = "Solo minúsculas, números y guiones.";
  }

  if (form.precio !== "" && form.precio !== null && aNumero(form.precio) === null) {
    errores.precio = "El precio debe ser un número.";
  }
  if (aNumero(form.precio) !== null && aNumero(form.precio) < 0) {
    errores.precio = "El precio no puede ser negativo.";
  }

  const numericos = [
    ["superficieTerrenoM2", "La superficie de terreno debe ser un número."],
    ["superficieConstruccionM2", "La superficie de construcción debe ser un número."],
    ["recamaras", "Las recámaras deben ser un número."],
    ["banos", "Los baños deben ser un número."],
    ["mediosBanos", "Los medios baños deben ser un número."],
    ["estacionamientos", "Los estacionamientos deben ser un número."],
    ["niveles", "Los niveles deben ser un número."],
    ["antiguedadAnios", "La antigüedad debe ser un número."],
    ["lat", "La latitud debe ser un número."],
    ["lng", "La longitud debe ser un número."],
  ];
  numericos.forEach(([campo, mensaje]) => {
    const v = form[campo];
    if (v !== "" && v !== null && v !== undefined && aNumero(v) === null) {
      errores[campo] = mensaje;
    }
  });

  if (form.asesorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.asesorEmail)) {
    errores.asesorEmail = "Correo inválido.";
  }
  if (Array.isArray(form.highlights) && form.highlights.length > 4) {
    errores.highlights = "Máximo 4 highlights.";
  }

  return errores;
}
