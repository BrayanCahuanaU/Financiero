#!/usr/bin/env node
/**
 * Prepara la base D1 en la cuenta de Cloudflare del usuario.
 *
 * Uso:
 *   npm run cf:setup
 *
 * Requiere iniciar sesión en Cloudflare (abre el navegador una vez).
 */
import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    cwd: process.cwd(),
    ...options,
  });
}

function capture(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    cwd: process.cwd(),
  });
}

console.log("\nYupay · configuración de Cloudflare\n");

const who = capture("npx", ["wrangler", "whoami"]);
const whoText = `${who.stdout ?? ""}${who.stderr ?? ""}`;
if (who.status !== 0 || /not authenticated/i.test(whoText)) {
  console.log("Primero inicia sesión en Cloudflare. Se abrirá el navegador...\n");
  const login = run("npx", ["wrangler", "login"]);
  if (login.status !== 0) {
    console.error("\nNo se pudo iniciar sesión. Ejecuta manualmente: npx wrangler login");
    process.exit(1);
  }
}

console.log("\nCreando (o actualizando) la base D1 `yupay`...\n");
const create = run("npx", [
  "wrangler",
  "d1",
  "create",
  "yupay",
  "--update-config",
  "--binding",
  "DB",
]);

if (create.status !== 0) {
  console.error(
    "\nNo se pudo crear la base. Si ya existe, revisa que wrangler.jsonc tenga el database_id correcto.",
  );
  process.exit(1);
}

console.log(`
Listo. wrangler.jsonc ya apunta a tu base D1.

Siguientes pasos:
  1. Si vas a desplegar desde tu PC:
       npm run deploy
       npm run cf:secret
  2. Si vas a usar Workers Builds (recomendado):
       - Sube el cambio de wrangler.jsonc a GitHub.
       - En Cloudflare: Workers & Pages -> Create -> Connect to Git.
       - Build command: npx opennextjs-cloudflare build
       - Deploy command: npx opennextjs-cloudflare deploy -- --keep-vars
       - Agrega el secreto AUTH_SECRET en Settings -> Variables and Secrets.
`);
