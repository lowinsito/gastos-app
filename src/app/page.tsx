import { prisma } from "@/lib/prisma";
import { crearGasto } from "@/lib/acciones";
import { mesesConGastos, resolverFiltros } from "@/lib/consultas";
import { FormularioGasto } from "@/components/formulario-gasto";
import { Filtros } from "@/components/filtros";
import { ListaGastos } from "@/components/lista-gastos";

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
          <ListaGastos gastos={gastos} />
        )}
      </div>
    </div>
  );
}
