import { cn } from "@/lib/utils";

/* Seeded so the server and every client render the same sky. */
function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (value: number) => Math.round(value * 10) / 10;

/* The four-point sparkle from the logo. */
const SPARKLE =
  "M0 -1 C0.1 -0.22 0.22 -0.1 1 0 C0.22 0.1 0.1 0.22 0 1 C-0.1 0.22 -0.22 0.1 -1 0 C-0.22 -0.1 -0.1 -0.22 0 -1 Z";

interface StarfieldProps {
  seed?: number;
  count?: number;
  sparkles?: number;
  className?: string;
}

export function Starfield({
  seed = 11,
  count = 110,
  sparkles = 4,
  className,
}: StarfieldProps) {
  const random = mulberry32(seed);
  const stars = Array.from({ length: count }, (_, index) => {
    const size = random();
    return {
      x: round(random() * 1200),
      y: round(random() * 720),
      r: size > 0.95 ? 1.4 : size > 0.75 ? 0.95 : 0.6,
      opacity: round(0.2 + random() * 0.6),
      twinkle: index % 6 === 0,
      delay: round(random() * 6),
      duration: round(3 + random() * 4),
    };
  });
  const glints = Array.from({ length: sparkles }, () => ({
    x: round(80 + random() * 1040),
    y: round(40 + random() * 520),
    size: round(4 + random() * 4),
    gold: random() > 0.5,
    delay: round(random() * 5),
  }));

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 720"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
    >
      <g fill="var(--star)">
        {stars.map((star, index) => (
          <circle
            key={index}
            cx={star.x}
            cy={star.y}
            r={star.r}
            opacity={star.opacity}
            className={star.twinkle ? "animate-twinkle" : undefined}
            style={
              star.twinkle
                ? {
                    animationDelay: `${star.delay}s`,
                    animationDuration: `${star.duration}s`,
                  }
                : undefined
            }
          />
        ))}
      </g>
      {glints.map((glint, index) => (
        <path
          key={index}
          d={SPARKLE}
          transform={`translate(${glint.x} ${glint.y}) scale(${glint.size})`}
          className={cn(
            "animate-twinkle",
            glint.gold ? "fill-gold" : "fill-brand",
          )}
          style={{ animationDelay: `${glint.delay}s`, animationDuration: "5s" }}
        />
      ))}
    </svg>
  );
}
