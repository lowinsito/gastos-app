# Gastos de la casa

App web para administrar los gastos compartidos de un hogar de dos personas.
Reemplaza una planilla de cálculo: registra quién pagó cada gasto y calcula
sola quién le debe cuánto al otro.

## Qué hace

- Cargar, editar y eliminar gastos
- Registrar gastos pagados **entre los dos**, con montos distintos cada uno
- Filtrar por mes y por categoría
- Resumen con el total del período, cuánto puso cada uno y el balance
- Desglose de gasto por categoría
- Acceso con usuario y contraseña
- Modo claro / oscuro / según el sistema
- Se instala en el celular desde el navegador

## Stack

| | |
|---|---|
| **Next.js 16** (App Router) | Server Components y Server Actions |
| **React 19** | |
| **TypeScript** | |
| **Tailwind CSS 4** | Estilos, con paleta propia en variables CSS |
| **Prisma 7** | ORM |
| **PostgreSQL** | Base de datos |
| **Vercel** | Despliegue continuo desde `main` |

Sin librerías de UI ni de gráficos: los componentes y las barras del resumen
están hechos a mano.

## Decisiones de diseño

**Los montos se guardan como `Decimal(12,2)` y toda la aritmética se hace en
centavos enteros.** Los decimales en binario no son exactos (`0.1 + 0.2` da
`0.30000000000000004`) y al sumar cientos de gastos el error se acumula.

**Las fechas se guardan como `@db.Date`, sin hora, y se formatean en UTC.**
Guardando la hora, un gasto cargado a las 22:00 del 31 de agosto en Argentina
se almacenaría como 1 de septiembre en UTC y desaparecería del resumen de
agosto.

**La deuda no se almacena, se calcula.** Se deriva de los gastos en cada
consulta. Guardarla obligaría a recalcularla en cada alta, edición y baja, y
el día que se olvide un caso la app miente.

**Un gasto guarda `pusoJose` y `pusoCamila` en vez de "quién pagó" + "monto".**
A veces los dos ponen plata en un mismo gasto, con montos distintos. El
reparto sigue siendo 50/50; lo que varía es de qué bolsillo salió.

**Los filtros viven en la URL** (`/?mes=2026-08&categoria=SERVICIOS`), no en
el estado de React, para que el enlace se pueda compartir y el botón "atrás"
funcione.

**Las sumas las hace PostgreSQL** con `aggregate` y `groupBy`, en lugar de
traer todas las filas y sumarlas en JavaScript.

## Seguridad

- Las contraseñas se guardan **hasheadas con bcrypt**, nunca en texto plano
- La sesión viaja en una cookie **firmada** (JWT con `jose`), `httpOnly` y
  `sameSite: lax`
- `src/proxy.ts` redirige al login, y **además** cada página y cada Server
  Action verifican la sesión por su cuenta: una Server Action es un endpoint
  POST que se puede invocar sin pasar por ninguna pantalla
- El mismo mensaje de error para "usuario inexistente" y "contraseña
  incorrecta", comparando siempre contra un hash, para no filtrar qué
  usuarios existen
- Los identificadores de los gastos se pasan a las acciones con `.bind()`, no
  como campos de formulario, para que no se puedan alterar desde el navegador
- Los secretos viven en `.env`, fuera del repositorio

## Cómo correrlo

```bash
npm install
```

Crear un archivo `.env` con:

```bash
DATABASE_URL="postgres://..."      # base de datos PostgreSQL
SESSION_SECRET="..."               # node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Luego:

```bash
npx prisma migrate deploy   # crear las tablas
npm run usuarios            # definir las contraseñas
npm run seed                # datos de prueba (opcional)
npm run dev
```

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Aplica migraciones y compila para producción |
| `npm run lint` | Revisa el código |
| `npm run seed` | Carga gastos de prueba |
| `npm run usuarios` | Define las contraseñas (las pide por terminal) |
| `npm run limpiar -- --si-borrar-todo` | Vacía la tabla de gastos |

## Estructura

```
src/
├── app/
│   ├── page.tsx              lista de gastos + alta
│   ├── resumen/              totales, balance y categorías
│   ├── login/
│   ├── gastos/[id]/editar/
│   ├── layout.tsx            navegación y tema
│   └── manifest.ts
├── components/               piezas de interfaz
├── lib/
│   ├── prisma.ts             cliente de base de datos
│   ├── acciones.ts           Server Actions de gastos
│   ├── acciones-sesion.ts    login y logout
│   ├── sesion.ts             cookie firmada
│   ├── autenticacion.ts      verificación de sesión
│   ├── consultas.ts          filtros compartidos
│   └── formato.ts            moneda, fechas, centavos
└── proxy.ts                  protección de rutas
```
