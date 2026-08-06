import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navegacion } from "@/components/navegacion";
import { CLAVE_TEMA } from "@/components/selector-tema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gastos de la casa",
  description: "Gastos compartidos de Jose y Camila",
};

/**
 * Este codigo se ejecuta mientras el navegador todavia esta leyendo el
 * HTML, ANTES de dibujar el primer pixel.
 *
 * Sin esto, la secuencia seria: llega el HTML con el tema por defecto ->
 * el navegador lo pinta -> React arranca -> lee localStorage -> cambia el
 * tema. El usuario ve un fogonazo blanco antes de que quede oscuro. Es el
 * clasico "flash" de las apps con modo oscuro.
 *
 * El try/catch esta porque localStorage puede fallar (navegacion privada,
 * cookies bloqueadas). Si falla, simplemente queda el tema del sistema.
 */
const SCRIPT_TEMA = `(function(){try{var t=localStorage.getItem("${CLAVE_TEMA}");if(t==="claro"||t==="oscuro")document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      // suppressHydrationWarning: el script de arriba modifica el <html>
      // antes de que React arranque. Sin esto, React veria una diferencia
      // entre lo que genero el servidor y lo que hay en pantalla, y se
      // quejaria. Le decimos: confia en lo que ya esta en el DOM.
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      {/* Todo lo que va aca se dibuja en TODAS las paginas. La navegacion
          se escribe una sola vez; {children} es el hueco donde Next.js mete
          la pagina que corresponda a la direccion actual. */}
      <body className="flex min-h-full flex-col bg-fondo">
        <Navegacion />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
