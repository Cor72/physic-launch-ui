const ALLOWED_PLATFORM_ROUTES = new Map<string, ReadonlySet<string>>([
  ["/api/user/v1/auth/register", new Set(["POST"])],
  ["/api/user/v1/auth/login", new Set(["POST"])],
  ["/api/user/v1/auth/logout", new Set(["POST"])],
  ["/api/user/v1/auth/me", new Set(["GET"])],
  ["/api/user/v1/billing/assets", new Set(["GET"])],
  ["/api/v3/problem-analysis", new Set(["POST"])],
]);

const FORWARDED_REQUEST_HEADERS = [
  "content-type",
  "cookie",
  "origin",
  "idempotency-key",
  "analysis-id",
  "user-agent",
] as const;

const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "x-request-id",
  "retry-after",
] as const;

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
    const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(
      origin.hostname,
    );
    if (
      origin.username ||
      origin.password ||
      origin.pathname !== "/" ||
      origin.search ||
      origin.hash ||
      (origin.protocol !== "https:" && !(origin.protocol === "http:" && loopback))
    ) {
      return null;
    }
    return origin;
  } catch {
    return null;
  }
}

async function boundedBody(request: Request, maxBytes: number) {
  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error("BODY_TOO_LARGE");
  }

  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength > maxBytes) throw new Error("BODY_TOO_LARGE");
  return body;
}

export async function proxyPlatformRequest(
  request: Request,
  platformOriginValue = process.env.PHYSICS_PLATFORM_ORIGIN,
  upstreamFetch: FetchLike = fetch,
): Promise<Response> {
  const sourceUrl = new URL(request.url);
  const methods = ALLOWED_PLATFORM_ROUTES.get(sourceUrl.pathname);
  if (!methods) return failure("NOT_FOUND", "接口不存在", 404);
  if (!methods.has(request.method)) {
    return failure("METHOD_NOT_ALLOWED", "请求方法不被允许", 405);
  }

  const platformOrigin = resolvePlatformOrigin(platformOriginValue);
  if (!platformOrigin) {
    return failure("PLATFORM_NOT_CONFIGURED", "后台网关尚未正确配置", 503);
  }

  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  try {
    const hasBody = !["GET", "HEAD"].includes(request.method);
    const maxBytes = sourceUrl.pathname === "/api/v3/problem-analysis" ? 1_100_000 : 16_384;
    const timeout = AbortSignal.timeout(
      sourceUrl.pathname === "/api/v3/problem-analysis" ? 65_000 : 15_000,
    );
    const target = new URL(sourceUrl.pathname + sourceUrl.search, platformOrigin);
    const response = await upstreamFetch(target, {
      method: request.method,
      headers,
      ...(hasBody ? { body: await boundedBody(request, maxBytes) } : {}),
      redirect: "manual",
      signal: AbortSignal.any([request.signal, timeout]),
    });

    if (response.status >= 300 && response.status < 400) {
      return failure("PLATFORM_REDIRECT_REJECTED", "后台网关返回了不允许的重定向", 502);
    }

    const outputHeaders = new Headers({ "cache-control": "no-store" });
    for (const name of FORWARDED_RESPONSE_HEADERS) {
      const value = response.headers.get(name);
      if (value) outputHeaders.set(name, value);
    }
    for (const cookie of response.headers.getSetCookie()) {
      outputHeaders.append("set-cookie", cookie);
    }

    return new Response(response.body, {
      status: response.status,
      headers: outputHeaders,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "BODY_TOO_LARGE") {
      return failure("REQUEST_TOO_LARGE", "请求超过大小限制", 413);
    }
    return failure("PLATFORM_UNAVAILABLE", "后台网关暂时不可用", 503);
  }
}

export function isAllowedPlatformRoute(pathname: string, method: string): boolean {
  return ALLOWED_PLATFORM_ROUTES.get(pathname)?.has(method) ?? false;
}
