// Manejo de la sesion: crear, leer y borrar la cookie que recuerda quien
// esta usando la app.
//
// "server-only" hace que este archivo NO pueda importarse desde un Client
// Component. Si alguien lo intenta, el proyecto no compila. Es una red de
// seguridad: aca adentro se usa SESSION_SECRET, y esa clave jamas tiene
// que llegar al navegador.
import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Persona } from "@/generated/prisma/enums";

const NOMBRE_COOKIE = "sesion";
const DURACION_DIAS = 30;

/** Lo unico que guardamos en la cookie: quien sos. Nada sensible. */
export type DatosSesion = {
  persona: Persona;
};

function claveDeFirma() {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto) {
    throw new Error(
      "Falta SESSION_SECRET. Revisá el .env (y las variables en Vercel).",
    );
  }
  return new TextEncoder().encode(secreto);
}

/** Arma el token firmado que viaja en la cookie. */
async function firmar(datos: DatosSesion, vence: Date) {
  return new SignJWT({ persona: datos.persona })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(vence)
    .sign(claveDeFirma());
}

/**
 * Comprueba la firma y devuelve los datos, o null si el token esta
 * vencido, alterado o no existe.
 */
export async function leerToken(token?: string): Promise<DatosSesion | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, claveDeFirma(), {
      algorithms: ["HS256"],
    });

    const persona = payload.persona;
    if (persona !== "JOSE" && persona !== "CAMILA") return null;

    return { persona };
  } catch {
    // Firma invalida o token vencido. No distinguimos entre los casos:
    // en los dos, la respuesta es la misma.
    return null;
  }
}

/** Lee la sesion de la cookie del pedido actual. */
export async function obtenerSesion(): Promise<DatosSesion | null> {
  const almacen = await cookies();
  return leerToken(almacen.get(NOMBRE_COOKIE)?.value);
}

export async function crearSesion(persona: Persona) {
  const vence = new Date(Date.now() + DURACION_DIAS * 24 * 60 * 60 * 1000);
  const token = await firmar({ persona }, vence);
  const almacen = await cookies();

  almacen.set(NOMBRE_COOKIE, token, {
    // httpOnly: el JavaScript de la pagina no puede leer esta cookie.
    // Si alguna vez lograran inyectar codigo malicioso en la app, no
    // podrian robarse la sesion.
    httpOnly: true,
    // secure: solo viaja por HTTPS. En desarrollo (http://localhost) lo
    // apagamos, porque si no el navegador la descarta y nunca entrarias.
    secure: process.env.NODE_ENV === "production",
    // sameSite lax: la cookie no se manda cuando otro sitio hace un
    // pedido a la app. Es la defensa basica contra ataques CSRF.
    sameSite: "lax",
    expires: vence,
    path: "/",
  });
}

export async function borrarSesion() {
  const almacen = await cookies();
  almacen.delete(NOMBRE_COOKIE);
}
