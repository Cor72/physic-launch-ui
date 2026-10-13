import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { resolveInternalOrigin } from "../lib/server-origin.mjs";

test("internal service origins allow HTTPS, loopback HTTP and explicit private hosts only", () => {
  assert.equal(
    resolveInternalOrigin("http://canvas:8080", {
      name: "PHYSICS_CANVAS_ORIGIN",
      fallback: "http://127.0.0.1:4481",
      allowedHttpHosts: ["canvas"],
    }),
    "http://canvas:8080",
  );
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
        allowedHttpHosts: ["canvas"],
      }),
    );
  }
});

test("the unified site owns /canvas and defaults to the final canvas development port", async () => {
  const config = await readFile(new URL("../next.config.mjs", import.meta.url), "utf8");
  assert.match(config, /agentRules:\s*false/);
  assert.match(config, /allowedDevOrigins:\s*\["127\.0\.0\.1"\]/);
  assert.match(config, /fallback:\s*"http:\/\/127\.0\.0\.1:4481"/);
  assert.match(config, /source:\s*"\/canvas"[\s\S]*destination:\s*`\$\{canvasOrigin\}\/canvas\/`/);
  assert.match(config, /source:\s*"\/canvas\/:path\*"[\s\S]*destination:\s*`\$\{canvasOrigin\}\/canvas\/:path\*`/);
  for (const asset of [
    "xingchi-vision-mark.svg",
    "xingchi-vision-micro.svg",
    "xingchi-vision-wordmark.svg",
    "xingchi-ai-aperture-mark.png",
  ]) {
    assert.match(config, new RegExp(asset.replace(".", "\\.")));
  }
  assert.match(
    config,
    /destination:\s*`\$\{canvasOrigin\}\/canvas\/\$\{asset\}`/,
    "legacy absolute brand paths must remain available without editing the protected V4 App",
  );
});
