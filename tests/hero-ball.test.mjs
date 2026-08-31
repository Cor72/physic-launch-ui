import assert from "node:assert/strict";
import test from "node:test";

import {
  createHeroBallSimulation,
  visibleTopEdges,
} from "../components/sections/hero/hero-ball-physics.ts";

// Measured desktop proportions, including the preview wrappers' skew.
const rest = [
  [
    { x: -143, y: 616 },
    { x: 898, y: 395 },
    { x: 1160, y: 983 },
    { x: 119, y: 1204 },
  ],
  [
    { x: 107, y: 640 },
    { x: 1148, y: 419 },
    { x: 1410, y: 1007 },
    { x: 369, y: 1228 },
  ],
  [
    { x: 313, y: 691 },
    { x: 1354, y: 470 },
    { x: 1619, y: 1065 },
    { x: 578, y: 1286 },
  ],
];
const hover = [
  [
    { x: -222, y: 560 },
    { x: 819, y: 451 },
    { x: 953, y: 1180 },
    { x: -88, y: 1289 },
  ],
  [
    { x: 111, y: 584 },
    { x: 1152, y: 475 },
    { x: 1286, y: 1204 },
    { x: 245, y: 1313 },
  ],
  [
    { x: 545, y: 615 },
    { x: 1586, y: 506 },
    { x: 1721, y: 1242 },
    { x: 680, y: 1351 },
  ],
];
const quad = (left, top, right, bottom) => [
  { x: left, y: top },
  { x: right, y: top },
  { x: right, y: bottom },
  { x: left, y: bottom },
];

test("covered edges and offscreen edges cannot act as invisible platforms", () => {
  const edges = visibleTopEdges(
    [quad(-50, 100, 250, 300), quad(100, 50, 300, 220)],
    200,
  );
  assert.ok(edges.length > 0);
  const back = edges.filter((edge) => edge.frame === 0);
  assert.equal(back.length, 1);
  assert.equal(back[0].start.x, 0);
  assert.equal(back[0].end.x, 100);
  assert.ok(edges.every((edge) => edge.start.x >= 0 && edge.end.x <= 200));
});

function exercise(framesAt, width, fps) {
  const sim = createHeroBallSimulation({
    frames: framesAt(0),
    width,
    height: 1500,
    spawnY: 32,
  });
  const phases = [];
  let last = "drop";
  let end;
  let previousY = 32;
  let previousX = 0;
  try {
    for (let i = 1; i <= fps * 8; i++) {
      const seconds = i / fps;
      const frames = framesAt(seconds);
      const snapshot = sim.advance(1000 / fps, frames);
      assert.ok(
        Number.isFinite(snapshot.position.x) &&
          Number.isFinite(snapshot.position.y),
      );
      if (snapshot.phase !== last) {
        if (snapshot.phase === "done")
          assert.ok(
            snapshot.position.y - previousY > snapshot.position.x - previousX,
            "leave visibly down-right rather than almost horizontally",
          );
        phases.push(snapshot.phase);
        if (snapshot.phase !== "done") {
          const hitFrame = { hop: 0, second: 0, third: 1, exit: 2 }[
            snapshot.phase
          ];
          const [a, b] = frames[hitFrame];
          const dx = b.x - a.x,
            dy = b.y - a.y;
          const distance =
            (dy * (snapshot.position.x - a.x) -
              dx * (snapshot.position.y - a.y)) /
            Math.hypot(dx, dy);
          assert.ok(
            distance >= 9 && distance < 40,
            `bounce must touch edge ${hitFrame}, gap=${distance}`,
          );
        }
        last = snapshot.phase;
      }
      if (snapshot.phase === "done") {
        end = seconds;
        break;
      }
      previousY = snapshot.position.y;
      previousX = snapshot.position.x;
    }
    assert.deepEqual(phases, ["hop", "second", "third", "exit", "done"]);
    assert.ok(end >= 3.5 && end <= 6.5, `unexpected duration ${end}`);
    return end;
  } finally {
    sim.dispose();
  }
}

test("the ball touches the first edge twice, then the second and third, before leaving", () => {
  exercise(() => rest, 1265, 60);
  exercise(() => hover, 1265, 60);
});

test("fixed stepping preserves the route across frame rates and desktop sizes", () => {
  for (const width of [1009, 1265, 1905]) {
    const scale = width / 1265;
    const frames = rest.map((frame) =>
      frame.map((p) => ({ x: p.x * scale, y: p.y * Math.min(scale, 1.2) })),
    );
    const durations = [30, 60, 120].map((fps) =>
      exercise(() => frames, width, fps),
    );
    assert.ok(Math.max(...durations) - Math.min(...durations) < 0.1);
  }
});

test("moving preview edges stay attached to the collision route", () => {
  for (const start of [0.6, 1.3, 2.0, 2.6]) {
    for (const reverse of [false, true]) {
      exercise(
        (seconds) => {
          const progress = Math.min(1, Math.max(0, (seconds - start) / 0.7));
          const mix = reverse ? 1 - progress : progress;
          return rest.map((frame, i) =>
            frame.map((p, j) => ({
              x: p.x + (hover[i][j].x - p.x) * mix,
              y: p.y + (hover[i][j].y - p.y) * mix,
            })),
          );
        },
        1265,
        60,
      );
    }
  }
});
