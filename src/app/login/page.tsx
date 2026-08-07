import { redirect } from "next/navigation";
import { obtenerSesion } from "@/lib/sesion";
import { FormularioLogin } from "@/components/formulario-login";

export const metadata = {
  title: "Entrar · Gastos",
};

export default async function LoginPage() {
  // Si ya iniciaste sesion, no tiene sentido mostrarte el login.
  const sesion = await obtenerSesion();
  if (sesion) {
    redirect("/");
  }

  return (
    // data-pagina no hace nada visual: es una marca para que globals.css
    // pueda reconocer esta pantalla y darle su propio fondo y su propio
    // velo, sin que la pagina tenga que saber nada de imagenes.
    <div
      data-pagina="login"
      className="mx-auto flex min-h-[70vh] max-w-sm items-center px-4"
    >
      <div className="w-full">
        <div className="mb-6 text-center">
          <Logo />
          <h1 className="mt-3 text-xl font-semibold tracking-tight text-texto">
            Gastos
          </h1>
          <p className="mt-1 text-sm text-texto-suave">
            Entrá para ver y cargar los gastos.
          </p>
        </div>

        <div className="rounded-2xl border border-borde bg-superficie p-6">
          <FormularioLogin />
        </div>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="mx-auto size-12" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-acento" />
      <path
        d="M16 7 L26 15 L23.5 15 L23.5 25 L8.5 25 L8.5 15 L6 15 Z"
        className="fill-fondo"
      />
      <path
        d="M16 22.2 C16 22.2 12.2 19.9 12.2 17.7 C12.2 16.5 13.1 15.6 14.2 15.6 C14.9 15.6 15.6 16 16 16.5 C16.4 16 17.1 15.6 17.8 15.6 C18.9 15.6 19.8 16.5 19.8 17.7 C19.8 19.9 16 22.2 16 22.2 Z"
        className="fill-acento"
      />
    </svg>
  );
}
