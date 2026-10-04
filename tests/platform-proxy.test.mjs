import assert from "node:assert/strict";
import test from "node:test";

import {
  findPlatformRoute,
  isAllowedPlatformRoute,
  PLATFORM_ROUTE_RULES,
  proxyPlatformRequest,
} from "../lib/platform-proxy.ts";

const platformOrigin = "http://127.0.0.1:14300";
const operationId = "00000000-0000-4000-8000-000000000001";

test("the anchored route table exposes the canvas contract and nothing administrative", () => {
  const routes = [
    ["/api/user/v1/billing/assets", "GET"],
    ["/api/v3/auth/bootstrap", "GET"],
    ["/api/v3/auth/account", "GET"],
    ["/api/v3/auth/jyeoo-profile", "GET"],
    ["/api/v3/auth/jyeoo-profile", "PUT"],
    ["/api/v3/auth/challenges", "POST"],
    ["/api/v3/auth/login", "POST"],
    ["/api/v3/auth/register", "POST"],
    ["/api/v3/auth/wechat/challenges", "POST"],
    ["/api/v3/auth/wechat/challenges/challenge_1", "GET"],
    ["/api/v3/auth/wechat/qr/media_1", "GET"],
    ["/api/v3/auth/logout", "POST"],
    ["/api/v3/billing/quotes", "POST"],
    ["/api/v3/billing/orders", "POST"],
    ["/api/v3/billing/orders/order_1", "GET"],
    [`/api/v3/billing/order-intents/${operationId}`, "GET"],
    ["/api/v3/billing/records", "GET"],
    ["/api/v3/billing/redemptions", "POST"],
    ["/api/v3/billing/payment-media/media_1", "GET"],
    ["/api/v3/usage/quotes", "POST"],
    ["/api/v3/usage/authorizations", "POST"],
    [`/api/v3/usage/operations/${operationId}`, "GET"],
    [`/api/v3/usage/operations/${operationId}/stages`, "POST"],
    ["/api/v3/problem-upload-policy", "GET"],
    ["/api/v3/problem-analysis", "POST"],
  ];
  for (const [path, method] of routes) assert.equal(isAllowedPlatformRoute(path, method), true, `${method} ${path}`);
  for (const [path, method] of [
    ["/api/admin/v1/providers", "GET"],
    ["/api/admin/v1/billing/orders", "GET"],
    ["/api/v1/providers", "GET"],
    ["/api/v3/auth/bootstrap/extra", "GET"],
    ["/api/v3/usage/operations/not-a-uuid", "GET"],
    ["/api/v3/auth/bootstrap", "POST"],
    ["/api/user/v1/auth/register", "POST"],
    ["/api/user/v1/auth/login", "POST"],
    ["/api/user/v1/auth/logout", "POST"],
    ["/api/user/v1/auth/me", "GET"],
  ]) assert.equal(isAllowedPlatformRoute(path, method), false, `${method} ${path}`);
  assert.ok(PLATFORM_ROUTE_RULES.every(rule => rule.pathPattern.source.startsWith("^") && rule.pathPattern.source.endsWith("$")));
});

test("encoded, ambiguous and traversal-shaped paths fail before route matching", async () => {
  for (const path of [
    "/api/v3/auth%2fbootstrap",
    "/api/v3/auth%252fbootstrap",
    "/api/v3//auth/bootstrap",
    "/api/v3/auth\\bootstrap",
    "/api/v3/auth/../bootstrap",
  ]) assert.equal(isAllowedPlatformRoute(path, "GET"), false, path);

  let calls = 0;
  for (const path of ["/api/v3/auth%2fbootstrap", "/api/v3/auth%252fbootstrap", "/api/v3//auth/bootstrap"]) {
    const response = await proxyPlatformRequest(new Request(`http://127.0.0.1:4400${path}`), platformOrigin, async () => { calls++; return new Response(); });
    assert.equal(response.status, 404, path);
  }
  assert.equal(calls, 0);
});

test("provider routes use the 1.2 MB and 65 second envelope; ordinary routes stay bounded", () => {
  for (const path of ["/api/v3/problem-analysis", `/api/v3/usage/operations/${operationId}/stages`]) {
    const rule = findPlatformRoute(path, "POST");
    assert.equal(rule?.maxBodyBytes, 1_200_000);
    assert.equal(rule?.timeoutMs, 65_000);
  }
  const login = findPlatformRoute("/api/v3/auth/login", "POST");
  assert.equal(login?.maxBodyBytes, 16_384);
  assert.equal(login?.timeoutMs, 15_000);
});

test("the proxy forwards only approved session and usage headers and preserves multiple cookies", async () => {
  let calls = 0;
  const response = await proxyPlatformRequest(
    new Request(`http://127.0.0.1:4400/api/v3/usage/operations/${operationId}/stages`, {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=test",
        cookie: "physic_user_session=test-session",
        origin: "http://127.0.0.1:4400",
        "idempotency-key": "11111111-1111-4111-8111-111111111111",
        "x-csrf-token": "test-csrf",
        "x-usage-authorization": "test-authorization",
        "x-usage-stage": "search",
        authorization: "Bearer blocked",
      },
      body: "--test--",
    }),
    platformOrigin,
    async (url, init) => {
      calls++;
      assert.equal(String(url), `${platformOrigin}/api/v3/usage/operations/${operationId}/stages`);
      for (const name of ["cookie", "origin", "idempotency-key", "x-csrf-token", "x-usage-authorization", "x-usage-stage"]) assert.equal(init.headers.has(name), true, name);
      assert.equal(init.headers.has("authorization"), false);
      const headers = new Headers({
        "content-type": "application/json",
        "x-request-id": "request-1",
        "ratelimit-remaining": "7",
      });
      headers.append("set-cookie", "physic_user_session=one; HttpOnly; Path=/api/user/v1");
      headers.append("set-cookie", "physic_user_session=two; HttpOnly; Path=/api/v3");
      return new Response('{"ok":true}', { headers });
    },
  );

  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-request-id"), "request-1");
  assert.equal(response.headers.get("ratelimit-remaining"), "7");
  assert.equal(response.headers.getSetCookie().length, 2);
});

test("the multipart boundary accepts exactly 1.2 MB and rejects one extra byte before upstream", async () => {
  const path = `http://127.0.0.1:4400/api/v3/usage/operations/${operationId}/stages`;
  let calls = 0;
  const accepted = await proxyPlatformRequest(new Request(path, { method: "POST", body: new Uint8Array(1_200_000) }), platformOrigin, async () => { calls++; return Response.json({ ok: true }); });
  assert.equal(accepted.status, 200);
  const rejected = await proxyPlatformRequest(new Request(path, { method: "POST", body: new Uint8Array(1_200_001) }), platformOrigin, async () => { calls++; return Response.json({ ok: true }); });
  assert.equal(rejected.status, 413);
  assert.equal(calls, 1);
});

test("unknown routes, wrong methods, redirects and bad upstream configuration fail closed", async () => {
  let calls = 0;
  const upstream = async () => { calls++; return new Response(); };
  assert.equal((await proxyPlatformRequest(new Request("http://127.0.0.1:4400/api/admin/v1/providers"), platformOrigin, upstream)).status, 404);
  assert.equal((await proxyPlatformRequest(new Request("http://127.0.0.1:4400/api/v3/auth/bootstrap", { method: "POST" }), platformOrigin, upstream)).status, 405);
  assert.equal((await proxyPlatformRequest(new Request("http://127.0.0.1:4400/api/v3/auth/bootstrap"), "http://remote.example", upstream)).status, 503);
  assert.equal(calls, 0);

  const redirect = await proxyPlatformRequest(new Request("http://127.0.0.1:4400/api/v3/auth/bootstrap"), platformOrigin, async () => { calls++; return new Response(null, { status: 302, headers: { location: "https://invalid.test" } }); });
  assert.equal(redirect.status, 502);
  assert.equal(redirect.headers.get("location"), null);
  assert.equal(calls, 1);
});
