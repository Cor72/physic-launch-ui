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
export type BallPhase = "drop" | "bouncing" | "return" | "done";
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

export function ballOrigin(
  frames: FrameQuad[],
  width: number,
  spawnY: number,
): Point {
  const firstX = frames[0][1].x - clamp(width * 0.08, 75, 145);
  return { x: landing(visibleTopEdges(frames, width), 0, firstX).x, y: spawnY };
}

/** A decorative simulation: gravity, restitution and moving rims determine the
 * route. Only the first left-wall contact adds a small, fixed impulse. */
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
  let measuredFrames = options.frames;
  let simulatedFrames = options.frames;
  const origin = ballOrigin(options.frames, options.width, options.spawnY);
  const ball = Bodies.circle(origin.x, origin.y, BALL_RADIUS, {
    friction: 0.01,
    frictionStatic: 0.02,
    frictionAir: 0.0005,
    restitution: 0.55,
    slop: 0.01,
  });
  // Its inner face coincides with the left viewport edge.
  const wall = Bodies.rectangle(
    -THICKNESS / 2,
    options.height / 2,
    THICKNESS,
    options.height * 3,
    { isStatic: true, slop: 0.01 },
  );
  // Matter resets these when a body becomes static; configure them afterwards.
  Body.set(wall, { friction: 0, restitution: 0.8 });
  Composite.add(engine.world, [ball, wall]);
  const platforms = new Map<string, { body: Matter.Body; length: number }>();
  let phase: BallPhase = "drop";
  let elapsed = 0;
  let accumulator = 0;
  let settledFor = 0;
  let wallContact = false;
  let wallBoosted = false;
  let disposed = false;

  function syncPlatforms(frames: FrameQuad[], previous: FrameQuad[]) {
    const active = new Set<string>();
    const segments = new Map<number, number>();
    for (const edge of visibleTopEdges(frames, options.width)) {
      const index = segments.get(edge.frame) ?? 0;
      segments.set(edge.frame, index + 1);
      const key = `${edge.frame}:${index}`;
      active.add(key);
      const dx = edge.end.x - edge.start.x;
      const dy = edge.end.y - edge.start.y;
      const length = Math.hypot(dx, dy);
      const angle = Math.atan2(dy, dx);
      const center = {
        x: (edge.start.x + edge.end.x) / 2 - ((dy / length) * THICKNESS) / 2,
        y: (edge.start.y + edge.end.y) / 2 + ((dx / length) * THICKNESS) / 2,
      };
      let platform = platforms.get(key);
      if (!platform) {
        platform = {
          body: Bodies.rectangle(center.x, center.y, length, THICKNESS, {
            angle,
            isStatic: true,
            friction: 0.01,
            restitution: 0,
            slop: 0.01,
          }),
          length,
        };
        platforms.set(key, platform);
        Composite.add(engine.world, platform.body);
      } else {
        const body = platform.body;
        if (Math.abs(length - platform.length) > 0.000001) {
          const oldAngle = body.angle;
          Body.setAngle(body, 0);
          Body.scale(body, length / platform.length, 1);
          Body.setAngle(body, oldAngle);
        }
        const angularStep = angle - body.angle;
        Body.setAngle(body, angle);
        Body.setAngularVelocity(body, angularStep);
        Body.setPosition(body, center);
        platform.length = length;

        // Clipping can move the segment's midpoint without moving the card.
        // Use the previous position of the SAME material point for its velocity.
        const [a, b] = frames[edge.frame];
        const [prevA, prevB] = previous[edge.frame];
        const fraction = ((edge.start.x + edge.end.x) / 2 - a.x) / (b.x - a.x);
        const prevDx = prevB.x - prevA.x;
        const prevDy = prevB.y - prevA.y;
        const prevLength = Math.hypot(prevDx, prevDy);
        const prevPoint = lerp(prevA, prevB, fraction);
        const prevCenter = {
          x: prevPoint.x - ((prevDy / prevLength) * THICKNESS) / 2,
          y: prevPoint.y + ((prevDx / prevLength) * THICKNESS) / 2,
        };
        // Static bodies are not integrated by Engine.update. Their contact
        // velocities therefore need displacement per fixed substep, not per RAF.
        Body.setVelocity(body, {
          x: center.x - prevCenter.x,
          y: center.y - prevCenter.y,
        });
      }
    }
    for (const [key, platform] of platforms) {
      if (!active.has(key)) {
        Composite.remove(engine.world, platform.body);
        platforms.delete(key);
      }
    }
  }
  syncPlatforms(options.frames, options.frames);

  Events.on(engine, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      const other =
        pair.bodyA === ball
          ? pair.bodyB
          : pair.bodyB === ball
            ? pair.bodyA
            : null;
      if (!other) continue;
      if (other === wall && !wallBoosted) wallContact = true;
      if (phase === "drop" && other !== wall) phase = "bouncing";
    }
  });

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
      const duration = clamp(delta, 0, 100);
      const previousMeasurement = measuredFrames;
      measuredFrames = nextFrames;
      accumulator += duration;
      while (accumulator + 0.00001 >= STEP) {
        accumulator -= STEP;
        elapsed += STEP / 1000;
        const progress =
          duration > 0 ? clamp((duration - accumulator) / duration, 0, 1) : 1;
        const frames = nextFrames.map(
          (frame, i) =>
            frame.map((point, j) =>
              lerp(previousMeasurement[i][j], point, progress),
            ) as FrameQuad,
        );
        syncPlatforms(frames, simulatedFrames);
        simulatedFrames = frames;

        wallContact = false;
        Engine.update(engine, STEP);
        if (wallContact) {
          wallBoosted = true;
          phase = "return";
          // Add a bounded kick AFTER Matter resolves the real contact.
          // Never replace the velocity with a solved route to another card.
          Body.setVelocity(ball, {
            x:
              ball.velocity.x +
              Math.max(0, Math.min(260, 720 - ball.velocity.x * 60)) / 60,
            y: ball.velocity.y - 160 / 60,
          });
        }
        const surfaceMoving = [...platforms.values()].some(
          ({ body, length }) =>
            Math.hypot(body.velocity.x, body.velocity.y) +
              (Math.abs(body.angularVelocity) * length) / 2 >
            0.05,
        );
        settledFor =
          phase !== "drop" && !surfaceMoving && Body.getSpeed(ball) * 60 < 12
            ? settledFor + STEP / 1000
            : 0;
        if (
          elapsed >= 20 ||
          settledFor > 1 ||
          ball.position.x > options.width + BALL_RADIUS ||
          ball.position.x < -BALL_RADIUS ||
          ball.position.y > options.height + BALL_RADIUS ||
          !Number.isFinite(ball.position.x + ball.position.y)
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
