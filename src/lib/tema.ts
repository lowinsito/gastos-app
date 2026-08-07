// La clave con la que se guarda el tema elegido en el navegador.
//
// Vive en un archivo COMUN, sin "use client", por una razon concreta:
// `layout.tsx` corre en el servidor y necesita el texto de verdad para
// armar el script que evita el parpadeo.
//
// Cuando esta constante estaba dentro de `selector-tema.tsx` (que si es
// "use client"), el servidor no recibia el texto "tema" sino un objeto
// puente que Next.js pone en su lugar. El script terminaba buscando en
// localStorage una clave que no existia y nunca aplicaba el tema.

export const CLAVE_TEMA = "tema";
