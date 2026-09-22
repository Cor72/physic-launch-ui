import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { resolveInternalOrigin } from "./lib/server-origin.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const canvasOrigin = resolveInternalOrigin(process.env.PHYSICS_CANVAS_ORIGIN, {
  name: "PHYSICS_CANVAS_ORIGIN",
  fallback: "http://127.0.0.1:4481",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: dirname(root),
  },
  transpilePackages: ["@physic/api-client", "@physic/contracts"],
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/canvas",
          destination: `${canvasOrigin}/canvas/`,
        },
        {
          source: "/canvas/:path*",
          destination: `${canvasOrigin}/canvas/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
