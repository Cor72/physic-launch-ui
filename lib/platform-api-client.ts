/**
 * 本地平台 API 客户端。
 *
 * 原先来自兄弟仓库 physic-platform 的 `@physic/api-client`（openapi-fetch 风格）。
 * 这里按相同的调用形态（GET/POST + params/body/signal/cache）用原生 fetch 实现，
 * 调用方代码无需改动。
 */

import type {
  AuthBootstrap,
  AuthChallenge,
  AuthSession,
  CanvasBillingOrder,
  UserPrincipal,
} from "./platform-contracts";

export interface PlatformRequestParams {
  path?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | undefined | null>;
  header?: Record<string, string>;
}

export interface PlatformRequestOptions {
  params?: PlatformRequestParams;
  body?: unknown;
  signal?: AbortSignal;
  cache?: RequestCache;
  headers?: Record<string, string>;
}

export interface PlatformResponse<TData> {
  data?: TData;
  error?: unknown;
  response: Response;
}

interface GetResponses {
  "/api/v3/auth/bootstrap": AuthBootstrap;
  "/api/v3/auth/account": UserPrincipal;
  "/api/v3/billing/orders/by-number/{orderNo}": CanvasBillingOrder;
}

interface PostResponses {
  "/api/v3/auth/challenges": AuthChallenge;
  "/api/v3/auth/login": AuthSession;
  "/api/v3/auth/register": AuthSession;
}

export interface PlatformApiClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
}

type Method = "GET" | "POST";

function buildUrl(
  baseUrl: string,
  path: string,
  params?: PlatformRequestParams,
): URL {
  const pathname = path.replace(/\{([^}]+)\}/g, (_match, key: string) => {
    const value = params?.path?.[key];
    return encodeURIComponent(value === undefined ? "" : String(value));
  });
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const url = new URL(pathname.replace(/^\//, ""), base);

  for (const [key, value] of Object.entries(params?.query ?? {})) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }

  return url;
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

async function request<TData>(
  method: Method,
  baseUrl: string,
  path: string,
  options: PlatformRequestOptions | undefined,
  fetchImpl: typeof fetch,
): Promise<PlatformResponse<TData>> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.params?.header,
    ...options?.headers,
  };

  const init: RequestInit = {
    method,
    headers,
    signal: options?.signal,
    cache: options?.cache,
    credentials: "include",
  };

  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
    init.body = JSON.stringify(options.body);
  }

  const response = await fetchImpl(buildUrl(baseUrl, path, options?.params), init);
  const payload = await readBody(response);

  if (!response.ok) {
    return { data: undefined, error: payload, response };
  }

  return { data: payload as TData | undefined, error: undefined, response };
}

export function createPlatformApiClient({
  baseUrl,
  fetch: fetchImpl = fetch,
}: PlatformApiClientOptions) {
  return {
    GET<TPath extends keyof GetResponses>(
      path: TPath,
      options?: PlatformRequestOptions,
    ): Promise<PlatformResponse<GetResponses[TPath]>> {
      return request<GetResponses[TPath]>(
        "GET",
        baseUrl,
        path,
        options,
        fetchImpl,
      );
    },
    POST<TPath extends keyof PostResponses>(
      path: TPath,
      options?: PlatformRequestOptions,
    ): Promise<PlatformResponse<PostResponses[TPath]>> {
      return request<PostResponses[TPath]>(
        "POST",
        baseUrl,
        path,
        options,
        fetchImpl,
      );
    },
  };
}

export type PlatformApiClient = ReturnType<typeof createPlatformApiClient>;
