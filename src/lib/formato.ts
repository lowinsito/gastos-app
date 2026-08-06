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

const formateadorMes = new Intl.DateTimeFormat("es-AR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Date -> "2026-08". Es la forma en que identificamos un mes en la URL. */
export function mesDeFecha(fecha: Date): string {
  return fecha.toISOString().slice(0, 7);
}

/** "2026-08" -> "agosto de 2026" */
export function formatearMes(mes: string): string {
  const rango = rangoDelMes(mes);
  if (!rango) return mes;
  return formateadorMes.format(rango.desde);
}

/**
 * "2026-08" -> el intervalo [1 de agosto, 1 de septiembre).
 *
 * Devolvemos el principio del mes SIGUIENTE en lugar del 31 a las 23:59:
 * asi la consulta es "mayor o igual que el 1 y menor que el 1 del que
 * viene", que no tiene bordes raros ni depende de cuantos dias tiene el mes.
 *
 * Si el texto no es un mes valido devuelve null, porque llega de la URL y
 * cualquiera puede escribir lo que quiera ahi.
 */
export function rangoDelMes(mes: string): { desde: Date; hasta: Date } | null {
  const partes = /^(\d{4})-(\d{2})$/.exec(mes);
  if (!partes) return null;

  const anio = Number(partes[1]);
  const numeroDeMes = Number(partes[2]);
  if (numeroDeMes < 1 || numeroDeMes > 12) return null;

  return {
    desde: new Date(Date.UTC(anio, numeroDeMes - 1, 1)),
    hasta: new Date(Date.UTC(anio, numeroDeMes, 1)),
  };
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
