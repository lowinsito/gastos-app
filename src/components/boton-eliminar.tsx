"use client";

import { useState, useTransition } from "react";
import { eliminarGasto } from "@/lib/acciones";

/**
 * Borrar es irreversible, asi que pedimos confirmacion: el primer clic
 * cambia el boton por "Confirmar / Cancelar" en lugar de borrar de una.
 *
 * Preferimos esto antes que el confirm() del navegador porque se ve como
 * el resto de la app y no bloquea la pagina entera.
 */
export function BotonEliminar({ id }: { id: string }) {
  const [confirmando, setConfirmando] = useState(false);

  // useTransition nos da un indicador de "esto esta en curso" para
  // acciones que no salen de un <form>.
  const [borrando, iniciarBorrado] = useTransition();

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="text-xs text-texto-suave transition-colors hover:text-red-600 dark:hover:text-red-400"
      >
        Eliminar
      </button>
    );
  }

  return (
    <span className="flex items-center justify-end gap-3 whitespace-nowrap">
      <button
        type="button"
        disabled={borrando}
        onClick={() => iniciarBorrado(() => eliminarGasto(id))}
        className="text-xs font-medium text-red-600 disabled:opacity-50 dark:text-red-400"
      >
        {borrando ? "Borrando…" : "Confirmar"}
      </button>
      <button
        type="button"
        disabled={borrando}
        onClick={() => setConfirmando(false)}
        className="text-xs text-texto-suave transition-colors hover:text-texto"
      >
        Cancelar
      </button>
    </span>
  );
}
