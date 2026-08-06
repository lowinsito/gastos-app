// Importacion unica de los gastos que Jose y Camila venian llevando en una
// planilla, entre junio y agosto de 2026.
//
// Se ejecuta con:  npm run importar
//
// La planilla tenia una columna COSTO y dos columnas con cuanto puso cada
// uno ("TOTAL GORDA" = Camila, "TOTAL JOSE"). Como en las filas de "Ambos"
// las dos columnas suman exactamente el costo, se corresponden con los
// campos pusoCamila y pusoJose del modelo.
//
// Los montos van como TEXTO, no como numeros: asi Prisma los convierte
// directo a Decimal sin pasar por los decimales binarios de JavaScript.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const gastos = [
  // --- Junio 2026 ---
  { fecha: "2026-06-17", descripcion: "Súper", categoria: "SUPERMERCADO", pusoJose: "0", pusoCamila: "33600" },
  { fecha: "2026-06-17", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "0", pusoCamila: "30000" },
  { fecha: "2026-06-19", descripcion: "Garrafa", categoria: "SERVICIOS", pusoJose: "30500", pusoCamila: "67500" },
  { fecha: "2026-06-20", descripcion: "Súper", categoria: "SUPERMERCADO", pusoJose: "26000", pusoCamila: "0" },
  { fecha: "2026-06-22", descripcion: "Súper", categoria: "SUPERMERCADO", pusoJose: "17500", pusoCamila: "0" },
  { fecha: "2026-06-24", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "0", pusoCamila: "30000" },
  { fecha: "2026-06-24", descripcion: "Súper", categoria: "SUPERMERCADO", pusoJose: "17000", pusoCamila: "0" },

  // --- Julio 2026 ---
  { fecha: "2026-07-01", descripcion: "Súper y milanesas", categoria: "SUPERMERCADO", pusoJose: "79000", pusoCamila: "0" },
  { fecha: "2026-07-01", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "20000", pusoCamila: "5000" },
  { fecha: "2026-07-05", descripcion: "EPE", categoria: "SERVICIOS", pusoJose: "0", pusoCamila: "124200" },
  { fecha: "2026-07-08", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "0", pusoCamila: "25000" },
  { fecha: "2026-07-21", descripcion: "Empanadas pasta mi", categoria: "SUPERMERCADO", pusoJose: "14000", pusoCamila: "0", observaciones: "Descripción cortada en la planilla original" },
  { fecha: "2026-07-22", descripcion: "Súper", categoria: "SUPERMERCADO", pusoJose: "0", pusoCamila: "70000" },
  { fecha: "2026-07-22", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "0", pusoCamila: "25000" },
  { fecha: "2026-07-23", descripcion: "Milanesas", categoria: "SUPERMERCADO", pusoJose: "29000", pusoCamila: "5000" },
  { fecha: "2026-07-28", descripcion: "La Anónima", categoria: "SUPERMERCADO", pusoJose: "21000", pusoCamila: "0" },
  { fecha: "2026-07-29", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "0", pusoCamila: "25000" },
  { fecha: "2026-07-29", descripcion: "Carnicería", categoria: "SUPERMERCADO", pusoJose: "68500", pusoCamila: "0" },
  { fecha: "2026-07-29", descripcion: "Lomo sample", categoria: "SUPERMERCADO", pusoJose: "25000", pusoCamila: "0" },
  { fecha: "2026-07-30", descripcion: "Calefón", categoria: "HOGAR", pusoJose: "0", pusoCamila: "60000" },

  // --- Agosto 2026 ---
  { fecha: "2026-08-04", descripcion: "Personal", categoria: "SERVICIOS", pusoJose: "0", pusoCamila: "55000" },
  { fecha: "2026-08-05", descripcion: "Graciela (limpieza)", categoria: "HOGAR", pusoJose: "0", pusoCamila: "25000" },
] as const;

async function main() {
  const existentes = await prisma.gasto.count();
  if (existentes > 0) {
    console.error("");
    console.error(`  La base ya tiene ${existentes} gastos.`);
    console.error("  Importar ahora dejaria todo duplicado. Abortado.");
    console.error("");
    process.exit(1);
  }

  const { count } = await prisma.gasto.createMany({
    data: gastos.map((g) => ({
      fecha: new Date(g.fecha),
      descripcion: g.descripcion,
      categoria: g.categoria,
      pusoJose: g.pusoJose,
      pusoCamila: g.pusoCamila,
      observaciones: "observaciones" in g ? g.observaciones : null,
    })),
  });

  console.log(`Gastos importados: ${count}`);

  // Verificacion: el total en la base tiene que dar lo mismo que la suma
  // de la planilla. Si no coincide, algo se cargo mal.
  const totales = await prisma.gasto.aggregate({
    _sum: { pusoJose: true, pusoCamila: true },
  });
  const jose = Number(totales._sum.pusoJose ?? 0);
  const camila = Number(totales._sum.pusoCamila ?? 0);

  console.log(`Puso Jose:   $${jose.toLocaleString("es-AR")}`);
  console.log(`Puso Camila: $${camila.toLocaleString("es-AR")}`);
  console.log(`Total:       $${(jose + camila).toLocaleString("es-AR")}`);
}

main()
  .catch((error) => {
    console.error("Fallo la importacion:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
