import { obtenerSesion } from "@/lib/sesion";
import { NOMBRES } from "@/lib/autenticacion";
import { EnlacesNavegacion } from "@/components/enlaces-navegacion";
import { BotonSalir } from "@/components/boton-salir";

/**
 * Server Component: lee la sesion en el servidor. Solo la parte que
 * necesita saber en que pagina estamos (para resaltar el enlace activo)
 * viaja al navegador, en un componente aparte.
 */
export async function Navegacion() {
  const sesion = await obtenerSesion();

  // Sin sesion no hay nada que navegar: estas en el login.
  if (!sesion) return null;

  return (
    <nav className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Logo />
        <EnlacesNavegacion />

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-texto-suave sm:inline">
            {NOMBRES[sesion.persona]}
          </span>
          <BotonSalir />
        </div>
      </div>
    </nav>
  );
}

/**
 * El logo es un SVG escrito a mano en lugar de una imagen.
 * Un SVG se dibuja con formulas, asi que se ve nitido en cualquier tamano
 * y en cualquier pantalla, y pesa unos pocos cientos de bytes.
 */
function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="mr-1 size-7 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-acento" />
      <path
        d="M16 7 L26 15 L23.5 15 L23.5 25 L8.5 25 L8.5 15 L6 15 Z"
        className="fill-fondo"
      />
      <path
        d="M16 22.2 C16 22.2 12.2 19.9 12.2 17.7 C12.2 16.5 13.1 15.6 14.2 15.6 C14.9 15.6 15.6 16 16 16.5 C16.4 16 17.1 15.6 17.8 15.6 C18.9 15.6 19.8 16.5 19.8 17.7 C19.8 19.9 16 22.2 16 22.2 Z"
        className="fill-acento"
      />
    </svg>
  );
}
