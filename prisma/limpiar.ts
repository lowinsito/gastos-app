// Borra TODOS los gastos de la base.
//
// Se ejecuta con:  npm run limpiar -- --si-borrar-todo
//
// El flag extra es a proposito. Este script apunta a la MISMA base que usa
// la app publicada, asi que un `npm run limpiar` escrito de apuro borraria
// los gastos reales de la casa. Es la misma idea del boton "Eliminar" de la
// app: toda accion destructiva tiene que costar un paso mas.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const CONFIRMACION = "--si-borrar-todo";

if (!process.argv.includes(CONFIRMACION)) {
  console.error("");
  console.error("  Esto borra TODOS los gastos, incluidos los reales.");
  console.error(`  Si estas seguro:  npm run limpiar -- ${CONFIRMACION}`);
  console.error("");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const { count } = await prisma.gasto.deleteMany();
console.log(`Gastos borrados: ${count}`);
await prisma.$disconnect();
