import Matter from "matter-js";

export interface Point {
  x: number;
  y: number;
}
export type FrameQuad = [Point, Point, Point, Point];
export interface Edge {
  frame: number;
  start: Point;
  end: Point;
}
export type BallPhase = "drop" | "hop" | "second" | "third" | "exit" | "done";
export interface BallSnapshot {
  position: Point;
  phase: BallPhase;
}

export const BALL_RADIUS = 14;
const GRAVITY = 1000; // CSS pixels / second²; intentionally independent of DPR.
const STEP = 1000 / 120;
const THICKNESS = 8;
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));
const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});
const cross = (a: Point, b: Point) => a.x * b.y - a.y * b.x;

// Clip against the actual transformed quadrilaterals, not their axis-aligned boxes.
function coveredInterval(
  a: Point,
  b: Point,
  quad: FrameQuad,
): [number, number] | null {
  let low = 0,
    high = 1;
  const direction = { x: b.x - a.x, y: b.y - a.y };
  for (let i = 0; i < 4; i++) {
    const p = quad[i],
      q = quad[(i + 1) % 4];
    const edge = { x: q.x - p.x, y: q.y - p.y };
    const start = cross(edge, { x: a.x - p.x, y: a.y - p.y });
    const change = cross(edge, direction);
    if (Math.abs(change) < 0.0001) {
      if (start < 0) return null;
    } else if (change > 0) low = Math.max(low, -start / change);
    else high = Math.min(high, -start / change);
    if (low >= high) return null;
  }
  return [low, high];
}

export function visibleTopEdges(frames: FrameQuad[], width: number): Edge[] {
  return frames.flatMap((quad, frame) => {
    const [a, b] = quad;
    const dx = b.x - a.x;
    const length = Math.hypot(dx, b.y - a.y);
    if (dx <= 0 || length < 80) return [];
    let intervals: [number, number][] = [
      [
        Math.max(20 / length, -a.x / dx),
        Math.min(1 - 20 / length, (width - a.x) / dx),
      ],
    ];
    for (const front of frames.slice(frame + 1)) {
      const hidden = coveredInterval(a, b, front);
      if (!hidden) continue;
      intervals = intervals.flatMap(([low, high]) => {
        if (hidden[1] <= low || hidden[0] >= high) return [[low, high]];
        const visible: [number, number][] = [];
        if (hidden[0] > low) visible.push([low, hidden[0]]);
        if (hidden[1] < high) visible.push([hidden[1], high]);
        return visible;
      });
    }
    return intervals
      .filter(([low, high]) => (high - low) * length > BALL_RADIUS * 2)
      .map(([low, high]) => ({
        frame,
        start: lerp(a, b, low),
        end: lerp(a, b, high),
      }));
  });
}

function landing(edges: Edge[], frame: number, desiredX: number): Point {
  const candidates = edges.filter((edge) => edge.frame === frame);
  if (!candidates.length) throw new Error("Preview edge is not visible");
  const edge = candidates.reduce((best, next) => {
    const distance = (item: Edge) =>
      Math.abs(desiredX - clamp(desiredX, item.start.x + 18, item.end.x - 18));
    return distance(next) < distance(best) ? next : best;
  });
  const dx = edge.end.x - edge.start.x,
    dy = edge.end.y - edge.start.y;
  const length = Math.hypot(dx, dy);
  const x = clamp(desiredX, edge.start.x + 18, edge.end.x - 18);
  const point = lerp(edge.start, edge.end, (x - edge.start.x) / dx);
  return {
    x: point.x + (dy / length) * BALL_RADIUS,
    y: point.y - (dx / length) * BALL_RADIUS,
  };
}

function targetFor(
  phase: BallPhase,
  frames: FrameQuad[],
  width: number,
  hopX: number,
): Point {
  const edges = visibleTopEdges(frames, width);
  const firstX = frames[0][1].x - clamp(width * 0.08, 75, 145);
  if (phase === "drop") return landing(edges, 0, firstX);
  if (phase === "hop") return landing(edges, 0, firstX - hopX);
  const frame = phase === "second" ? 1 : 2;
  return landing(
    edges,
    frame,
    Math.max(
      frames[frame - 1][1].x + 48,
      Math.min(width - 46, frames[frame][1].x - 100),
    ),
  );
}

export function ballOrigin(
  frames: FrameQuad[],
  width: number,
  spawnY: number,
): Point {
  return { x: targetFor("drop", frames, width, 0).x, y: spawnY };
}

/** Gravity and contacts are simulated. Launch impulses deliberately choreograph
 * this decorative route; they must not be reused as an educational physics model. */
export function createHeroBallSimulation(options: {
  frames: FrameQuad[];
  width: number;
  height: number;
  spawnY: number;
}) {
  const { Bodies, Body, Composite, Engine, Events } = Matter;
  const engine = Engine.create({
    positionIterations: 8,
    velocityIterations: 8,
  });
  engine.gravity.y = 1;
  engine.gravity.scale = GRAVITY / 1_000_000;
  let frames = options.frames;
  const origin = ballOrigin(frames, options.width, options.spawnY);
  const ball = Bodies.circle(origin.x, origin.y, BALL_RADIUS, {
    friction: 0,
    frictionAir: 0,
    restitution: 0,
    slop: 0.01,
  });
  Composite.add(engine.world, ball);
  const platforms = new Map<
    string,
    { body: Matter.Body; length: number; frame: number }
  >();
  let phase: BallPhase = "drop";
  let elapsed = 0,
    accumulator = 0,
    lastContact = -1;
  let contact: number | null = null;
  let target = targetFor("drop", frames, options.width, 0);
  let arrival = Math.sqrt(
    Math.max(1, (2 * (target.y - options.spawnY)) / GRAVITY),
  );
  let disposed = false;

  function syncPlatforms() {
    const active = new Set<string>();
    for (const [index, edge] of visibleTopEdges(
      frames,
      options.width,
    ).entries()) {
      const key = `${edge.frame}:${index}`;
      active.add(key);
      const dx = edge.end.x - edge.start.x,
        dy = edge.end.y - edge.start.y;
      const length = Math.hypot(dx, dy),
        angle = Math.atan2(dy, dx);
      const center = {
        x: (edge.start.x + edge.end.x) / 2 - ((dy / length) * THICKNESS) / 2,
        y: (edge.start.y + edge.end.y) / 2 + ((dx / length) * THICKNESS) / 2,
      };
      let platform = platforms.get(key);
      if (!platform) {
        platform = {
          body: Bodies.rectangle(center.x, center.y, length, THICKNESS, {
            isStatic: true,
            friction: 0,
            restitution: 0,
            slop: 0.01,
          }),
          length,
          frame: edge.frame,
        };
        platforms.set(key, platform);
        Composite.add(engine.world, platform.body);
      }
      Body.setAngle(platform.body, 0);
      Body.scale(platform.body, length / platform.length, 1);
      Body.setAngle(platform.body, angle);
      Body.setPosition(platform.body, center);
      platform.length = length;
    }
    for (const [key, platform] of platforms) {
      if (!active.has(key)) {
        Composite.remove(engine.world, platform.body);
        platforms.delete(key);
      }
    }
  }

  Events.on(engine, "collisionStart", (event) => {
    if (elapsed - lastContact < 0.12 || phase === "exit") return;
    const expected = phase === "second" ? 1 : phase === "third" ? 2 : 0;
    for (const pair of event.pairs) {
      const other =
        pair.bodyA === ball
          ? pair.bodyB
          : pair.bodyB === ball
            ? pair.bodyA
            : null;
      if (
        other &&
        [...platforms.values()].some(
          (p) => p.body === other && p.frame === expected,
        )
      )
        contact = expected;
    }
  });

  function launch() {
    const next: Record<string, BallPhase> = {
      drop: "hop",
      hop: "second",
      second: "third",
      third: "exit",
    };
    phase = next[phase];
    lastContact = elapsed;
    const height =
      phase === "hop"
        ? 65
        : phase === "second"
          ? 105
          : phase === "third"
            ? 80
            : 60;
    target =
      phase === "exit"
        ? { x: options.width + BALL_RADIUS + 2, y: ball.position.y }
        : targetFor(phase, frames, options.width, 65);
    const vy = -Math.sqrt(2 * GRAVITY * height);
    // Cross the right edge after the apex, while still clearing the last rim.
    const seconds =
      phase === "exit"
        ? 0.6
        : (-vy +
            Math.sqrt(
              vy * vy +
                2 * GRAVITY * Math.max(-height + 1, target.y - ball.position.y),
            )) /
          GRAVITY;
    arrival = elapsed + seconds;
    Body.setVelocity(ball, {
      x: (target.x - ball.position.x) / seconds / 60,
      y: vy / 60,
    });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    Events.off(engine, "collisionStart");
    Composite.clear(engine.world, false);
    Engine.clear(engine);
    platforms.clear();
  }

  return {
    advance(delta: number, nextFrames: FrameQuad[]): BallSnapshot {
      if (disposed) return { position: { ...ball.position }, phase: "done" };
      frames = nextFrames;
      syncPlatforms();
      accumulator += clamp(delta, 0, 100);
      while (accumulator + 0.00001 >= STEP) {
        accumulator -= STEP;
        elapsed += STEP / 1000;
        if (phase !== "exit") {
          const nextTarget = targetFor(phase, frames, options.width, 65);
          const remaining = Math.max(0.16, arrival - elapsed);
          // Only correct for DOM motion. Stationary cards leave the ballistic
          // flight untouched; no position teleport or synthetic collision.
          Body.setVelocity(ball, {
            x:
              ball.velocity.x +
              clamp((nextTarget.x - target.x) / remaining / 60, -1.5, 1.5),
            y:
              ball.velocity.y +
              clamp((nextTarget.y - target.y) / remaining / 60, -1.5, 1.5),
          });
          target = nextTarget;
        }
        contact = null;
        Engine.update(engine, STEP);
        if (contact !== null) launch();
        if (
          elapsed > 8 ||
          (phase === "exit" &&
            (ball.position.x > options.width + BALL_RADIUS ||
              ball.position.y > options.height + BALL_RADIUS))
        ) {
          phase = "done";
          dispose();
          break;
        }
      }
      return { position: { ...ball.position }, phase };
    },
    dispose,
  };
}
