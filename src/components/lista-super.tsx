"use client";

import { useOptimistic, useRef, useState, useTransition } from "react";
import {
  agregarItem,
  alternarItem,
  eliminarItem,
  vaciarComprados,
} from "@/lib/acciones-lista";
import { LARGO_MAXIMO_ITEM } from "@/lib/lista";

/**
 * Lo minimo que la pantalla necesita de cada item.
 * La pagina nos manda solo estos tres campos y no la fila entera: todo lo
 * que le pasemos a un Client Component viaja por internet hasta el
 * celular, asi que no mandamos lo que no se usa.
 */
export type ItemLista = {
  id: string;
  nombre: string;
  comprado: boolean;
};

/** Las cosas que le pueden pasar a la lista antes de que conteste el servidor. */
type Cambio =
  | { tipo: "agregar"; nombre: string; id: string }
  | { tipo: "alternar"; id: string; comprado: boolean }
  | { tipo: "eliminar"; id: string }
  | { tipo: "vaciar" };

/**
 * Los tildados van al final, y dentro de cada grupo se respeta el orden
 * en que llegaron. `sort` en JavaScript es estable, o sea que no revuelve
 * los elementos que empatan, asi que con comparar el tildecito alcanza.
 */
function ordenar(items: ItemLista[]): ItemLista[] {
  return [...items].sort((a, b) => Number(a.comprado) - Number(b.comprado));
}

export function ListaSuper({ items }: { items: ItemLista[] }) {
  const [error, setError] = useState<string | null>(null);
  const formularioRef = useRef<HTMLFormElement>(null);

  // useTransition nos deja avisarle a React "lo que viene es una
  // actualizacion en curso". Es lo que habilita el truco de abajo.
  const [, iniciar] = useTransition();

  /**
   * ACA ESTA LA MAGIA.
   *
   * Sin esto, tildar un item seria: tocas -> viaja al servidor -> se
   * guarda -> vuelve la pagina nueva -> recien ahi se tacha. Con la senal
   * del super eso puede tardar dos segundos, y en el medio parece roto.
   *
   * useOptimistic nos da una version "como va a quedar" de la lista.
   * Dibujamos esa, no la del servidor. El tilde aparece al instante y la
   * ida al servidor pasa por atras. Cuando el servidor contesta, React
   * tira la version optimista y se queda con la real: si algo fallo, la
   * pantalla vuelve sola a como estaba.
   */
  const [listaEnPantalla, aplicarCambio] = useOptimistic(
    items,
    (actuales: ItemLista[], cambio: Cambio) => {
      switch (cambio.tipo) {
        case "agregar":
          return ordenar([
            ...actuales,
            { id: cambio.id, nombre: cambio.nombre, comprado: false },
          ]);
        case "alternar":
          return ordenar(
            actuales.map((item) =>
              item.id === cambio.id
                ? { ...item, comprado: cambio.comprado }
                : item,
            ),
          );
        case "eliminar":
          return actuales.filter((item) => item.id !== cambio.id);
        case "vaciar":
          return actuales.filter((item) => !item.comprado);
      }
    },
  );

  const faltan = listaEnPantalla.filter((item) => !item.comprado).length;
  const comprados = listaEnPantalla.length - faltan;

  // --- Las acciones -----------------------------------------------------
  // Todas siguen el mismo molde: primero pintamos el cambio en pantalla,
  // despues esperamos al servidor. El `await` tiene que estar DENTRO de la
  // transicion: mientras haya algo pendiente, React mantiene la version
  // optimista en pantalla.

  async function enviarFormulario(formData: FormData) {
    const nombre = String(formData.get("nombre") ?? "").trim();
    if (nombre === "") return;

    // Limpiamos el campo antes de esperar nada, asi podes escribir el
    // siguiente item sin pausa. En el super se cargan de a varios.
    formularioRef.current?.reset();
    setError(null);

    // Un id inventado, solo para que React pueda distinguir esta fila
    // mientras el servidor le asigna el de verdad.
    aplicarCambio({ tipo: "agregar", nombre, id: crypto.randomUUID() });

    const problema = await agregarItem(nombre);
    if (problema) setError(problema);
  }

  function alternar(item: ItemLista) {
    iniciar(async () => {
      aplicarCambio({ tipo: "alternar", id: item.id, comprado: !item.comprado });
      await alternarItem(item.id, !item.comprado);
    });
  }

  function eliminar(id: string) {
    iniciar(async () => {
      aplicarCambio({ tipo: "eliminar", id });
      await eliminarItem(id);
    });
  }

  function vaciar() {
    iniciar(async () => {
      aplicarCambio({ tipo: "vaciar" });
      await vaciarComprados();
    });
  }

  return (
    <div>
      {/* --- Agregar ----------------------------------------------------
          Un <form> de verdad y no un boton suelto: en el celular, el
          teclado muestra "Enter" y podes encadenar items sin tocar la
          pantalla. Ademas anda aunque el JavaScript todavia no cargo. */}
      <form
        ref={formularioRef}
        action={enviarFormulario}
        className="flex gap-2"
      >
        <input
          type="text"
          name="nombre"
          placeholder="Agregar a la lista…"
          maxLength={LARGO_MAXIMO_ITEM}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-xl border border-borde bg-superficie px-3 py-2.5 text-sm text-texto outline-none focus:border-acento"
        />
        <button
          type="submit"
          className="shrink-0 rounded-xl bg-acento px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Agregar
        </button>
      </form>

      {error && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* --- Resumen de dos numeros ------------------------------------ */}
      <div className="mt-6 mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-texto-suave">
          {faltan === 0
            ? "No falta nada 🎉"
            : `Faltan ${faltan} ${faltan === 1 ? "cosa" : "cosas"}`}
          {comprados > 0 && ` · ${comprados} en el carrito`}
        </p>

        {comprados > 0 && <BotonVaciar cantidad={comprados} alVaciar={vaciar} />}
      </div>

      {/* --- La lista --------------------------------------------------- */}
      {listaEnPantalla.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-borde p-10 text-center text-sm text-texto-suave">
          La lista está vacía. Escribí lo primero que falte acá arriba 👆
        </p>
      ) : (
        <ul className="overflow-hidden rounded-2xl border border-borde bg-superficie">
          {listaEnPantalla.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-borde px-2 last:border-b-0"
            >
              {/* Toda la fila es una etiqueta del casillero: tocando en
                  cualquier lado se tilda. Un cuadradito de 16px es muy
                  chico para acertarle con el dedo en el super. */}
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 py-3.5 pl-2">
                <input
                  type="checkbox"
                  checked={item.comprado}
                  onChange={() => alternar(item)}
                  className="size-5 shrink-0 rounded accent-[var(--acento)]"
                />
                <span
                  className={`truncate text-sm transition-colors ${
                    item.comprado
                      ? "text-texto-suave line-through"
                      : "text-texto"
                  }`}
                >
                  {item.nombre}
                </span>
              </label>

              <button
                type="button"
                onClick={() => eliminar(item.id)}
                // El texto del boton es un simbolo, asi que necesita una
                // etiqueta aparte para quien usa lector de pantalla.
                aria-label={`Sacar ${item.nombre} de la lista`}
                className="shrink-0 px-3 py-3 text-texto-suave transition-colors hover:text-red-600 dark:hover:text-red-400"
              >
                <svg
                  viewBox="0 0 20 20"
                  className="size-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  aria-hidden="true"
                >
                  <path d="M6 6 L14 14 M14 6 L6 14" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Vaciar borra varias cosas de un saque y no se puede deshacer, asi que
 * pide confirmacion. Es el mismo criterio que el boton de eliminar un
 * gasto: los botones que borran de a uno van directo, los que borran en
 * masa preguntan.
 */
function BotonVaciar({
  cantidad,
  alVaciar,
}: {
  cantidad: number;
  alVaciar: () => void;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="shrink-0 text-xs text-texto-suave transition-colors hover:text-texto"
      >
        Vaciar comprados
      </button>
    );
  }

  return (
    <span className="flex shrink-0 items-center gap-3 whitespace-nowrap">
      <button
        type="button"
        onClick={() => {
          setConfirmando(false);
          alVaciar();
        }}
        className="text-xs font-medium text-red-600 dark:text-red-400"
      >
        Borrar {cantidad}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="text-xs text-texto-suave transition-colors hover:text-texto"
      >
        Cancelar
      </button>
    </span>
  );
}
