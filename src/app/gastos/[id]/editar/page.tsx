import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { exigirSesion } from "@/lib/autenticacion";
import { actualizarGasto } from "@/lib/acciones";
import { FormularioGasto } from "@/components/formulario-gasto";

// La carpeta se llama [id], asi que esta pagina responde a CUALQUIER
// direccion tipo /gastos/lo-que-sea/editar. El valor entre corchetes llega
// en `params`, que en Next.js 16 es una promesa: hay que esperarla.
export default async function EditarGastoPage({
  params,
}: PageProps<"/gastos/[id]/editar">) {
  await exigirSesion();

  const { id } = await params;

  const gasto = await prisma.gasto.findUnique({ where: { id } });

  // Si alguien escribe un id que no existe, mostramos la pagina 404 en
  // lugar de reventar.
  if (!gasto) {
    notFound();
  }

  // El formulario es un Client Component, y a esos solo se les pueden pasar
  // datos simples. Los Decimal de Prisma son objetos, asi que los pasamos a
  // texto antes de cruzar la frontera servidor -> cliente.
  const valores = {
    fecha: gasto.fecha.toISOString().slice(0, 10),
    descripcion: gasto.descripcion,
    categoria: gasto.categoria,
    pusoJose: gasto.pusoJose.toString(),
    pusoCamila: gasto.pusoCamila.toString(),
    observaciones: gasto.observaciones ?? "",
  };

  // .bind() deja el id "pegado" a la accion antes de mandarla al navegador.
  // El id nunca viaja como un campo del formulario, asi que nadie puede
  // cambiarlo desde las herramientas del navegador para editar otro gasto.
  const guardar = actualizarGasto.bind(null, gasto.id);

  return (
    <div>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-6">
          <Link
            href="/"
            className="text-sm text-texto-suave transition-colors hover:text-acento"
          >
            ← Volver a la lista
          </Link>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-texto">
            Editar gasto
          </h1>
        </header>

        <FormularioGasto
          accion={guardar}
          valores={valores}
          textoBoton="Guardar cambios"
        />
      </div>
    </div>
  );
}
