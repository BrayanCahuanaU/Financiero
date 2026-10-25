import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// La app es completamente dinámica (login + D1), así que no necesita la
// caché incremental de OpenNext ni un bucket R2.
export default defineCloudflareConfig({});
