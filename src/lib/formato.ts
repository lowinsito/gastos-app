import type { Categoria } from "@/generated/prisma/enums";

// Intl es una herramienta del propio JavaScript para formatear numeros y
// fechas segun el pais. Creamos los formateadores una sola vez, fuera de
// las funciones: construirlos es costoso y no cambian nunca.

const formateadorMoneda = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

/** 48500 -> "$ 48.500,00" */
export function formatearMonto(valor: number | string): string {
  return formateadorMoneda.format(Number(valor));
}

// OJO con timeZone: "UTC".
// La columna `fecha` guarda solo el dia, sin hora, asi que Prisma nos
// devuelve la medianoche en UTC. Si formatearamos en la zona horaria de
// Argentina (UTC-3), esa medianoche seria las 21:00 del dia ANTERIOR y
// todos los gastos se mostrarian un dia corridos.
const formateadorFecha = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "UTC",
});

/** Date -> "06/08/2026" */
export function formatearFecha(fecha: Date): string {
  return formateadorFecha.format(fecha);
}

/**
 * Como se muestra cada categoria en pantalla.
 * En la base viven en MAYUSCULAS porque son constantes; al usuario le
 * mostramos texto normal.
 */
export const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  SUPERMERCADO: "Supermercado",
  SERVICIOS: "Servicios",
  COMIDA_AFUERA: "Comida afuera",
  SALUD: "Salud",
  OCIO: "Ocio",
  MASCOTAS: "Mascotas",
  HOGAR: "Hogar",
  OTROS: "Otros",
};
