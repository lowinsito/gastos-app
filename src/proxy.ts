// Este archivo se ejecuta ANTES que cualquier pagina, en cada pedido.
// En versiones anteriores de Next.js se llamaba middleware.ts.
//
// Su trabajo aca es simple: si no tenes sesion, no ves nada mas que el
// login. Es una primera barrera, no la unica: las paginas y las acciones
// vuelven a verificar por su cuenta (ver lib/autenticacion.ts).

import { NextResponse, type NextRequest } from "next/server";
import { leerToken } from "@/lib/sesion";

const RUTAS_PUBLICAS = ["/login"];

export default async function proxy(request: NextRequest) {
  const ruta = request.nextUrl.pathname;
  const esPublica = RUTAS_PUBLICAS.includes(ruta);

  // Solo leemos la cookie, sin consultar la base: este codigo corre en
  // CADA pedido, incluidos los que Next.js hace por adelantado al pasar
  // el mouse por un enlace. Una consulta a la base aca seria carisima.
  const sesion = await leerToken(request.cookies.get("sesion")?.value);

  if (!sesion && !esPublica) {
    const destino = new URL("/login", request.nextUrl);
    return NextResponse.redirect(destino);
  }

  if (sesion && esPublica) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  // No corras en los archivos internos de Next.js, ni en los iconos, ni en
  // el manifiesto: no tiene sentido pedir sesion para servir una hoja de
  // estilos. Ademas, el manifiesto tiene que poder leerse para que el
  // celular sepa como instalar la app, y ahi devolver el HTML del login
  // rompia la instalacion.
  //
  // La imagen de fondo tambien va excluida: se usa en la pantalla de
  // login, donde todavia no hay sesion. Sin esta linea, el pedido de la
  // imagen terminaba redirigido al login y el fondo no aparecia nunca.
  matcher: [
    "/((?!_next/static|_next/image|icon.svg|favicon.ico|manifest.webmanifest|fondo\\.(?:svg|jpg|jpeg|png|webp)).*)",
  ],
};
