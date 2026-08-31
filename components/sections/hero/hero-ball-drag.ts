import type { Point } from "./hero-ball-physics";

export function createBallGesture(
  start: Point,
  origin: Point,
  project: (point: Point) => Point,
) {
  let dragged = false;
  let samples: Array<Point & { time: number }> = [];
  const update = (pointer: Point, time: number) => {
    // Once a gesture becomes a drag, returning to the start must not turn it into a click.
    dragged ||= Math.hypot(pointer.x - start.x, pointer.y - start.y) > 5;
    const position = dragged
      ? project({
          x: origin.x + pointer.x - start.x,
          y: origin.y + pointer.y - start.y,
        })
      : { ...origin };
    samples = [
      ...samples.filter((sample) => time - sample.time <= 100),
      { ...position, time },
    ].slice(-20);
    const first = samples[0];
    const seconds = (time - first.time) / 1000;
    const velocity =
      seconds >= 0.008
        ? {
            x: (position.x - first.x) / seconds,
            y: (position.y - first.y) / seconds,
          }
        : { x: 0, y: 0 };
    const scale = Math.min(1, 450 / Math.hypot(velocity.x, velocity.y));
    return {
      position,
      velocity: { x: velocity.x * scale, y: velocity.y * scale },
      dragged,
    };
  };
  return { update };
}

export function elasticDragPosition(
  anchor: Point,
  length: number,
  pointer: Point,
): Point {
  const limit = length * 4;
  let dx = pointer.x - anchor.x,
    dy = Math.max(20, pointer.y - anchor.y);
  const scale = Math.min(1, limit / Math.hypot(dx, dy));
  dx *= scale;
  dy = Math.max(20, dy * scale);
  const horizontalLimit = Math.sqrt(Math.max(0, limit ** 2 - dy ** 2));
  return {
    x: anchor.x + Math.max(-horizontalLimit, Math.min(horizontalLimit, dx)),
    y: anchor.y + dy,
  };
}

export function createElasticReturn(
  origin: Point,
  length: number,
  position: Point,
  velocity: Point,
) {
  const anchor = { x: origin.x, y: origin.y - length };
  const gravity = 1000,
    stiffness = 120,
    step = 1 / 120;
  // The gravity-loaded equilibrium remains at the existing 80% rope length.
  const restLength = length - gravity / stiffness;
  let p = { ...position },
    v = { ...velocity };
  let accumulator = 0,
    elapsed = 0,
    quiet = 0,
    settled = false;
  return {
    advance(deltaMs: number) {
      accumulator += Math.max(0, Math.min(100, deltaMs)) / 1000;
      while (!settled && accumulator + 1e-9 >= step) {
        accumulator = Math.max(0, accumulator - step);
        const dx = p.x - anchor.x,
          dy = p.y - anchor.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const nx = dx / distance,
          ny = dy / distance;
        const radialSpeed = v.x * nx + v.y * ny;
        // A rope pulls when stretched; it does not push when slack.
        const tension =
          distance > restLength
            ? Math.max(
                0,
                stiffness * (distance - restLength) + 12 * radialSpeed,
              )
            : 0;
        v.x += (-tension * nx - 3.5 * v.x) * step;
        v.y += (gravity - tension * ny - 3.5 * v.y) * step;
        p.x += v.x * step;
        p.y += v.y * step;
        if (p.y < anchor.y + 20) {
          p.y = anchor.y + 20;
          v.y = Math.abs(v.y) * 0.2;
        }
        elapsed += step;
        quiet =
          Math.hypot(p.x - origin.x, p.y - origin.y) < 0.3 &&
          Math.hypot(v.x, v.y) < 1
            ? quiet + step
            : 0;
        if (quiet > 0.2 || elapsed >= 8) {
          p = { ...origin };
          v = { x: 0, y: 0 };
          settled = true;
        }
      }
      return { anchor, position: { ...p }, velocity: { ...v }, settled };
    },
  };
}
