import type { Point } from "./hero-ball-physics";

export const SWING_DURATION_MS = 3200;

export function samplePendulum(
  origin: Point,
  length: number,
  elapsedMs: number,
) {
  const anchor = { x: origin.x, y: origin.y - length };
  if (elapsedMs >= SWING_DURATION_MS) {
    return {
      anchor,
      position: { ...origin },
      velocity: { x: 0, y: 0 },
      settled: true,
    };
  }
  const seconds = Math.max(0, elapsedMs) / 1000;
  const duration = SWING_DURATION_MS / 1000;
  const progress = seconds / duration;
  // Smooth damping keeps the rope taut and ends at rest without a final snap.
  const envelope = (1 - progress) ** 2 * (1 + 2 * progress);
  const envelopeVelocity = (-6 * progress * (1 - progress)) / duration;
  const frequency = (2 * Math.PI) / 1.6;
  const angle = 0.55 * envelope * Math.cos(frequency * seconds);
  const angularVelocity =
    0.55 *
    (envelopeVelocity * Math.cos(frequency * seconds) -
      envelope * frequency * Math.sin(frequency * seconds));
  return {
    anchor,
    position: {
      x: anchor.x + length * Math.sin(angle),
      y: anchor.y + length * Math.cos(angle),
    },
    velocity: {
      x: length * Math.cos(angle) * angularVelocity,
      y: -length * Math.sin(angle) * angularVelocity,
    },
    settled: false,
  };
}
