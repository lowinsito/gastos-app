import { cerrarSesion } from "@/lib/acciones-sesion";

/**
 * Cerrar sesion va dentro de un <form>, no de un enlace.
 *
 * El motivo no es capricho: un <a href="/salir"> se puede disparar sin
 * que el usuario lo quiera —el navegador precarga enlaces, una extension
 * los visita, alguien te manda esa direccion— y te cerraria la sesion sin
 * que hayas hecho nada. Un formulario POST no se activa solo.
 *
 * Regla general: lo que solo LEE puede ser un enlace; lo que CAMBIA algo
 * va en un formulario.
 */
export function BotonSalir() {
  return (
    <form action={cerrarSesion}>
      <button
        type="submit"
        className="rounded-full px-3 py-1.5 text-sm text-texto-suave transition-colors hover:text-acento"
      >
        Salir
      </button>
    </form>
  );
}
