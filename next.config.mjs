import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { resolveInternalOrigin } from "./lib/server-origin.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const canvasOrigin = resolveInternalOrigin(process.env.PHYSICS_CANVAS_ORIGIN, {
  name: "PHYSICS_CANVAS_ORIGIN",
  fallback: "http://127.0.0.1:4481",
  allowedHttpHosts: ["canvas"],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1"],
  output: "standalone",
  outputFileTracingRoot: dirname(root),
  turbopack: {
    root: dirname(root),
  },
  transpilePackages: ["@physic/api-client", "@physic/contracts"],
  async headers() {
    return [{ source: '/payment/alipay/:path*', headers: [
      { key: 'Cache-Control', value: 'no-store, private' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
    ] }];
  },
  async rewrites() {
    return {
      beforeFiles: [
        ...[
          "xingchi-vision-mark.svg",
          "xingchi-vision-micro.svg",
          "xingchi-vision-wordmark.svg",
          "xingchi-ai-aperture-mark.png",
        ].map((asset) => ({
          source: `/${asset}`,
          destination: `${canvasOrigin}/canvas/${asset}`,
        })),
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
