import type { MetadataRoute } from "next";

/**
 * El manifiesto le dice al celular como tratar la app cuando alguien la
 * agrega a la pantalla de inicio: que nombre poner debajo del icono, con
 * que colores abrirla y si mostrar o no la barra de direcciones.
 *
 * Sin esto, Android/iOS ponen el titulo de la pagina y un recorte de la
 * pantalla como icono. Con esto, se ve como una app de verdad.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gastos de la casa",
    // El corto es el que entra debajo del icono en la pantalla de inicio.
    short_name: "Gastos",
    description: "Gastos compartidos de la casa",
    start_url: "/",
    // "standalone" = se abre sin barra de direcciones, como una app nativa.
    display: "standalone",
    background_color: "#faf7f2",
    theme_color: "#c2632f",
    lang: "es-AR",
    icons: [
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        type: "image/svg+xml",
        sizes: "any",
        // "maskable": Android puede recortarlo con la forma que use el
        // telefono (circulo, cuadrado redondeado) sin comerse partes del
        // dibujo. Nuestro icono ya tiene margen alrededor de la casita.
        purpose: "maskable",
      },
    ],
  };
}
