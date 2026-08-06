import Link from "next/link";
import type { GastoModel } from "@/generated/prisma/models";
import {
  ETIQUETAS_CATEGORIA,
  aCentavos,
  formatearCentavos,
  formatearFecha,
} from "@/lib/formato";
import { BotonEliminar } from "@/components/boton-eliminar";

/**
 * La lista de gastos, como tarjetas en lugar de una tabla.
 *
 * Una tabla de siete columnas necesita ~800px de ancho. Un celular tiene
 * ~350px, asi que las ultimas columnas —incluidos los botones de editar y
 * eliminar— quedaban fuera de la pantalla y no habia forma de llegar.
 *
 * Con tarjetas, cada gasto ocupa el ancho que haya: en el celular se apila
 * en varias lineas y en la computadora se estira en una sola.
 */
export function ListaGastos({ gastos }: { gastos: GastoModel[] }) {
  return (
    <ul className="space-y-2">
      {gastos.map((gasto) => {
        const jose = aCentavos(gasto.pusoJose);
        const camila = aCentavos(gasto.pusoCamila);
        const total = jose + camila;

        // Quien puso la plata, en una linea corta.
        const quienPuso =
          jose > 0 && camila > 0
            ? `Jose ${formatearCentavos(jose)} · Camila ${formatearCentavos(camila)}`
            : jose > 0
              ? "Puso Jose"
              : "Puso Camila";

        return (
          <li
            key={gasto.id}
            className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {gasto.descripcion}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                  {formatearFecha(gasto.fecha)} ·{" "}
                  {ETIQUETAS_CATEGORIA[gasto.categoria]}
                </p>
              </div>

              <p className="shrink-0 font-semibold tabular-nums whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                {formatearCentavos(total)}
              </p>
            </div>

            {gasto.observaciones && (
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                {gasto.observaciones}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {quienPuso}
              </span>

              {/* Los botones van SIEMPRE visibles, sin importar el ancho. */}
              <span className="flex shrink-0 items-center gap-4">
                <Link
                  href={`/gastos/${gasto.id}/editar`}
                  className="text-xs text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  Editar
                </Link>
                <BotonEliminar id={gasto.id} />
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
