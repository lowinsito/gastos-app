// "use client" marca este archivo como Client Component: su codigo viaja al
// navegador. Lo necesitamos porque el formulario tiene interactividad —la
// casilla de "lo pagamos entre los dos" muestra y esconde campos— y eso
// requiere estado, que solo existe del lado del cliente.
"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { EstadoFormulario } from "@/lib/acciones";
import { ETIQUETAS_CATEGORIA } from "@/lib/formato";
import type { Categoria } from "@/generated/prisma/enums";

/**
 * Valores con los que arranca el formulario cuando editamos.
 * Son todos texto porque es lo que entienden los <input>. La pagina que
 * usa este componente se encarga de convertir desde la base.
 */
export type ValoresGasto = {
  fecha: string;
  descripcion: string;
  categoria: Categoria | "";
  pusoJose: string;
  pusoCamila: string;
  observaciones: string;
};

type Props = {
  accion: (
    estado: EstadoFormulario,
    formData: FormData,
  ) => Promise<EstadoFormulario>;
  valores?: ValoresGasto;
  textoBoton: string;
  /** Al crear conviene vaciar los campos; al editar nos vamos de la pagina. */
  limpiarAlGuardar?: boolean;
};

const ESTADO_INICIAL: EstadoFormulario = {};

/** Fecha de hoy en formato "2026-08-06", que es el que espera input[type=date]. */
function hoyEnTextoISO() {
  return new Date().toISOString().slice(0, 10);
}

export function FormularioGasto({
  accion,
  valores,
  textoBoton,
  limpiarAlGuardar = false,
}: Props) {
  // Si el gasto que estamos editando tiene plata de los dos, arrancamos
  // directamente en modo compartido.
  const [compartido, setCompartido] = useState(
    () => Number(valores?.pusoJose ?? 0) > 0 && Number(valores?.pusoCamila ?? 0) > 0,
  );
  const formularioRef = useRef<HTMLFormElement>(null);

  // useActionState conecta el formulario con la Server Action.
  //   estado    -> lo que devolvio la accion (errores o exito)
  //   enviar    -> lo que le pasamos al <form action={...}>
  //   enviando  -> true mientras el servidor esta procesando
  const [estado, enviar, enviando] = useActionState(accion, ESTADO_INICIAL);

  // Cuando el gasto se guarda bien, limpiamos los campos.
  // No tocamos `compartido` a proposito: si acabas de cargar un gasto
  // compartido, lo mas probable es que el siguiente tambien lo sea.
  useEffect(() => {
    if (estado.exito && limpiarAlGuardar) {
      formularioRef.current?.reset();
    }
  }, [estado, limpiarAlGuardar]);

  // Cuanto puso cada uno, para precargar los campos al editar.
  const montoJose = valores?.pusoJose ?? "";
  const montoCamila = valores?.pusoCamila ?? "";
  const pagadorInicial = Number(montoCamila) > 0 ? "CAMILA" : "JOSE";
  const montoSimple = Number(montoCamila) > 0 ? montoCamila : montoJose;

  return (
    <form
      ref={formularioRef}
      action={enviar}
      className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="Fecha" error={estado.errores?.fecha}>
          <input
            type="date"
            name="fecha"
            defaultValue={valores?.fecha ?? hoyEnTextoISO()}
            className={CLASES_INPUT}
          />
        </Campo>

        <Campo etiqueta="Categoría" error={estado.errores?.categoria}>
          <select
            name="categoria"
            defaultValue={valores?.categoria ?? ""}
            className={CLASES_INPUT}
          >
            <option value="" disabled>
              Elegí una…
            </option>
            {Object.entries(ETIQUETAS_CATEGORIA).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </Campo>

        <div className="sm:col-span-2">
          <Campo etiqueta="Descripción" error={estado.errores?.descripcion}>
            <input
              type="text"
              name="descripcion"
              defaultValue={valores?.descripcion ?? ""}
              placeholder="Supermercado Coto"
              maxLength={200}
              className={CLASES_INPUT}
            />
          </Campo>
        </div>
      </div>

      {/* El campo `modo` viaja escondido para que el servidor sepa como leer
          los montos. Nunca confiamos solo en lo que ve el usuario. */}
      <input
        type="hidden"
        name="modo"
        value={compartido ? "compartido" : "simple"}
      />

      <div className="mt-4 rounded-md bg-zinc-50 p-4 dark:bg-zinc-950/50">
        {compartido ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Puso Jose" error={estado.errores?.pusoJose}>
              <input
                type="number"
                name="pusoJose"
                defaultValue={montoJose}
                min="0"
                step="0.01"
                placeholder="0"
                className={CLASES_INPUT}
              />
            </Campo>
            <Campo etiqueta="Puso Camila" error={estado.errores?.pusoCamila}>
              <input
                type="number"
                name="pusoCamila"
                defaultValue={montoCamila}
                min="0"
                step="0.01"
                placeholder="0"
                className={CLASES_INPUT}
              />
            </Campo>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo etiqueta="Pagó" error={estado.errores?.pagador}>
              <div className="flex gap-4 pt-1.5">
                <Radio
                  nombre="pagador"
                  valor="JOSE"
                  etiqueta="Jose"
                  porDefecto={pagadorInicial === "JOSE"}
                />
                <Radio
                  nombre="pagador"
                  valor="CAMILA"
                  etiqueta="Camila"
                  porDefecto={pagadorInicial === "CAMILA"}
                />
              </div>
            </Campo>
            <Campo etiqueta="Monto" error={estado.errores?.monto}>
              <input
                type="number"
                name="monto"
                defaultValue={montoSimple}
                min="0"
                step="0.01"
                placeholder="0"
                className={CLASES_INPUT}
              />
            </Campo>
          </div>
        )}

        <label className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <input
            type="checkbox"
            checked={compartido}
            onChange={(evento) => setCompartido(evento.target.checked)}
            className="size-4 rounded border-zinc-300 dark:border-zinc-700"
          />
          Lo pagamos entre los dos
        </label>
      </div>

      <div className="mt-4">
        <Campo
          etiqueta="Observaciones (opcional)"
          error={estado.errores?.observaciones}
        >
          <input
            type="text"
            name="observaciones"
            defaultValue={valores?.observaciones ?? ""}
            maxLength={500}
            className={CLASES_INPUT}
          />
        </Campo>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="submit"
          disabled={enviando}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {enviando ? "Guardando…" : textoBoton}
        </button>

        {estado.exito && limpiarAlGuardar && (
          <span className="text-sm text-green-600 dark:text-green-500">
            Gasto guardado ✓
          </span>
        )}
      </div>
    </form>
  );
}

// --- Piezas chicas reutilizables -------------------------------------

const CLASES_INPUT =
  "w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100";

function Campo({
  etiqueta,
  error,
  children,
}: {
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {etiqueta}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-red-600 dark:text-red-400">
          {error}
        </span>
      )}
    </label>
  );
}

function Radio({
  nombre,
  valor,
  etiqueta,
  porDefecto,
}: {
  nombre: string;
  valor: string;
  etiqueta: string;
  porDefecto?: boolean;
}) {
  return (
    <label className="flex items-center gap-1.5 text-sm text-zinc-700 dark:text-zinc-300">
      <input
        type="radio"
        name={nombre}
        value={valor}
        defaultChecked={porDefecto}
        className="size-4"
      />
      {etiqueta}
    </label>
  );
}
