import assert from "node:assert/strict";
import test from "node:test";

import {
  isAllowedPlatformRoute,
  proxyPlatformRequest,
} from "../lib/platform-proxy.ts";

const platformOrigin = "http://127.0.0.1:14300";

test("only the ordinary-user canvas API surface is exposed", () => {
  assert.equal(isAllowedPlatformRoute("/api/user/v1/auth/register", "POST"), true);
  assert.equal(isAllowedPlatformRoute("/api/user/v1/auth/login", "POST"), true);
  assert.equal(isAllowedPlatformRoute("/api/v3/problem-analysis", "POST"), true);
  assert.equal(isAllowedPlatformRoute("/api/admin/v1/providers", "GET"), false);
  assert.equal(isAllowedPlatformRoute("/api/user/v1/auth/login", "GET"), false);
});

test("the proxy preserves user-session headers and multiple cookies", async () => {
  let calls = 0;
  const response = await proxyPlatformRequest(
    new Request("http://127.0.0.1:3000/api/user/v1/auth/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://127.0.0.1:3000",
        authorization: "Bearer blocked",
      },
      body: JSON.stringify({ username: "learner", password: "password1" }),
    }),
    platformOrigin,
    async (url, init) => {
      calls += 1;
      assert.equal(String(url), `${platformOrigin}/api/user/v1/auth/login`);
      assert.equal(init.headers.get("origin"), "http://127.0.0.1:3000");
      assert.equal(init.headers.has("authorization"), false);
      const headers = new Headers({
        "content-type": "application/json",
        "x-request-id": "request-1",
      });
      headers.append("set-cookie", "physic_user_session=one; HttpOnly; Path=/api/user/v1");
      headers.append("set-cookie", "physic_user_session=two; HttpOnly; Path=/api/v3/problem-analysis");
      return new Response('{"data":{}}', { headers });
    },
  );

  assert.equal(calls, 1);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("x-request-id"), "request-1");
  assert.equal(response.headers.getSetCookie().length, 2);
});

test("unknown routes, redirects and oversized auth bodies fail closed", async () => {
  let calls = 0;
  const unknown = await proxyPlatformRequest(
    new Request("http://127.0.0.1:3000/api/admin/v1/providers"),
    platformOrigin,
    async () => {
      calls += 1;
      return new Response();
    },
  );
  assert.equal(unknown.status, 404);
  assert.equal(calls, 0);

  const redirect = await proxyPlatformRequest(
    new Request("http://127.0.0.1:3000/api/user/v1/auth/me"),
    platformOrigin,
    async () => {
      calls += 1;
      return new Response(null, { status: 302, headers: { location: "https://invalid.test" } });
    },
  );
  assert.equal(redirect.status, 502);

  const large = await proxyPlatformRequest(
    new Request("http://127.0.0.1:3000/api/user/v1/auth/login", {
      method: "POST",
      body: "x".repeat(16_385),
    }),
    platformOrigin,
    async () => {
      calls += 1;
      return new Response();
    },
  );
  assert.equal(large.status, 413);
  assert.equal(calls, 1);
});
