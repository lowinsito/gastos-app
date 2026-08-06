import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navegacion } from "@/components/navegacion";

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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es-AR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Todo lo que va aca se dibuja en TODAS las paginas. La navegacion
          se escribe una sola vez; {children} es el hueco donde Next.js mete
          la pagina que corresponda a la direccion actual. */}
      <body className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navegacion />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
