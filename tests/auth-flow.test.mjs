import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const authForm = await readFile(
  new URL("../components/auth/auth-form.tsx", import.meta.url),
  "utf8",
);
const homepage = await readFile(
  new URL("../app/page.tsx", import.meta.url),
  "utf8",
);
const loginPage = await readFile(
  new URL("../app/login/page.tsx", import.meta.url),
  "utf8",
);
const registerPage = await readFile(
  new URL("../app/register/page.tsx", import.meta.url),
  "utf8",
);
const navbar = await readFile(
  new URL("../components/sections/navbar/default.tsx", import.meta.url),
  "utf8",
);
const sessionSync = await readFile(
  new URL("../lib/auth-session-sync.ts", import.meta.url),
  "utf8",
);

test("public authentication uses the same v3 phone flow as the canvas", () => {
  assert.match(authForm, /\/api\/v3\/auth\/bootstrap/);
  assert.match(authForm, /\/api\/v3\/auth\/challenges/);
  assert.match(authForm, /\/api\/v3\/auth\/login/);
  assert.match(authForm, /\/api\/v3\/auth\/register/);
  assert.doesNotMatch(authForm, /\/api\/user\/v1\/auth\//);
  assert.match(authForm, /purpose: mode/);
  assert.match(authForm, /`\+86\$\{normalizedPhone\}`/);
});

test("registration requires a code, password and matching confirmation", () => {
  assert.match(authForm, /确认密码/);
  assert.match(authForm, /两次输入的密码不一致/);
  assert.match(authForm, /设置密码/);
  assert.match(authForm, /获取验证码/);
  assert.match(authForm, /确认注册/);
});

test("login offers password and SMS code without a blocking skeleton", () => {
  assert.match(authForm, /密码登录/);
  assert.match(authForm, /验证码登录/);
  assert.match(authForm, /正在确认登录状态/);
  assert.doesNotMatch(authForm, /animate-pulse/);
});

test("authentication controls cannot accept clicks before hydration and can reconnect", () => {
  assert.match(authForm, /disabled=\{!hydrated\}/);
  assert.match(authForm, /正在加载登录功能/);
  assert.match(authForm, /15_000/);
  assert.match(authForm, /重新连接账户服务/);
  assert.match(authForm, /onClick=\{connected \? undefined : \(\) => void connect\(\)\}/);
});

test("public authentication has one canonical URL and always returns to the canvas", () => {
  assert.match(authForm, /router\.replace\("\/canvas"\)/);
  assert.doesNotMatch(authForm, /returnTo/);
  assert.match(loginPage, /redirect\(intent \? "\/login\?intent=ai" : "\/login"\)/);
  assert.match(registerPage, /redirect\(intent \? "\/register\?intent=ai" : "\/register"\)/);
  assert.match(loginPage, /query\.returnTo !== undefined/);
  assert.match(registerPage, /query\.returnTo !== undefined/);
});

test("homepage renders immediately and only enhances navigation with session state", () => {
  assert.doesNotMatch(homepage, /HomeSessionGate/);
  assert.match(homepage, /<main/);
  assert.match(navbar, /\/api\/v3\/auth\/bootstrap/);
  assert.match(navbar, /data\.account/);
  assert.match(navbar, /4_000/);
  assert.match(navbar, /游客体验/);
  assert.match(navbar, /进入画布/);
  assert.doesNotMatch(navbar, /router\.replace/);
});

test("homepage and canvas reconcile session changes with the server", () => {
  assert.match(authForm, /publishAuthSessionChange\(\)/);
  assert.match(authForm, /subscribeAuthSessionChanges/);
  assert.match(authForm, /subscribeAuthSessionChanges\(\(\) => void connect\(\)\)/);
  assert.match(navbar, /subscribeAuthSessionChanges/);
  assert.match(navbar, /data\.account[\s\S]*:\s*""/);
  assert.match(navbar, /visibilitychange/);
  assert.match(navbar, /pageshow/);
  assert.match(navbar, /window\.addEventListener\("focus"/);
  assert.match(sessionSync, /xingchi-auth-session-v1/);
  assert.match(sessionSync, /BroadcastChannel/);
  assert.match(sessionSync, /localStorage\.setItem/);
  assert.doesNotMatch(sessionSync, /accessToken|phone|displayName/);
});
