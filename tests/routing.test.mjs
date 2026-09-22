import assert from "node:assert/strict";
import test from "node:test";

import { resolveInternalOrigin } from "../lib/server-origin.mjs";
import { safeReturnTo } from "../lib/user-session.ts";

test("internal service origins allow HTTPS and loopback HTTP only", () => {
  assert.equal(
    resolveInternalOrigin("http://127.0.0.1:4481", {
      name: "PHYSICS_CANVAS_ORIGIN",
      fallback: "http://127.0.0.1:4481",
    }),
    "http://127.0.0.1:4481",
  );
  assert.equal(
    resolveInternalOrigin("https://canvas.internal.example", {
      name: "PHYSICS_CANVAS_ORIGIN",
      fallback: "http://127.0.0.1:4481",
    }),
    "https://canvas.internal.example",
  );
  for (const value of [
    "http://remote.example",
    "https://user:secret@remote.example",
    "https://remote.example/path",
  ]) {
    assert.throws(() =>
      resolveInternalOrigin(value, {
        name: "PHYSICS_CANVAS_ORIGIN",
        fallback: "http://127.0.0.1:4481",
      }),
    );
  }
});

test("authentication return paths cannot redirect away from the canvas", () => {
  assert.equal(safeReturnTo("/canvas"), "/canvas");
  assert.equal(safeReturnTo("https://invalid.test"), "/canvas");
  assert.equal(safeReturnTo("//invalid.test"), "/canvas");
  assert.equal(safeReturnTo(undefined), "/canvas");
});
