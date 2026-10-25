import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// En `next dev` levanta Miniflare para que el binding D1 `DB` funcione igual
// que en producción. Durante `next build` no se inicializa.
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {};

export default nextConfig;
