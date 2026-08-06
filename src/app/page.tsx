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
          <h1 className="text-2xl font-semibold tracking-tight text-texto">
            Gastos de la casa
          </h1>
          <p className="mt-1 text-sm text-texto-suave">
            {gastos.length}{" "}
            {gastos.length === 1 ? "gasto" : "gastos"}
            {hayFiltros ? " con estos filtros" : " en total"}
          </p>
        </header>

        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-texto">
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
          <p className="rounded-2xl border border-dashed border-borde p-10 text-center text-sm text-texto-suave">
            {hayFiltros
              ? "No hay gastos que coincidan con esos filtros."
              : "Todavía no hay gastos cargados. Agregá el primero acá arriba 👆"}
          </p>
        ) : (
          <ListaGastos gastos={gastos} />
        )}
      </div>
    </div>
  );
}
