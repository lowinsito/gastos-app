import { prisma } from "@/lib/prisma";
import { mesesConGastos, resolverFiltros } from "@/lib/consultas";
import {
  ETIQUETAS_CATEGORIA,
  aCentavos,
  formatearCentavos,
  formatearMes,
} from "@/lib/formato";
import { Filtros } from "@/components/filtros";

export default async function ResumenPage({
  searchParams,
}: PageProps<"/resumen">) {
  const parametros = await searchParams;
  const { mes, donde } = resolverFiltros(parametros);

  // aggregate() y groupBy() hacen que las cuentas las haga PostgreSQL.
  // La alternativa seria traer los 5.000 gastos y sumarlos en JavaScript:
  // funcionaria, pero moveria por la red datos que no vamos a mostrar.
  const [totales, porCategoria, meses] = await Promise.all([
    prisma.gasto.aggregate({
      where: donde,
      _sum: { pusoJose: true, pusoCamila: true },
      _count: true,
    }),
    prisma.gasto.groupBy({
      by: ["categoria"],
      where: donde,
      _sum: { pusoJose: true, pusoCamila: true },
    }),
    mesesConGastos(),
  ]);

  // Todas las cuentas van en centavos enteros para que no haya redondeos.
  const joseCentavos = aCentavos(totales._sum.pusoJose);
  const camilaCentavos = aCentavos(totales._sum.pusoCamila);
  const totalCentavos = joseCentavos + camilaCentavos;

  // Los gastos se reparten 50/50, asi que a cada uno le tocaba la mitad.
  // Quien puso de mas tiene saldo a favor; quien puso de menos, debe.
  const leTocabaACadaUno = Math.round(totalCentavos / 2);
  const balanceJose = joseCentavos - leTocabaACadaUno;

  const categorias = porCategoria
    .map((fila) => ({
      categoria: fila.categoria,
      centavos:
        aCentavos(fila._sum.pusoJose) + aCentavos(fila._sum.pusoCamila),
    }))
    .sort((a, b) => b.centavos - a.centavos);

  const mayorCategoria = categorias[0]?.centavos ?? 0;
  const periodo = mes ? formatearMes(mes) : "todos los meses";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Resumen
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          {totales._count} {totales._count === 1 ? "gasto" : "gastos"} en{" "}
          {periodo}
        </p>
      </header>

      <Filtros ruta="/resumen" meses={meses} mes={mes} />

      {totales._count === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
          No hay gastos en este período.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Tarjeta titulo="Total gastado" centavos={totalCentavos} destacada />
            <Tarjeta titulo="Puso Jose" centavos={joseCentavos} />
            <Tarjeta titulo="Puso Camila" centavos={camilaCentavos} />
          </div>

          <Balance balanceJose={balanceJose} leTocaba={leTocabaACadaUno} />

          <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Gasto por categoría
            </h2>

            <ul className="space-y-3">
              {categorias.map((fila) => {
                const porcentajeDelTotal = (fila.centavos / totalCentavos) * 100;
                // El ancho de la barra es relativo a la categoria mas grande,
                // no al total: asi la mayor ocupa todo el ancho y las
                // diferencias entre las chicas se ven.
                const anchoBarra = (fila.centavos / mayorCategoria) * 100;

                return (
                  <li key={fila.categoria}>
                    <div className="mb-1 flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-zinc-700 dark:text-zinc-300">
                        {ETIQUETAS_CATEGORIA[fila.categoria]}
                      </span>
                      <span className="tabular-nums whitespace-nowrap text-zinc-900 dark:text-zinc-100">
                        {formatearCentavos(fila.centavos)}
                        <span className="ml-2 text-xs text-zinc-400">
                          {porcentajeDelTotal.toFixed(0)}%
                        </span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-zinc-900 dark:bg-zinc-300"
                        style={{ width: `${anchoBarra}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

// --- Piezas de la pagina ---------------------------------------------

function Tarjeta({
  titulo,
  centavos,
  destacada,
}: {
  titulo: string;
  centavos: number;
  destacada?: boolean;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {titulo}
      </p>
      <p
        className={`mt-2 tabular-nums font-semibold text-zinc-900 dark:text-zinc-50 ${
          destacada ? "text-2xl" : "text-xl"
        }`}
      >
        {formatearCentavos(centavos)}
      </p>
    </div>
  );
}

function Balance({
  balanceJose,
  leTocaba,
}: {
  balanceJose: number;
  leTocaba: number;
}) {
  // Un peso de diferencia no vale la pena informarlo como deuda.
  const estanAMano = Math.abs(balanceJose) < 100;

  const deudor = balanceJose > 0 ? "Camila" : "Jose";
  const acreedor = balanceJose > 0 ? "Jose" : "Camila";

  return (
    <section className="mt-4 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Balance
      </p>

      {estanAMano ? (
        <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          Están a mano 🤝
        </p>
      ) : (
        <p className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {deudor} le debe a {acreedor}{" "}
          <span className="tabular-nums">
            {formatearCentavos(Math.abs(balanceJose))}
          </span>
        </p>
      )}

      <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
        Dividido en partes iguales, a cada uno le tocaba{" "}
        {formatearCentavos(leTocaba)}.
      </p>
    </section>
  );
}
