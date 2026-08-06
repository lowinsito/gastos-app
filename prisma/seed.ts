// Datos de prueba para desarrollo.
// Se ejecuta con:  npm run seed
//
// "Seed" (semilla) es el nombre habitual: sembrar la base con datos
// iniciales para poder trabajar sin cargar todo a mano cada vez.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const gastosDePrueba = [
  {
    fecha: new Date("2026-08-01"),
    descripcion: "Supermercado Coto",
    categoria: "SUPERMERCADO" as const,
    pusoJose: 48500,
    pusoCamila: 0,
  },
  {
    fecha: new Date("2026-08-02"),
    descripcion: "Internet Fibertel",
    categoria: "SERVICIOS" as const,
    pusoJose: 0,
    pusoCamila: 32000,
    observaciones: "Vence el 10 de cada mes",
  },
  {
    fecha: new Date("2026-08-03"),
    descripcion: "Notebook para la casa",
    categoria: "HOGAR" as const,
    pusoJose: 100000,
    pusoCamila: 50000,
    observaciones: "La pagamos entre los dos",
  },
  {
    fecha: new Date("2026-08-03"),
    descripcion: "Alimento para el perro",
    categoria: "MASCOTAS" as const,
    pusoJose: 0,
    pusoCamila: 27800,
  },
  {
    fecha: new Date("2026-08-04"),
    descripcion: "Cena en lo de Pepe",
    categoria: "COMIDA_AFUERA" as const,
    pusoJose: 35000,
    pusoCamila: 0,
  },
  {
    fecha: new Date("2026-08-05"),
    descripcion: "Farmacia - remedios",
    categoria: "SALUD" as const,
    pusoJose: 0,
    pusoCamila: 18450,
  },
  {
    fecha: new Date("2026-08-05"),
    descripcion: "Luz - Edesur",
    categoria: "SERVICIOS" as const,
    pusoJose: 41200,
    pusoCamila: 0,
  },
  {
    fecha: new Date("2026-08-06"),
    descripcion: "Verduleria",
    categoria: "SUPERMERCADO" as const,
    pusoJose: 12300,
    pusoCamila: 0,
  },
  // Dos de julio, para tener con que probar el filtro por mes.
  {
    fecha: new Date("2026-07-28"),
    descripcion: "Entradas al cine",
    categoria: "OCIO" as const,
    pusoJose: 0,
    pusoCamila: 22000,
  },
  {
    fecha: new Date("2026-07-30"),
    descripcion: "Supermercado Dia",
    categoria: "SUPERMERCADO" as const,
    pusoJose: 39900,
    pusoCamila: 0,
  },
];

async function main() {
  // Borramos lo que haya para que sembrar dos veces no duplique todo.
  const borrados = await prisma.gasto.deleteMany();
  console.log(`Gastos borrados: ${borrados.count}`);

  const creados = await prisma.gasto.createMany({ data: gastosDePrueba });
  console.log(`Gastos creados:  ${creados.count}`);
}

main()
  .catch((error) => {
    console.error("Fallo el seed:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
