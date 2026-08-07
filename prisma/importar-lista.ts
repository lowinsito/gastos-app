// Importacion unica de la lista del super que Jose y Camila venian
// llevando en una nota del celular.
//
//   npm run importar-lista                  -> base de desarrollo
//   npm run importar-lista -- --produccion  -> base real (la app publicada)
//
// Los items van en el mismo orden que tenian en la nota, y respetando el
// tildecito: los que ya estaban tachados entran como comprados.
//
// El orden importa porque el modelo ordena por `creadoEn`, asi que los
// cargamos de a uno y en secuencia en lugar de todos juntos con
// createMany: asi cada uno queda con una marca de tiempo posterior a la
// del anterior y la lista se ve igual que la nota original.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const esProduccion = process.argv.includes("--produccion");

const connectionString = esProduccion
  ? process.env.DATABASE_URL_PRODUCCION
  : process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    esProduccion
      ? "Falta DATABASE_URL_PRODUCCION en el .env"
      : "Falta DATABASE_URL en el .env",
  );
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/** true = ya estaba tachado en la nota. */
const items: Array<[string, boolean]> = [
  ["Verduras", false],
  ["Atún", false],
  ["Arroz", false],
  ["Papel higiénico", true],
  ["Vinagre", false],
  ["Pepinillos", true],
  ["Jamón y queso", false],
  ["Tallarines", true],
  ["Limpia vidrio", false],
  ["Cif", false],
  ["Hongos", true],
  ["Virulana", true],
  ["Aceto", true],
  ["Pan", false],
  ["Huevo", true],
  ["Queso crema", true],
  ["Roli", false],
  ["Leche", false],
  ["Lavandina en gel", true],
  ["Yerba", false],
  ["Raid", true],
  ["Sal", true],
  ["Para chipacito", true],
  ["Ketchup", true],
  ["Picada", true],
];

async function main() {
  const existentes = await prisma.itemLista.count();
  if (existentes > 0) {
    console.error("");
    console.error(`  La lista ya tiene ${existentes} items.`);
    console.error("  Importar ahora dejaria todo duplicado. Abortado.");
    console.error("");
    process.exit(1);
  }

  for (const [nombre, comprado] of items) {
    await prisma.itemLista.create({ data: { nombre, comprado } });
  }

  const faltan = await prisma.itemLista.count({ where: { comprado: false } });
  const comprados = await prisma.itemLista.count({ where: { comprado: true } });

  console.log(
    `Base: ${esProduccion ? "PRODUCCIÓN (la app real)" : "desarrollo"}`,
  );
  console.log(`Items importados: ${faltan + comprados}`);
  console.log(`  Por comprar: ${faltan}`);
  console.log(`  Ya tachados: ${comprados}`);
}

main()
  .catch((error) => {
    console.error("Fallo la importacion:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
