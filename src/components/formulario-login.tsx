"use client";

import { useActionState } from "react";
import { iniciarSesion, type EstadoLogin } from "@/lib/acciones-sesion";

const ESTADO_INICIAL: EstadoLogin = {};

export function FormularioLogin() {
  const [estado, enviar, enviando] = useActionState(
    iniciarSesion,
    ESTADO_INICIAL,
  );

  return (
    <form action={enviar} className="space-y-4">
      <fieldset>
        <legend className="mb-2 block text-xs font-medium text-texto-suave">
          ¿Quién sos?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          <Opcion valor="JOSE" etiqueta="Jose" />
          <Opcion valor="CAMILA" etiqueta="Camila" />
        </div>
      </fieldset>

      <label className="block">
        <span className="mb-1 block text-xs font-medium text-texto-suave">
          Contraseña
        </span>
        <input
          type="password"
          name="clave"
          // El navegador lo usa para ofrecer la clave guardada.
          autoComplete="current-password"
          className="w-full rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto outline-none focus:border-acento"
        />
      </label>

      {estado.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{estado.error}</p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-full bg-acento px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

/** Una tarjeta-radio para elegir persona, mas comoda de tocar en el celular. */
function Opcion({ valor, etiqueta }: { valor: string; etiqueta: string }) {
  return (
    <label className="cursor-pointer">
      <input
        type="radio"
        name="persona"
        value={valor}
        // "peer" le permite al div de al lado reaccionar al estado de este
        // input, sin necesidad de JavaScript ni de estado en React.
        className="peer sr-only"
      />
      <div className="rounded-xl border border-borde px-4 py-3 text-center text-sm text-texto-suave transition-colors peer-checked:border-acento peer-checked:bg-acento-suave peer-checked:font-medium peer-checked:text-acento">
        {etiqueta}
      </div>
    </label>
  );
}
