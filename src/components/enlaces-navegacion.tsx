"use client";

import { useEffect, useRef } from "react";
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
  const enlaceActivoRef = useRef<HTMLAnchorElement>(null);

  // En un celular angosto los tres enlaces no entran, asi que la fila se
  // desplaza. Sin esto podias estar parado en "Súper" con el enlace de
  // "Súper" fuera de la pantalla, que es justo el que te dice donde estas.
  //
  // block: "nearest" es importante: sin eso, el navegador tambien mueve la
  // pagina verticalmente para acomodar el enlace, y la lista de gastos
  // arrancaria movida.
  useEffect(() => {
    enlaceActivoRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
    });
  }, [rutaActual]);

  // min-w-0 + overflow-x-auto: si los enlaces no entran, se desplazan
  // ELLOS en lugar de estirar la pagina entera. Sin `min-w-0` no funciona:
  // por defecto un elemento flexible se niega a achicarse mas alla de su
  // contenido, y termina empujando todo hacia afuera.
  // Las dos clases entre corchetes esconden la barra de desplazamiento,
  // que en una barra de navegacion se ve fea.
  return (
    <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {SECCIONES.map((seccion) => {
        const activa = rutaActual === seccion.href;

        return (
          <Link
            key={seccion.href}
            href={seccion.href}
            ref={activa ? enlaceActivoRef : undefined}
            // aria-current le avisa a los lectores de pantalla cual es la
            // pagina actual. El color solo no alcanza: alguien que no ve
            // la pantalla necesita esa informacion igual.
            aria-current={activa ? "page" : undefined}
            className={`my-3 rounded-full px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors sm:px-3 ${
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
