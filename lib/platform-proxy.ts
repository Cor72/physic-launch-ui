const JSON_BODY_LIMIT = 16_384;
const MULTIPART_BODY_LIMIT = 1_200_000;
const DEFAULT_TIMEOUT_MS = 15_000;
const PROVIDER_TIMEOUT_MS = 65_000;

const SAFE_REQUEST_HEADERS = Object.freeze([
  "content-type",
  "cookie",
  "origin",
  "idempotency-key",
  "analysis-id",
  "x-csrf-token",
  "x-usage-authorization",
  "x-usage-stage",
  "user-agent",
  "sec-fetch-site",
]);

const SAFE_RESPONSE_HEADERS = Object.freeze([
  "content-type",
  "x-request-id",
  "analysis-id",
  "retry-after",
  "ratelimit-limit",
  "ratelimit-remaining",
  "ratelimit-reset",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset",
]);

export type PlatformRouteRule = Readonly<{
  method: "GET" | "POST" | "PUT";
  pathPattern: RegExp;
  maxBodyBytes: number;
  timeoutMs: number;
  allowRequestHeaders: readonly string[];
  allowResponseHeaders: readonly string[];
}>;

const canvasId = "[A-Za-z0-9_-]{1,128}";
const uuid = "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}";
const exact = (path: string) => new RegExp(`^${path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`);
const route = (
  method: PlatformRouteRule["method"],
  pathPattern: RegExp,
  { maxBodyBytes = method === "GET" ? 0 : JSON_BODY_LIMIT, timeoutMs = DEFAULT_TIMEOUT_MS } = {},
): PlatformRouteRule => Object.freeze({
  method,
  pathPattern,
  maxBodyBytes,
  timeoutMs,
  allowRequestHeaders: SAFE_REQUEST_HEADERS,
  allowResponseHeaders: SAFE_RESPONSE_HEADERS,
});

export const PLATFORM_ROUTE_RULES: readonly PlatformRouteRule[] = Object.freeze([
  // Public authentication is intentionally exposed only through the v3 phone
  // flow shared with the canvas. The legacy username endpoints stay private.
  route("GET", exact("/api/user/v1/billing/assets")),

  // Canvas account facade (A1-A8). Unavailable methods still have explicit,
  // side-effect-free platform endpoints; capability flags remain authoritative.
  route("GET", exact("/api/v3/auth/bootstrap")),
  route("GET", exact("/api/v3/auth/account")),
  route("GET", exact("/api/v3/auth/jyeoo-profile")),
  route("PUT", exact("/api/v3/auth/jyeoo-profile")),
  route("POST", exact("/api/v3/auth/challenges")),
  route("POST", exact("/api/v3/auth/login")),
  route("POST", exact("/api/v3/auth/register")),
  route("POST", exact("/api/v3/auth/wechat/challenges")),
  route("GET", new RegExp(`^/api/v3/auth/wechat/challenges/${canvasId}$`)),
  route("GET", new RegExp(`^/api/v3/auth/wechat/qr/${canvasId}$`)),
  route("POST", exact("/api/v3/auth/logout")),

  // Canvas billing facade (B1-B7).
  route("POST", exact("/api/v3/billing/quotes")),
  route("POST", exact("/api/v3/billing/orders")),
  route("GET", new RegExp(`^/api/v3/billing/orders/${canvasId}$`)),
  route("GET", new RegExp(`^/api/v3/billing/order-intents/${uuid}$`)),
  route("GET", exact("/api/v3/billing/records")),
  route("POST", exact("/api/v3/billing/redemptions")),
  route("GET", new RegExp(`^/api/v3/billing/payment-media/${canvasId}$`)),

  // One-question usage facade (C1-C3) and the public upload policy (D1).
  route("POST", exact("/api/v3/usage/quotes")),
  route("POST", exact("/api/v3/usage/authorizations")),
  route("GET", new RegExp(`^/api/v3/usage/operations/${uuid}$`)),
  route("POST", new RegExp(`^/api/v3/usage/operations/${uuid}/close$`)),
  route("POST", new RegExp(`^/api/v3/usage/operations/${uuid}/deliveries$`)),
  route("POST", new RegExp(`^/api/v3/usage/operations/${uuid}/stages$`), {
    maxBodyBytes: MULTIPART_BODY_LIMIT,
    timeoutMs: PROVIDER_TIMEOUT_MS,
  }),
  route("GET", exact("/api/v3/problem-upload-policy")),
  route("POST", exact("/api/v3/traffic/visits"), { maxBodyBytes: 1_024 }),

]);

type FetchLike = typeof fetch;

function failure(code: string, message: string, status: number): Response {
  return Response.json(
    { code, message, error: { code, message } },
    { status, headers: { "cache-control": "no-store" } },
  );
}

function resolvePlatformOrigin(value: string | undefined): URL | null {
  try {
    const origin = new URL(value || "http://127.0.0.1:14300");
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname);
    const explicitlyAllowedPrivateHttp = origin.protocol === "http:" && origin.hostname === "api";
    if (
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      (origin.protocol !== "https:" &&
        !(origin.protocol === "http:" && loopback) &&
        !explicitlyAllowedPrivateHttp)
    ) return null;
    return origin;
  } catch {
    return null;
  }
}

function safePathname(requestUrl: string): string | null {
  const scheme = requestUrl.indexOf("://");
  if (scheme < 0) return null;
  const start = requestUrl.indexOf("/", scheme + 3);
  const raw = (start < 0 ? "/" : requestUrl.slice(start)).split(/[?#]/, 1)[0];
  // API routes are ASCII. Reject every encoded path before URL decoding can
  // turn a harmless-looking request into a different allowlisted endpoint.
  if (!raw.startsWith("/") || raw.includes("%") || raw.includes("\\") || raw.includes("//")) return null;
  if (raw.split("/").some(part => part === "." || part === "..")) return null;
  return raw;
}

export function findPlatformRoute(pathname: string, method: string): PlatformRouteRule | null {
  if (safePathname(`http://proxy.invalid${pathname}`) !== pathname) return null;
  return PLATFORM_ROUTE_RULES.find(rule => rule.method === method && rule.pathPattern.test(pathname)) ?? null;
}

function pathExists(pathname: string): boolean {
  return PLATFORM_ROUTE_RULES.some(rule => rule.pathPattern.test(pathname));
}

async function boundedBody(request: Request, maxBytes: number): Promise<ArrayBuffer> {
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || Number(declared) > maxBytes)) throw new Error("BODY_TOO_LARGE");
  if (!request.body) return new ArrayBuffer(0);

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const buffer = new ArrayBuffer(total);
  const body = new Uint8Array(buffer);
  let offset = 0;
  for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.byteLength; }
  return buffer;
}

export async function proxyPlatformRequest(
  request: Request,
  platformOriginValue = process.env.PHYSICS_PLATFORM_ORIGIN,
  upstreamFetch: FetchLike = fetch,
): Promise<Response> {
  const sourceUrl = new URL(request.url);
  const pathname = safePathname(request.url);
  if (!pathname) return failure("NOT_FOUND", "接口不存在", 404);
  const rule = findPlatformRoute(pathname, request.method);
  const knownPath = pathExists(pathname);
  if (!rule) return failure(knownPath ? "METHOD_NOT_ALLOWED" : "NOT_FOUND", knownPath ? "请求方法不被允许" : "接口不存在", knownPath ? 405 : 404);

  const platformOrigin = resolvePlatformOrigin(platformOriginValue);
  if (!platformOrigin) return failure("PLATFORM_NOT_CONFIGURED", "后台网关尚未正确配置", 503);

  const headers = new Headers();
  for (const name of rule.allowRequestHeaders) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const hasBody = !["GET", "HEAD"].includes(request.method);
    const timeout = AbortSignal.timeout(rule.timeoutMs);
    const target = new URL(pathname + sourceUrl.search, platformOrigin);
    const response = await upstreamFetch(target, {
      method: request.method,
      headers,
      ...(hasBody ? { body: await boundedBody(request, rule.maxBodyBytes) } : {}),
      redirect: "manual",
      signal: AbortSignal.any([request.signal, timeout]),
    });

    if (response.status >= 300 && response.status < 400) return failure("PLATFORM_REDIRECT_REJECTED", "后台网关返回了不允许的重定向", 502);

    const outputHeaders = new Headers({ "cache-control": "no-store" });
    for (const name of rule.allowResponseHeaders) {
      const value = response.headers.get(name);
      if (value) outputHeaders.set(name, value);
    }
    for (const cookie of response.headers.getSetCookie()) outputHeaders.append("set-cookie", cookie);

    return new Response(response.body, { status: response.status, headers: outputHeaders });
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") return failure("REQUEST_TOO_LARGE", "请求超过大小限制", 413);
    return failure("PLATFORM_UNAVAILABLE", "后台网关暂时不可用", 503);
  }
}

export function isAllowedPlatformRoute(pathname: string, method: string): boolean {
  return findPlatformRoute(pathname, method) !== null;
}
