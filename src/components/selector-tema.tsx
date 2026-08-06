"use client";

import { useLayoutEffect, useState } from "react";

export const CLAVE_TEMA = "tema";

const OPCIONES = [
  { valor: "claro", etiqueta: "Claro", icono: "☀" },
  { valor: "oscuro", etiqueta: "Oscuro", icono: "☾" },
  { valor: "sistema", etiqueta: "Como el sistema", icono: "◐" },
] as const;

type Tema = (typeof OPCIONES)[number]["valor"];

function aplicar(tema: Tema) {
  if (tema === "sistema") {
    document.documentElement.removeAttribute("data-theme");
  } else {
    document.documentElement.setAttribute("data-theme", tema);
  }
}

export function SelectorTema() {
  // El inicializador es una funcion (no un valor) a proposito: asi se
  // ejecuta una sola vez, y en el servidor —donde no existe localStorage—
  // devuelve "sistema" sin romper.
  const [tema, setTema] = useState<Tema>(() => {
    if (typeof window === "undefined") return "sistema";
    const guardado = window.localStorage.getItem(CLAVE_TEMA);
    return guardado === "claro" || guardado === "oscuro" ? guardado : "sistema";
  });

  // En desarrollo, React vuelve a montar los componentes una vez para
  // detectar errores, y al hacerlo borra los atributos que puso el script
  // del <head>. Esto los repone. En produccion no hace nada.
  useLayoutEffect(() => {
    aplicar(tema);
  }, [tema]);

  function elegir(nuevo: Tema) {
    setTema(nuevo);
    aplicar(nuevo);
    window.localStorage.setItem(CLAVE_TEMA, nuevo);
  }

  return (
    <div
      role="group"
      aria-label="Tema de la aplicación"
      className="flex items-center gap-0.5 rounded-full border border-borde p-0.5"
    >
      {OPCIONES.map((opcion) => {
        const activa = tema === opcion.valor;

        return (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => elegir(opcion.valor)}
            // aria-pressed le dice a un lector de pantalla cual esta
            // elegido. El color de fondo solo no se lo transmite.
            aria-pressed={activa}
            title={opcion.etiqueta}
            className={`size-7 rounded-full text-xs leading-none transition-colors ${
              activa
                ? "bg-acento-suave text-acento"
                : "text-texto-suave hover:text-texto"
            }`}
          >
            <span aria-hidden="true">{opcion.icono}</span>
            <span className="sr-only">{opcion.etiqueta}</span>
          </button>
        );
      })}
    </div>
  );
}
