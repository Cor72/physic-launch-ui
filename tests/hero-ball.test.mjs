import assert from "node:assert/strict";
import test from "node:test";

import {
  BALL_RADIUS,
  createHeroBallSimulation,
  visibleTopEdges,
} from "../components/sections/hero/hero-ball-physics.ts";

// Actual transformed corners, including the preview wrappers' skew.
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
const wide = [
  [
    { x: 142, y: 621 },
    { x: 1230, y: 390 },
    { x: 1504, y: 1004 },
    { x: 416, y: 1235 },
  ],
  [
    { x: 404, y: 645 },
    { x: 1492, y: 414 },
    { x: 1765, y: 1028 },
    { x: 677, y: 1260 },
  ],
  [
    { x: 618, y: 698 },
    { x: 1706, y: 466 },
    { x: 1983, y: 1088 },
    { x: 895, y: 1319 },
  ],
];
const quad = (left, top, right, bottom) => [
  { x: left, y: top },
  { x: right, y: top },
  { x: right, y: bottom },
  { x: left, y: bottom },
];
const mixFrames = (a, b, mix) =>
  a.map((frame, i) =>
    frame.map((p, j) => ({
      x: p.x + (b[i][j].x - p.x) * mix,
      y: p.y + (b[i][j].y - p.y) * mix,
    })),
  );
const transition =
  (start, reverse = false) =>
  (seconds) => {
    const progress = Math.min(1, Math.max(0, (seconds - start) / 0.7));
    return mixFrames(rest, hover, reverse ? 1 - progress : progress);
  };

function trace(
  framesAt = () => rest,
  { width = 1265, fps = 120, seconds = 21 } = {},
) {
  const sim = createHeroBallSimulation({
    frames: framesAt(0),
    width,
    height: 1500,
    spawnY: 32,
  });
  const samples = [];
  try {
    for (let i = 1; i <= fps * seconds; i++) {
      const time = i / fps;
      const sample = { ...sim.advance(1000 / fps, framesAt(time)), time };
      assert.ok(Number.isFinite(sample.position.x + sample.position.y));
      samples.push(sample);
      if (sample.phase === "done") break;
    }
    return samples;
  } finally {
    sim.dispose();
  }
}

test("covered edges and offscreen edges cannot act as invisible platforms", () => {
  const edges = visibleTopEdges(
    [quad(-50, 100, 250, 300), quad(100, 50, 300, 220)],
    200,
  );
  const back = edges.filter((edge) => edge.frame === 0);
  assert.equal(back.length, 1);
  assert.equal(back[0].start.x, 0);
  assert.equal(back[0].end.x, 100);
  assert.ok(edges.every((edge) => edge.start.x >= 0 && edge.end.x <= 200));
});

test("the first impact visibly bounces, then loses bounce height downhill", () => {
  const samples = trace();
  const impacts = [];
  for (let i = 1; i < samples.length - 1; i++) {
    const before = samples[i - 1].position;
    const at = samples[i].position;
    const after = samples[i + 1].position;
    if (at.x < 30) break;
    if (at.y > before.y + 0.1 && after.y < at.y - 0.1) impacts.push(i);
  }
  assert.ok(impacts.length >= 2, "must bounce more than once before the wall");
  const heights = impacts.slice(0, 2).map((index, bounce) => {
    const end = impacts[bounce + 1] ?? index + 120;
    return (
      samples[index].position.y -
      Math.min(...samples.slice(index, end).map((s) => s.position.y))
    );
  });
  assert.ok(
    heights[0] > 40 && heights[0] < 160,
    `first bounce height ${heights[0]}`,
  );
  assert.ok(
    heights[1] > 5 && heights[1] < heights[0],
    `bounce heights ${heights}`,
  );
  const at = samples[impacts[0]].position;
  const [a, b] = rest[0];
  const distance =
    ((b.y - a.y) * (at.x - a.x) - (b.x - a.x) * (at.y - a.y)) /
    Math.hypot(b.x - a.x, b.y - a.y);
  assert.ok(
    Math.abs(distance - BALL_RADIUS) < 8,
    "bounce must begin at the real rim",
  );
});

test("the left wall supplies enough bounded assistance to climb back up the first rim", () => {
  const samples = trace();
  const turn = samples.findIndex(
    (s, i) =>
      i > 1 &&
      s.position.x < 25 &&
      samples[i + 1]?.position.x > s.position.x &&
      samples[i - 1].position.x > s.position.x,
  );
  assert.ok(
    turn > 1,
    "ball must actually reach and rebound from the left wall",
  );
  const incoming =
    (samples[turn - 1].position.x - samples[turn - 2].position.x) * 120;
  const outgoing =
    (samples[turn + 2].position.x - samples[turn + 1].position.x) * 120;
  assert.ok(
    outgoing > 0 && outgoing <= Math.abs(incoming) + 400,
    `excessive wall speed ${outgoing}`,
  );
  const firstReturn = samples.slice(turn + 1, turn + 181);
  const returnDistance = Math.max(...firstReturn.map((s) => s.position.x));
  assert.ok(
    returnDistance > 760,
    `wall assistance is too weak, return x=${returnDistance}`,
  );
  assert.ok(
    returnDistance < 1000,
    "wall assistance must remain bounded rather than launch across the whole scene",
  );
});

test("hover cannot steer a ball that is still in free fall", () => {
  const still = trace(() => rest, { seconds: 0.6 });
  const moving = trace(transition(0.1), { seconds: 0.6 });
  for (let i = 0; i < still.length; i++) {
    assert.ok(Math.abs(still[i].position.x - moving[i].position.x) < 0.001);
    assert.ok(Math.abs(still[i].position.y - moving[i].position.y) < 0.001);
  }
});

test("an upward moving rim transfers momentum only at actual contact", () => {
  const flat = [quad(0, 400, 1200, 1100)];
  const moving = (t) =>
    flat.map((frame) =>
      frame.map((p) => ({
        x: p.x,
        y: p.y - 80 * Math.min(0.6, Math.max(0, t - 0.75)),
      })),
    );
  const stillSamples = trace(() => flat, { seconds: 1.2 });
  const movingSamples = trace(moving, { seconds: 1.2 });
  assert.deepEqual(stillSamples[70].position, movingSamples[70].position);
  const reboundSpeed = (samples) => {
    const impact = samples.findIndex((s) => s.phase === "bouncing");
    assert.ok(impact >= 0, "must actually contact the rim");
    return (
      (samples[impact + 1].position.y - samples[impact + 2].position.y) * 120
    );
  };
  assert.ok(
    reboundSpeed(movingSamples) > reboundSpeed(stillSamples) + 80,
    "rising surface must produce a stronger bounce",
  );
  for (let i = 1; i < movingSamples.length; i++) {
    assert.ok(
      Math.hypot(
        movingSamples[i].position.x - movingSamples[i - 1].position.x,
        movingSamples[i].position.y - movingSamples[i - 1].position.y,
      ) < 15,
      "no teleport during the collision",
    );
  }
});

test("fixed stepping preserves natural motion across refresh rates", () => {
  for (const framesAt of [() => rest, transition(0.6), transition(1.3, true)]) {
    const runs = [30, 60, 120].map((fps) =>
      trace(framesAt, { fps, seconds: 4 }),
    );
    for (let i = 0; i < runs[0].length; i++) {
      for (const multiplier of [2, 4]) {
        const a = runs[0][i].position;
        const b =
          runs[multiplier === 2 ? 1 : 2][(i + 1) * multiplier - 1].position;
        assert.ok(
          Math.hypot(a.x - b.x, a.y - b.y) < 8,
          "refresh rate must not change the flight",
        );
      }
    }
  }
});

test("desktop sizes and both hover directions always finish and remain finite", () => {
  const narrow = rest.map((frame) =>
    frame.map((p) => ({ x: (p.x * 1009) / 1265, y: p.y })),
  );
  const scenarios = [
    [() => narrow, 1009],
    [() => rest, 1265],
    [() => wide, 1905],
    ...[0.6, 1.3, 2, 2.6].flatMap((start) =>
      [false, true].map((reverse) => [transition(start, reverse), 1265]),
    ),
  ];
  for (const [framesAt, width] of scenarios) {
    const samples = trace(framesAt, { width });
    assert.equal(samples.at(-1).phase, "done");
    assert.ok(
      samples.every((s) => s.position.x >= -BALL_RADIUS && s.position.y > -200),
      "no extreme launch or wall tunneling",
    );
  }
});
