// La directiva "use server" al principio del archivo marca TODO lo que se
// exporta desde aca como Server Action: funciones que corren en el servidor
// aunque se llamen desde el navegador.
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirSesion } from "@/lib/autenticacion";
import { ETIQUETAS_CATEGORIA } from "@/lib/formato";
import type { Categoria } from "@/generated/prisma/enums";

/** Lo que la accion le devuelve al formulario para que muestre errores. */
export type EstadoFormulario = {
  errores?: Record<string, string>;
  exito?: boolean;
};

const CATEGORIAS_VALIDAS = Object.keys(ETIQUETAS_CATEGORIA) as Categoria[];

/** Los datos ya limpios, listos para guardar. */
type DatosGasto = {
  fecha: Date;
  descripcion: string;
  categoria: Categoria;
  pusoJose: string;
  pusoCamila: string;
  observaciones: string | null;
};

/**
 * Convierte lo que llego del formulario en un monto valido.
 * Devuelve el texto normalizado (para pasarselo a Prisma sin perder
 * precision) o null si no sirve.
 */
function leerMonto(bruto: FormDataEntryValue | null): string | null {
  const texto = String(bruto ?? "").trim();
  if (texto === "") return "0";

  // Aceptamos "1234" y "1234.50". Hasta dos decimales, sin negativos.
  if (!/^\d+(\.\d{1,2})?$/.test(texto)) return null;

  return texto;
}

/**
 * Valida el formulario. Crear y editar usan exactamente las mismas reglas,
 * asi que viven en un solo lugar: si manana agregamos una regla, vale para
 * los dos caminos sin que nadie se olvide de copiarla.
 */
function validar(
  formData: FormData,
): { ok: true; datos: DatosGasto } | { ok: false; errores: Record<string, string> } {
  const errores: Record<string, string> = {};

  // --- Fecha ---------------------------------------------------------
  const fechaTexto = String(formData.get("fecha") ?? "").trim();
  // El input type="date" manda "2026-08-06". Interpretado asi, Date lo lee
  // como medianoche UTC, que es justo lo que espera la columna @db.Date.
  const fecha = new Date(fechaTexto);
  if (!fechaTexto || Number.isNaN(fecha.getTime())) {
    errores.fecha = "Poné una fecha válida.";
  }

  // --- Descripcion ---------------------------------------------------
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  if (descripcion === "") {
    errores.descripcion = "Escribí una descripción.";
  } else if (descripcion.length > 200) {
    errores.descripcion = "Máximo 200 caracteres.";
  }

  // --- Categoria -----------------------------------------------------
  const categoria = String(formData.get("categoria") ?? "") as Categoria;
  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    errores.categoria = "Elegí una categoría.";
  }

  // --- Montos --------------------------------------------------------
  // El formulario tiene dos modos: uno solo pago, o pagaron los dos.
  const modo = String(formData.get("modo") ?? "simple");
  let pusoJose: string | null = null;
  let pusoCamila: string | null = null;

  if (modo === "compartido") {
    pusoJose = leerMonto(formData.get("pusoJose"));
    pusoCamila = leerMonto(formData.get("pusoCamila"));

    if (pusoJose === null) errores.pusoJose = "Monto inválido.";
    if (pusoCamila === null) errores.pusoCamila = "Monto inválido.";
  } else {
    const monto = leerMonto(formData.get("monto"));
    const pagador = String(formData.get("pagador") ?? "");

    if (monto === null) {
      errores.monto = "Monto inválido.";
    } else if (pagador !== "JOSE" && pagador !== "CAMILA") {
      errores.pagador = "Elegí quién pagó.";
    } else {
      pusoJose = pagador === "JOSE" ? monto : "0";
      pusoCamila = pagador === "CAMILA" ? monto : "0";
    }
  }

  // Un gasto de cero no tiene sentido: seguro es un error de tipeo.
  if (
    pusoJose !== null &&
    pusoCamila !== null &&
    Number(pusoJose) + Number(pusoCamila) === 0
  ) {
    errores[modo === "compartido" ? "pusoJose" : "monto"] =
      "El monto tiene que ser mayor a cero.";
  }

  // --- Observaciones -------------------------------------------------
  const observaciones = String(formData.get("observaciones") ?? "").trim();
  if (observaciones.length > 500) {
    errores.observaciones = "Máximo 500 caracteres.";
  }

  if (Object.keys(errores).length > 0) {
    return { ok: false, errores };
  }

  return {
    ok: true,
    datos: {
      fecha,
      descripcion,
      categoria,
      pusoJose: pusoJose!,
      pusoCamila: pusoCamila!,
      observaciones: observaciones === "" ? null : observaciones,
    },
  };
}

// Las Server Actions se pueden invocar con un pedido POST directo, sin
// pasar por ninguna pantalla de la app. Por eso CADA UNA verifica la
// sesion por su cuenta: que el proxy y las paginas ya lo hagan no alcanza.
export async function crearGasto(
  _estadoPrevio: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirSesion();

  const resultado = validar(formData);
  if (!resultado.ok) return { errores: resultado.errores };

  await prisma.gasto.create({ data: resultado.datos });

  // Le avisamos a Next.js que los datos de "/" cambiaron, para que vuelva
  // a generar la pagina y el gasto nuevo aparezca en la lista.
  revalidatePath("/");

  return { exito: true };
}

export async function actualizarGasto(
  id: string,
  _estadoPrevio: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await exigirSesion();

  const resultado = validar(formData);
  if (!resultado.ok) return { errores: resultado.errores };

  await prisma.gasto.update({
    where: { id },
    data: resultado.datos,
  });

  revalidatePath("/");

  // redirect() corta la ejecucion aca y manda al usuario a la lista.
  redirect("/");
}

export async function eliminarGasto(id: string) {
  await exigirSesion();

  await prisma.gasto.delete({ where: { id } });
  revalidatePath("/");
}
