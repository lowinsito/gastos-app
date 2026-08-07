// Las operaciones de la lista del super.
//
// Van en un archivo aparte de `acciones.ts` (que es el de los gastos)
// porque son otro tema: si manana tocamos algo de la lista, no queremos
// releer 180 lineas de validacion de montos para encontrar lo nuestro.
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { exigirSesion } from "@/lib/autenticacion";
import { LARGO_MAXIMO_ITEM } from "@/lib/lista";

/**
 * Agrega un item a la lista.
 *
 * Devuelve un error en texto en lugar de tirar una excepcion: el que
 * llama es un formulario, y lo que necesita es algo para mostrarle al
 * usuario, no que se caiga la pagina.
 */
export async function agregarItem(nombre: string): Promise<string | null> {
  // Cada accion verifica la sesion por su cuenta. Una Server Action se
  // puede invocar con un POST directo, sin pasar por ninguna pantalla,
  // asi que no alcanza con que el proxy y la pagina ya lo hayan hecho.
  await exigirSesion();

  const limpio = nombre.trim();
  if (limpio === "") return "Escribí algo para agregar.";
  if (limpio.length > LARGO_MAXIMO_ITEM) {
    return `Máximo ${LARGO_MAXIMO_ITEM} caracteres.`;
  }

  await prisma.itemLista.create({ data: { nombre: limpio } });

  revalidatePath("/lista");
  return null;
}

/**
 * Tilda o destilda un item.
 *
 * OJO con el segundo parametro: recibimos el estado que queremos DEJAR,
 * no un "dalo vuelta". Si leyeramos el valor actual y lo invirtieramos,
 * y vos y Camila tocaran el mismo item al mismo tiempo, los dos leerian
 * "sin comprar" y el segundo lo destildaria. Mandando el valor final,
 * los dos escriben `true` y no hay sorpresa.
 */
export async function alternarItem(id: string, comprado: boolean) {
  await exigirSesion();

  await prisma.itemLista.update({
    where: { id },
    data: { comprado },
  });

  revalidatePath("/lista");
}

export async function eliminarItem(id: string) {
  await exigirSesion();

  await prisma.itemLista.delete({ where: { id } });

  revalidatePath("/lista");
}

/**
 * Borra de una todos los items ya comprados, para dejar la lista limpia
 * al volver del super.
 *
 * `deleteMany` es UNA sola consulta a la base. Traer los comprados y
 * borrarlos de a uno serian veinte idas y vueltas para hacer lo mismo.
 */
export async function vaciarComprados() {
  await exigirSesion();

  await prisma.itemLista.deleteMany({ where: { comprado: true } });

  revalidatePath("/lista");
}
