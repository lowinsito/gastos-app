import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { crearGasto } from "@/lib/acciones";
import { mesesConGastos, resolverFiltros } from "@/lib/consultas";
import {
  ETIQUETAS_CATEGORIA,
  formatearFecha,
  formatearMonto,
} from "@/lib/formato";
import { FormularioGasto } from "@/components/formulario-gasto";
import { BotonEliminar } from "@/components/boton-eliminar";
import { Filtros } from "@/components/filtros";

// Esta funcion es un Server Component: corre en el servidor, nunca en el
// navegador. Por eso puede hablar directo con la base de datos y usar la
// contrasena del .env sin que lleguen al usuario.
export default async function Home({ searchParams }: PageProps<"/">) {
  const parametros = await searchParams;
  const { mes, categoria, donde, hayFiltros } = resolverFiltros(parametros);

  // Las dos consultas son independientes, asi que las lanzamos juntas en
  // lugar de esperar una y despues la otra.
  const [gastos, meses] = await Promise.all([
    prisma.gasto.findMany({ where: donde, orderBy: { fecha: "desc" } }),
    mesesConGastos(),
  ]);

  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gastos de la casa
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {gastos.length}{" "}
            {gastos.length === 1 ? "gasto" : "gastos"}
            {hayFiltros ? " con estos filtros" : " en total"}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Agregar un gasto
          </h2>
          <FormularioGasto
            accion={crearGasto}
            textoBoton="Agregar gasto"
            limpiarAlGuardar
          />
        </section>

        <Filtros ruta="/" meses={meses} mes={mes} categoria={categoria} />

        {gastos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
            {hayFiltros
              ? "No hay gastos que coincidan con esos filtros."
              : "Todavia no hay gastos cargados."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-sm">
              <thead className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Fecha</th>
                  <th className="px-4 py-3 font-medium">Descripcion</th>
                  <th className="px-4 py-3 font-medium">Categoria</th>
                  <th className="px-4 py-3 text-right font-medium">Jose</th>
                  <th className="px-4 py-3 text-right font-medium">Camila</th>
                  <th className="px-4 py-3 text-right font-medium">Total</th>
                  <th className="px-4 py-3 text-right font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {gastos.map((gasto) => {
                  const pusoJose = Number(gasto.pusoJose);
                  const pusoCamila = Number(gasto.pusoCamila);
                  const total = pusoJose + pusoCamila;

                  return (
                    <tr
                      key={gasto.id}
                      className="text-zinc-700 dark:text-zinc-300"
                    >
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums">
                        {formatearFecha(gasto.fecha)}
                      </td>
                      <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        {gasto.descripcion}
                        {gasto.observaciones && (
                          <span className="mt-0.5 block text-xs font-normal text-zinc-400">
                            {gasto.observaciones}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-zinc-100 px-2 py-1 text-xs whitespace-nowrap dark:bg-zinc-800">
                          {ETIQUETAS_CATEGORIA[gasto.categoria]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {pusoJose > 0 ? formatearMonto(pusoJose) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">
                        {pusoCamila > 0 ? formatearMonto(pusoCamila) : "—"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                        {formatearMonto(total)}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <span className="flex items-center justify-end gap-3">
                          <Link
                            href={`/gastos/${gasto.id}/editar`}
                            className="text-xs text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
                          >
                            Editar
                          </Link>
                          <BotonEliminar id={gasto.id} />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
