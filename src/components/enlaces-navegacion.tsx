"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECCIONES = [
  { href: "/resumen", texto: "Resumen" },
  { href: "/", texto: "Gastos" },
  { href: "/lista", texto: "Súper" },
];

/**
 * Necesita ser Client Component por una sola razon: usePathname, que nos
 * dice en que pagina estamos para resaltar el enlace correspondiente.
 * Por eso vive aparte del resto de la navegacion, que corre en el
 * servidor: cuanto menos codigo mandemos al navegador, mejor.
 */
export function EnlacesNavegacion() {
  const rutaActual = usePathname();

  return (
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
            className={`my-3 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
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
  );
}
