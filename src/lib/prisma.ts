import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Cada PrismaClient abre su propia pila de conexiones a la base.
// En desarrollo, Next.js recarga los modulos cada vez que guardas un
// archivo: si creamos un cliente nuevo en cada recarga, en un rato
// tendriamos decenas de conexiones abiertas y la base nos rechazaria.
//
// La solucion es guardar el cliente en globalThis, que sobrevive a las
// recargas, y reutilizar el que ya existe.
const globalParaPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function crearCliente() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Falta la variable DATABASE_URL. Revisa el archivo .env del proyecto.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });
}

export const prisma = globalParaPrisma.prisma ?? crearCliente();

// En produccion el proceso arranca una sola vez, asi que no hace falta.
if (process.env.NODE_ENV !== "production") {
  globalParaPrisma.prisma = prisma;
}
