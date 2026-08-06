"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/resumen", texto: "Resumen" },
  { href: "/", texto: "Gastos" },
];

/**
 * Necesita ser Client Component por una sola razon: usePathname, que nos
 * dice en que pagina estamos para resaltar el enlace correspondiente.
 * Sin eso, seria un Server Component.
 */
export function Navegacion() {
  const rutaActual = usePathname();

  return (
    <nav className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-5xl items-center gap-2 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 py-3 pr-3">
          <Logo />
          <span className="text-sm font-semibold text-texto">Nuestra casa</span>
        </Link>

        <div className="flex items-center gap-1">
          {SECCIONES.map((seccion) => {
            const activa = rutaActual === seccion.href;

            return (
              <Link
                key={seccion.href}
                href={seccion.href}
                // aria-current le avisa a los lectores de pantalla cual es la
                // pagina actual. El color solo no alcanza: alguien que no ve
                // la pantalla necesita esa informacion igual.
                aria-current={activa ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  activa
                    ? "bg-acento-suave text-acento"
                    : "text-texto-suave hover:text-texto"
                }`}
              >
                {seccion.texto}
              </Link>
            );
          })}
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
    <svg
      viewBox="0 0 32 32"
      className="size-7 shrink-0"
      // aria-hidden porque el texto de al lado ya dice "Nuestra casa": un
      // lector de pantalla que lea las dos cosas seria repetitivo.
      aria-hidden="true"
    >
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
