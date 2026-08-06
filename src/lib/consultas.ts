// Logica de consulta compartida entre la lista de gastos y el resumen.
// Vive aparte para que las dos paginas filtren exactamente igual: si
// manana cambiamos como se interpreta un mes, cambia en los dos lados.

import type { Prisma } from "@/generated/prisma/client";
import type { Categoria } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import {
  ETIQUETAS_CATEGORIA,
  formatearMes,
  mesDeFecha,
  rangoDelMes,
} from "@/lib/formato";

/** Lo que llega en la URL es texto libre: puede venir vacio, repetido o inventado. */
export function leerParametro(valor: string | string[] | undefined): string {
  if (Array.isArray(valor)) return valor[0] ?? "";
  return valor ?? "";
}

export type FiltrosResueltos = {
  /** El mes ya validado, o "" si no habia o no servia. */
  mes: string;
  /** La categoria ya validada, o "" si no habia o no servia. */
  categoria: string;
  /** La condicion lista para pasarle a Prisma. */
  donde: Prisma.GastoWhereInput;
  hayFiltros: boolean;
};

/**
 * Toma los parametros crudos de la URL y devuelve filtros confiables.
 * Todo lo que no se entienda se descarta en silencio: la URL la escribe
 * el usuario y no podemos confiar en ella.
 */
export function resolverFiltros(parametros: {
  mes?: string | string[];
  categoria?: string | string[];
}): FiltrosResueltos {
  const mesPedido = leerParametro(parametros.mes);
  const categoriaPedida = leerParametro(parametros.categoria);

  const rango = rangoDelMes(mesPedido);
  const mes = rango ? mesPedido : "";

  const categoria = categoriaPedida in ETIQUETAS_CATEGORIA ? categoriaPedida : "";

  const donde: Prisma.GastoWhereInput = {};
  if (rango) donde.fecha = { gte: rango.desde, lt: rango.hasta };
  if (categoria) donde.categoria = categoria as Categoria;

  return { mes, categoria, donde, hayFiltros: mes !== "" || categoria !== "" };
}

/**
 * Los meses que tienen al menos un gasto, del mas nuevo al mas viejo.
 * No tiene sentido ofrecer en el filtro un mes vacio.
 */
export async function mesesConGastos() {
  const fechas = await prisma.gasto.findMany({
    select: { fecha: true },
    orderBy: { fecha: "desc" },
  });

  return [...new Set(fechas.map((g) => mesDeFecha(g.fecha)))].map((valor) => ({
    valor,
    etiqueta: formatearMes(valor),
  }));
}
