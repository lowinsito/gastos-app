"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { crearSesion, borrarSesion } from "@/lib/sesion";
import type { Persona } from "@/generated/prisma/enums";

export type EstadoLogin = {
  error?: string;
};

export async function iniciarSesion(
  _estadoPrevio: EstadoLogin,
  formData: FormData,
): Promise<EstadoLogin> {
  const persona = String(formData.get("persona") ?? "");
  const clave = String(formData.get("clave") ?? "");

  if (persona !== "JOSE" && persona !== "CAMILA") {
    return { error: "Elegí quién sos." };
  }
  if (clave === "") {
    return { error: "Escribí tu contraseña." };
  }

  const usuario = await prisma.usuario.findUnique({
    where: { persona: persona as Persona },
  });

  // Aunque el usuario no exista, igual comparamos contra un hash falso.
  // Si volvieramos antes, la respuesta tardaria menos y alguien podria
  // deducir que usuarios existen midiendo el tiempo. Se llama ataque de
  // temporizacion (timing attack).
  const hash = usuario?.hashClave ?? HASH_FALSO;
  const coincide = await bcrypt.compare(clave, hash);

  if (!usuario || !coincide) {
    // Un solo mensaje para los dos casos: si dijeramos "esa persona no
    // existe" vs "contraseña incorrecta", le estariamos confirmando a un
    // atacante cuando acerto el usuario.
    return { error: "Contraseña incorrecta." };
  }

  await crearSesion(usuario.persona);
  redirect("/");
}

export async function cerrarSesion() {
  await borrarSesion();
  redirect("/login");
}

// Hash de una contrasena al azar que nadie conoce. Solo sirve para que
// bcrypt.compare tarde lo mismo cuando el usuario no existe.
const HASH_FALSO = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.q1Vv9L0dGCK5S1sQb9Ib8Wm9Xu9e";
