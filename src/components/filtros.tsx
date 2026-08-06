"use client";

import { useRouter } from "next/navigation";
import { ETIQUETAS_CATEGORIA } from "@/lib/formato";

type Props = {
  /** A que pagina navegar al cambiar un filtro: "/" o "/resumen". */
  ruta: string;
  /** Los meses que realmente tienen gastos, del mas nuevo al mas viejo. */
  meses: { valor: string; etiqueta: string }[];
  mes: string;
  /**
   * Si no se pasa, no se muestra el filtro de categoria.
   * El resumen filtra solo por mes; la lista, por las dos cosas.
   */
  categoria?: string;
};

export function Filtros({ ruta, meses, mes, categoria }: Props) {
  const router = useRouter();
  const conCategoria = categoria !== undefined;

  // Los filtros viven en la direccion del navegador, no en el estado de
  // React. Cambiar un filtro es navegar a otra URL.
  function navegarCon(nuevoMes: string, nuevaCategoria: string) {
    const parametros = new URLSearchParams();
    if (nuevoMes) parametros.set("mes", nuevoMes);
    if (conCategoria && nuevaCategoria) {
      parametros.set("categoria", nuevaCategoria);
    }

    const consulta = parametros.toString();
    router.push(consulta ? `${ruta}?${consulta}` : ruta);
  }

  const hayFiltros = mes !== "" || (categoria ?? "") !== "";

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <label className="block">
        <span className="mb-1 block text-xs font-medium text-texto-suave">
          Mes
        </span>
        <select
          value={mes}
          onChange={(evento) =>
            navegarCon(evento.target.value, categoria ?? "")
          }
          className={CLASES_SELECT}
        >
          <option value="">Todos los meses</option>
          {meses.map((opcion) => (
            <option key={opcion.valor} value={opcion.valor}>
              {opcion.etiqueta}
            </option>
          ))}
        </select>
      </label>

      {conCategoria && (
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-texto-suave">
            Categoría
          </span>
          <select
            value={categoria}
            onChange={(evento) => navegarCon(mes, evento.target.value)}
            className={CLASES_SELECT}
          >
            <option value="">Todas</option>
            {Object.entries(ETIQUETAS_CATEGORIA).map(([valor, etiqueta]) => (
              <option key={valor} value={valor}>
                {etiqueta}
              </option>
            ))}
          </select>
        </label>
      )}

      {hayFiltros && (
        <button
          type="button"
          onClick={() => navegarCon("", "")}
          className="pb-2 text-xs text-acento underline underline-offset-2"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

const CLASES_SELECT =
  "rounded-xl border border-borde bg-superficie px-3 py-2 text-sm text-texto outline-none focus:border-acento";
