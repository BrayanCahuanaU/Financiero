# Yupay · Finanzas personales

Sistema web para administrar **gastos, ahorros, inversiones e ingresos**, con cuentas, sesión persistente y diseño responsive para celular y laptop.

**Producción:** [https://yupay.brayan-cahuana.workers.dev](https://yupay.brayan-cahuana.workers.dev)

> Tus datos viven en el servidor (Cloudflare D1). Al iniciar sesión desde otro dispositivo con la misma cuenta, encuentras exactamente la misma información.

---

## Demo

| Usuario | Contraseña |
| --- | --- |
| `demo@yupay.pe` | `demo1234` |

En la pantalla de login hay un botón **“Entrar con la cuenta demo”** que crea la sesión automáticamente.

---

## Funcionalidades

- **Resumen (dashboard):** patrimonio neto, ingresos, gastos y ahorro del mes; flujo de caja de 6 meses; gastos por categoría; cuentas, metas, presupuestos y movimientos recientes.
- **Movimientos:** registro de ingresos/gastos, filtros por mes, tipo, cuenta, categoría y búsqueda; paginación; eliminación; exportación a CSV.
- **Cuentas:** cuentas bancarias, billeteras, efectivo y tarjetas; saldo calculado automáticamente a partir del saldo inicial + movimientos; distribución del patrimonio.
- **Ahorros:** metas con monto objetivo, fecha, color y aportes; progreso individual y global.
- **Inversiones:** portafolio con monto invertido, valor actual, rendimiento en soles y porcentaje, distribución por tipo y actualización de valor.
- **Presupuestos:** límite mensual por categoría, gasto real, disponible, alertas al acercarse o excederse y guía 50/30/20.
- **Sin conexiones bancarias:** los movimientos se registran manualmente; no se importan ni generan datos de bancos.
- **Ajustes:** perfil y moneda, cambio de contraseña, cierre de sesión, exportación de datos y borrado de datos financieros.
- **Sesión persistente:** cookie `HttpOnly` de 30 días o 180 días si se marca “Mantener mi sesión iniciada”.
- **Responsive:** sidebar en escritorio, barra inferior y menú deslizable en móvil.

---

## Stack

- **Next.js 16** (App Router, React 19, Server Components, Route Handlers)
- **TypeScript**
- **Tailwind CSS 4**
- **Cloudflare Workers** con `@opennextjs/cloudflare`
- **Cloudflare D1** (SQLite gestionado, sin servidor propio)
- **JWT** con `jose` en cookie segura
- **scrypt** (Node crypto) para hash de contraseñas
- **Zod** para validación de datos
- **Lucide** para iconografía

La app corre en el plan gratuito de Cloudflare Workers + D1. No necesitas VPS, disco persistente ni base de datos externa.

---

## Puesta en marcha

Requisitos: **Node.js 20.9+** (probado en Node 24) y npm.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

En desarrollo, `next dev` levanta **Miniflare** y emula el binding D1 `DB`; los datos locales quedan en `.wrangler/state`. El esquema se crea solo y la cuenta demo se siembra la primera vez que pulsas “Entrar con la cuenta demo”.

### Variables de entorno

En local funciona sin configuración gracias a un secreto de desarrollo. Para que las sesiones sean válidas en producción, define `AUTH_SECRET` (mínimo 32 caracteres) en Cloudflare:

```bash
npx wrangler secret put AUTH_SECRET
```

También puedes copiar `.env.example` a `.env.local` y poner tu propio secreto para desarrollo o para `npm run preview`.

En producción la app debe servirse por **HTTPS** para que la cookie segura se envíe correctamente (Cloudflare lo hace por defecto).

---

## Estructura

```
app/
  (auth)/login, register        Pantallas de acceso
  (app)/dashboard               Resumen general
  (app)/movimientos             Historial + filtros + export
  (app)/cuentas                 Cuentas y saldos
  (app)/ahorros                 Metas y aportes
  (app)/inversiones             Portafolio
  (app)/presupuestos            Límites mensuales
  (app)/ajustes                 Perfil, seguridad y datos
  api/auth                      Registro, login, logout
  api/transactions|accounts     CRUD de movimientos y cuentas
  api/goals|investments|budgets CRUD del resto
  api/profile|data              Perfil, contraseña, borrado
components/                     UI, gráficos SVG, formularios y shell
lib/
  db.ts                         Esquema D1 + seed demo
  data.ts                       Consultas y lógica de negocio (D1 async)
  auth.ts                       Sesión JWT + cookie
  schemas.ts                    Validaciones Zod
wrangler.jsonc                  Configuración del Worker + binding D1
open-next.config.ts             Configuración de OpenNext para Cloudflare
```

La base D1 ya está vinculada en `wrangler.jsonc`; el esquema se inicializa solo con `CREATE TABLE IF NOT EXISTS` en `lib/db.ts`, dentro de un batch de D1.

---

## Seguridad y privacidad

- Contraseñas con **scrypt + sal única** (`lib/password.ts`), comparación en tiempo constante.
- Sesión en cookie **`HttpOnly`, `SameSite=Lax`**, `Secure` en producción y expiración firmada con HS256.
- Todas las consultas y mutaciones filtran por `user_id`: un usuario no puede leer ni modificar datos de otro.
- Validación de entrada con Zod en cada endpoint.
- Límite de intentos de login en memoria (8 intentos por 10 minutos por IP + correo).
- Esta versión no se conecta a bancos, no solicita credenciales bancarias y no importa movimientos automáticamente.
- Puedes exportar tu historial a CSV y borrar tus datos financieros desde Ajustes.

Para un despliegue serio, añade rate limiting persistente, backups de la base de datos y HTTPS obligatorio.

---

## Notas de diseño

- Paleta oscura con acento menta, pensada para lectura prolongada.
- Tipografía del sistema para carga instantánea (sin fuentes externas).
- Gráficos hechos con SVG nativo (sin librerías de charts).
- Navegación adaptativa: sidebar (≥1024 px), barra inferior + drawer en móvil.
- Montos en formato `es-PE` con `Intl.NumberFormat`.

---

## Despliegue en Cloudflare (plan gratuito)

La app ya está preparada para **Cloudflare Workers + D1 + OpenNext**. La versión desplegada está en `https://yupay.brayan-cahuana.workers.dev`. Hay dos formas de desplegar; la recomendada es conectar el repositorio a **Workers Builds** para que cada `git push` publique una versión nueva.

### 1. Despliegue automático desde GitHub (recomendado)

La base D1 `yupay` ya está creada y vinculada; su `database_id` está en `wrangler.jsonc`. No tienes que crearla a mano.

1. El código ya está en `https://github.com/BrayanCahuanaU/Financiero`.
2. En Cloudflare: **Workers & Pages → `yupay` → Settings → Builds → Connect**.
3. Elige el repositorio `BrayanCahuanaU/Financiero` y la rama `main`.
4. Configura:
   - **Build command:** `npx opennextjs-cloudflare build`
   - **Deploy command:** `npx opennextjs-cloudflare deploy -- --keep-vars`
5. Verifica en **Settings → Variables and Secrets** que exista `AUTH_SECRET` como **Secret**. Ya está configurado en el Worker actual.
6. Guarda y lanza el primer build. El esquema se inicializa en la primera petición.
7. Desde ese momento, cada push a `main` compila y despliega automáticamente.

> El Worker `yupay` ya existe y está desplegado. Usa **Connect** sobre ese Worker; no crees una aplicación nueva, porque se crearía otro Worker con otro nombre.

> Si despliegas en otra cuenta de Cloudflare, crea tu propia base D1 `yupay` y reemplaza el `database_id` de `wrangler.jsonc` por el de esa cuenta.

### 2. Desplegar desde tu PC (opcional)

```bash
npx wrangler login
npm run deploy
npx wrangler secret put AUTH_SECRET
```

`npm run deploy` compila con OpenNext y publica el Worker. Después de definir el secreto, visita la URL `*.workers.dev` que imprime Wrangler.

### 3. Configurar el secreto de sesiones

Si no lo hiciste en el panel:

```bash
npx wrangler secret put AUTH_SECRET
```

> En local hay un secreto de desarrollo; en Cloudflare **no** se usa. Sin `AUTH_SECRET` el login devuelve error en producción.

### Probar el Worker en local

```bash
npm run preview
```

Esto compila la versión de producción y la ejecuta en el runtime de Workers (Wrangler/Miniflare) con una D1 local. No necesitas crear nada: Wrangler la provisiona al vuelo.

### Límites del plan gratuito

- **10 ms de CPU por petición** en Workers Free. El renderizado SSR de Next.js y el hash `scrypt` del login pueden superarlo y devolver el error `1102`. Si ocurre con frecuencia, Workers Paid (5 USD/mes) elimina ese límite.
- 100 000 peticiones/día.
- D1 gratis: 500 MB por base, 50 consultas por invocación y 5 GB de almacenamiento total.
- El primer login demo siembra ~500 filas en un batch; puede tardar uno o dos segundos, pero solo ocurre una vez.
- OpenNext no está totalmente soportado en Windows; si el build falla en tu PC, despliega desde GitHub Actions/Workers Builds (Linux) o usa WSL.

### Alternativa: servidor Node

La app ya no usa `better-sqlite3`, así que **no funciona con `npm start` como servidor Node tradicional** sin adaptar la capa D1. El camino soportado es Cloudflare Workers. Si necesitas un VPS, habría que volver a un driver SQLite o PostgreSQL.

---

## Limitaciones conocidas

- Las conexiones bancarias son simuladas (ver arriba).
- No hay conversión de moneda entre cuentas: los montos se muestran en la moneda principal del perfil.
- Las transferencias entre cuentas propias se registran como gasto + ingreso manual (no hay tipo “transferencia” dedicado).
- El rate limiting es en memoria y vive por isolate de Workers; se reinicia con el proceso y no es global.
- No incluye recuperación de contraseña por correo (requiere un proveedor de email).
