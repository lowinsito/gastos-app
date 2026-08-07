// Constantes de la lista del super, compartidas entre el servidor y el
// navegador.
//
// Estan aca y no en `acciones-lista.ts` por una regla de Next.js: un
// archivo marcado con "use server" SOLO puede exportar funciones async.
// Tiene sentido: todo lo que sale de ese archivo se convierte en un
// pedido al servidor, y una constante no es algo que se pueda "pedir".

/** El largo maximo de un item. Lo usan el <input> y la validacion. */
export const LARGO_MAXIMO_ITEM = 100;
