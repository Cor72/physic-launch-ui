import { proxyPlatformRequest } from "@/lib/platform-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(request: Request) {
  return proxyPlatformRequest(request);
}

export {
  handler as DELETE,
  handler as GET,
  handler as PATCH,
  handler as POST,
  handler as PUT,
};
