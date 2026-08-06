// Crea o actualiza las contrasenas de Jose y Camila.
//
//   npm run usuarios                  -> base de desarrollo
//   npm run usuarios -- --produccion  -> base real (la app publicada)
//
// Las contrasenas se tipean aca, en tu terminal. No quedan escritas en
// ningun archivo ni se le muestran a nadie: lo unico que se guarda en la
// base es su hash.

import "dotenv/config";
import { createInterface, type Interface } from "node:readline";
import bcrypt from "bcryptjs";
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

/**
 * Pregunta algo por terminal tapando lo que se escribe con asteriscos.
 * Sin esto, la contrasena queda a la vista de cualquiera que mire la
 * pantalla, y ademas guardada en el historial visible de la terminal.
 */
function preguntarClave(pregunta: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: true,
    });

    // readline no trae opcion de ocultar, asi que interceptamos lo que
    // escribe en pantalla: mostramos la pregunta y tapamos el resto.
    const interno = rl as Interface & {
      _writeToOutput?: (texto: string) => void;
    };
    interno._writeToOutput = (texto: string) => {
      process.stdout.write(texto.includes(pregunta) ? texto : "*");
    };

    rl.question(pregunta, (respuesta) => {
      rl.close();
      process.stdout.write("\n");
      resolve(respuesta);
    });
  });
}

async function pedirClaveValida(nombre: string): Promise<string> {
  for (;;) {
    const clave = await preguntarClave(`Contraseña para ${nombre}: `);

    if (clave.length < 8) {
      console.log("  Muy corta: tiene que tener al menos 8 caracteres.\n");
      continue;
    }

    const repetida = await preguntarClave("Repetila para confirmar:  ");
    if (clave !== repetida) {
      console.log("  No coinciden. Probá de nuevo.\n");
      continue;
    }

    return clave;
  }
}

async function main() {
  console.log("");
  console.log("=".repeat(52));
  console.log(
    `  USUARIOS — base de ${esProduccion ? "PRODUCCIÓN (la app real)" : "desarrollo"}`,
  );
  console.log("=".repeat(52));
  console.log("");
  console.log("Lo que escribas se tapa con asteriscos. Mínimo 8 caracteres.");
  console.log("");

  for (const persona of ["JOSE", "CAMILA"] as const) {
    const clave = await pedirClaveValida(persona === "JOSE" ? "Jose" : "Camila");

    // bcrypt.hash hace el trabajo pesado: convierte la contrasena en un
    // hash del que no se puede volver atras. El 10 es el "costo": cuantas
    // vueltas de calculo hace. Mas alto = mas lento de romper por fuerza
    // bruta, pero tambien mas lento de verificar en cada login.
    const hashClave = await bcrypt.hash(clave, 10);

    await prisma.usuario.upsert({
      where: { persona },
      update: { hashClave },
      create: { persona, hashClave },
    });

    console.log(`  ✓ ${persona} listo\n`);
  }

  const total = await prisma.usuario.count();
  console.log(`Usuarios en la base: ${total}`);
  console.log("");
}

main()
  .catch((error) => {
    console.error("Fallo:", error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
