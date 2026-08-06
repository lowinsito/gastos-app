// Capa de acceso a datos autenticada.
//
// La regla de oro: el chequeo de sesion va lo mas cerca posible de los
// datos, no en el layout ni en un componente de arriba. Un layout no
// impide que las paginas de adentro se ejecuten, y las Server Actions se
// pueden invocar directo sin pasar por ninguna pantalla.
//
// Poniendo el chequeo aca, cualquier parte de la app que quiera saber
// quien es el usuario tiene que pasar por esta funcion. No hay forma de
// olvidarse.
import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { obtenerSesion, type DatosSesion } from "@/lib/sesion";

/**
 * Devuelve la sesion o manda al login.
 *
 * `cache` de React memoriza el resultado durante un mismo renderizado:
 * si diez componentes la llaman para dibujar una pagina, la cookie se
 * lee y se verifica una sola vez.
 */
export const exigirSesion = cache(async (): Promise<DatosSesion> => {
  const sesion = await obtenerSesion();

  if (!sesion) {
    redirect("/login");
  }

  return sesion;
});

/** Como se muestra cada persona en pantalla. */
export const NOMBRES: Record<DatosSesion["persona"], string> = {
  JOSE: "Jose",
  CAMILA: "Camila",
};
