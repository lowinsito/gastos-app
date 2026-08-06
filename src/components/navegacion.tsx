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
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-5xl items-center gap-1 px-4 sm:px-6 lg:px-8">
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
              className={`border-b-2 px-3 py-4 text-sm font-medium transition-colors ${
                activa
                  ? "border-zinc-900 text-zinc-900 dark:border-zinc-100 dark:text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {seccion.texto}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
