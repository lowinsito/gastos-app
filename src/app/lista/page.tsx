import { prisma } from "@/lib/prisma";
import { exigirSesion } from "@/lib/autenticacion";
import { ListaSuper } from "@/components/lista-super";

export const metadata = {
  title: "Lista del súper",
};

/**
 * Server Component: corre en el servidor, lee la base y manda el
 * resultado ya cocinado. El navegador nunca ve la consulta.
 */
export default async function Lista() {
  await exigirSesion();

  const items = await prisma.itemLista.findMany({
    // Primero lo que falta comprar y despues lo tildado; dentro de cada
    // grupo, por orden de carga. Es exactamente el orden del indice que
    // creamos en el schema, asi que la base ya lo tiene resuelto.
    orderBy: [{ comprado: "asc" }, { creadoEn: "asc" }],
    // Pedimos solo las tres columnas que la pantalla usa. `creadoEn` sirve
    // para ordenar pero no se muestra, asi que no hace falta que viaje
    // hasta el celular.
    select: { id: true, nombre: true, comprado: true },
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-texto">
          Lista del súper
        </h1>
        <p className="mt-1 text-sm text-texto-suave">
          Lo que agregue cualquiera de los dos le aparece al otro.
        </p>
      </header>

      <ListaSuper items={items} />
    </div>
  );
}
