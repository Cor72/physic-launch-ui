"use client";

import { useEffect, useRef, useState } from "react";

import styles from "./hero.module.css";
import { samplePendulum, SWING_DURATION_MS } from "./hero-ball-pendulum";
import type { FrameQuad, Point } from "./hero-ball-physics";

type Physics = typeof import("./hero-ball-physics");
type Simulation = ReturnType<Physics["createHeroBallSimulation"]>;
const move = (element: HTMLElement, point: Point) => {
  element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
};

export default function HeroBall() {
  const layerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const ballRef = useRef<HTMLSpanElement>(null);
  const ropeRef = useRef<SVGLineElement>(null);
  const playRef = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const layer = layerRef.current;
    const trigger = triggerRef.current;
    const ball = ballRef.current;
    const rope = ropeRef.current;
    const host = layer?.closest<HTMLElement>("[data-hero-physics-root]");
    if (!layer || !trigger || !ball || !rope || !host) return;
    const frameElements = [
      ...host.querySelectorAll<HTMLElement>("[data-hero-preview]"),
    ];
    if (frameElements.length !== 3) return;
    const corners = frameElements.map((frame) =>
      ["tl", "tr", "br", "bl"].map((corner) =>
        frame.querySelector<HTMLElement>(`[data-hero-corner="${corner}"]`),
      ),
    );
    const media = window.matchMedia(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
    );
    let alive = true,
      inView = true,
      available = false,
      generation = 0;
    let physics: Physics | null = null;
    let simulation: Simulation | null = null;
    let frameId = 0,
      idleFrameId = 0,
      idleUntil = 0;
    let swingStarted: number | null = null;
    let didSwing = false;
    let idleState: ReturnType<typeof samplePendulum> | null = null;
    let hangingOrigin: Point | null = null;
    let hangingLength = 100;
    const eligible = () => media.matches && inView && !document.hidden;

    function measure() {
      const bounds = host!.getBoundingClientRect();
      const frames = corners.map(
        (frame) =>
          frame.map((marker) => {
            if (!marker) throw new Error("Missing preview corner");
            const rect = marker.getBoundingClientRect();
            return { x: rect.x - bounds.x, y: rect.y - bounds.y };
          }) as FrameQuad,
      );
      if (
        bounds.width < 1 ||
        frames.some((frame) => frame.some((p) => !Number.isFinite(p.x + p.y)))
      )
        throw new Error("Preview not measurable");
      return { frames, width: bounds.width, height: bounds.height, spawnY: 32 };
    }

    function placeTrigger(now = performance.now()) {
      if (!available || !hangingOrigin) return;
      idleState = samplePendulum(
        hangingOrigin,
        hangingLength,
        swingStarted === null ? SWING_DURATION_MS : now - swingStarted,
      );
      move(trigger!, idleState.position);
      rope!.setAttribute("x1", String(idleState.anchor.x));
      rope!.setAttribute("y1", String(idleState.anchor.y));
      rope!.setAttribute("x2", String(idleState.position.x));
      rope!.setAttribute("y2", String(idleState.position.y));
    }

    function trackIdle(until: number) {
      idleUntil = Math.max(idleUntil, until);
      if (idleFrameId) return;
      const tick = (now: number) => {
        idleFrameId = 0;
        if (!alive || !eligible() || !available || simulation) return;
        try {
          placeTrigger(now);
        } catch {
          return;
        }
        if (now < idleUntil) idleFrameId = requestAnimationFrame(tick);
      };
      idleFrameId = requestAnimationFrame(tick);
    }

    function stop() {
      cancelAnimationFrame(frameId);
      frameId = 0;
      cancelAnimationFrame(idleFrameId);
      idleFrameId = 0;
      idleUntil = 0;
      swingStarted = null;
      simulation?.dispose();
      simulation = null;
      layer!.dataset.phase = "idle";
      if (alive) setRunning(false);
    }

    async function initialize() {
      const current = ++generation;
      available = false;
      setReady(false);
      if (!eligible()) return;
      try {
        // Wait for the existing card entrances, never delay or alter the glow.
        await document.fonts.ready;
        await Promise.all(
          frameElements
            .flatMap((frame) => frame.getAnimations())
            .map((animation) => animation.finished.catch(() => {})),
        );
        if (!alive || current !== generation || !eligible()) return;
        physics ??= await import("./hero-ball-physics");
        if (!alive || current !== generation || !eligible()) return;
        const scene = measure();
        if (
          new Set(
            physics
              .visibleTopEdges(scene.frames, scene.width)
              .map((edge) => edge.frame),
          ).size !== 3
        )
          return;
        // Keep the ceiling attachment fixed when the preview cards fan out.
        hangingOrigin = physics.ballOrigin(
          scene.frames,
          scene.width,
          scene.spawnY,
        );
        hangingLength = Math.max(
          90,
          Math.min(
            120,
            scene.spawnY + host!.getBoundingClientRect().top + window.scrollY,
          ),
        );
        available = true;
        if (!didSwing) {
          didSwing = true;
          swingStarted = performance.now();
        }
        placeTrigger();
        setReady(true);
        if (swingStarted !== null) trackIdle(swingStarted + SWING_DURATION_MS);
      } catch {
        // A decorative enhancement must never break the landing page.
        available = false;
      }
    }

    playRef.current = () => {
      if (!physics || !available || simulation || !eligible()) return;
      try {
        const scene = measure();
        placeTrigger();
        if (!idleState) return;
        simulation = physics.createHeroBallSimulation({
          ...scene,
          initialState: {
            position: idleState.position,
            velocity: idleState.velocity,
          },
        });
        move(ball, idleState.position);
        cancelAnimationFrame(idleFrameId);
        idleFrameId = 0;
        idleUntil = 0;
        swingStarted = null;
        layer.dataset.phase = "drop";
        setRunning(true);
        let previous = performance.now();
        const tick = (now: number) => {
          if (!alive || !simulation) return;
          if (!eligible()) {
            stop();
            return;
          }
          try {
            const snapshot = simulation.advance(
              now - previous,
              measure().frames,
            );
            previous = now;
            if (snapshot.phase === "done") {
              stop();
              placeTrigger();
              return;
            }
            move(ball, snapshot.position);
            layer.dataset.phase = snapshot.phase;
            frameId = requestAnimationFrame(tick);
          } catch {
            stop();
          }
        };
        frameId = requestAnimationFrame(tick);
      } catch {
        stop();
      }
    };

    const reset = () => {
      stop();
      void initialize();
    };
    const resize = new ResizeObserver(reset);
    resize.observe(host);
    frameElements.forEach((frame) => resize.observe(frame));
    const intersection = new IntersectionObserver(([entry]) => {
      if (inView !== entry.isIntersecting) {
        inView = entry.isIntersecting;
        reset();
      }
    });
    intersection.observe(host);
    media.addEventListener("change", reset);
    window.addEventListener("resize", reset);
    document.addEventListener("visibilitychange", reset);
    void initialize();

    return () => {
      alive = false;
      ++generation;
      stop();
      cancelAnimationFrame(idleFrameId);
      resize.disconnect();
      intersection.disconnect();
      media.removeEventListener("change", reset);
      window.removeEventListener("resize", reset);
      document.removeEventListener("visibilitychange", reset);
      playRef.current = () => {};
    };
  }, []);

  return (
    <div
      ref={layerRef}
      className={styles.ballLayer}
      data-phase="idle"
      data-ready={ready}
    >
      <svg className={styles.ballRope} aria-hidden="true" focusable="false">
        <line ref={ropeRef} vectorEffect="non-scaling-stroke" />
      </svg>
      <button
        ref={triggerRef}
        type="button"
        className={styles.ballTrigger}
        disabled={!ready}
        aria-disabled={running || !ready}
        aria-label="点击小球，松开绳子"
        onClick={() => playRef.current()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!event.repeat) playRef.current();
          }
        }}
      >
        <span className={styles.ballSurface} aria-hidden="true" />
        <span className={styles.ballHint} aria-hidden="true">
          点击小球，松开绳子
        </span>
      </button>
      <div className={styles.ballMotionViewport} aria-hidden="true">
        <span ref={ballRef} className={styles.ballMotion} data-ball-motion="">
          <span className={styles.ballSurface} />
        </span>
      </div>
    </div>
  );
}
