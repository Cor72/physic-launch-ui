import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("production output is standalone and keeps internal origins server-side", async () => {
  const [config, dockerfile, ignore, proxy] = await Promise.all([
    read("../next.config.mjs"),
    read("../Dockerfile.production"),
    read("../Dockerfile.production.dockerignore"),
    read("../lib/platform-proxy.ts"),
  ]);

  assert.match(config, /output: "standalone"/);
  assert.match(config, /outputFileTracingRoot: dirname\(root\)/);
  assert.match(config, /PHYSICS_CANVAS_ORIGIN/);
  assert.match(proxy, /PHYSICS_PLATFORM_ORIGIN/);
  assert.match(dockerfile, /ARG PHYSICS_CANVAS_ORIGIN=http:\/\/canvas:8080/);
  assert.match(dockerfile, /USER node/);
  assert.match(ignore, /^physic-launch-ui\/\.env$/m);
  assert.doesNotMatch(dockerfile, /COPY\s+.*\.env/);
});
