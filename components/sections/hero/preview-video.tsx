"use client";

import { useEffect, useRef } from "react";

import demoPoster from "@/public/hero-demo-poster.jpg";

export default function PreviewVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePlayback = () => {
      video.autoplay = !reducedMotion.matches;
      if (reducedMotion.matches) {
        video.pause();
      } else {
        void video.play().catch(() => {
          // Native controls remain available if the browser blocks autoplay.
        });
      }
    };

    updatePlayback();
    reducedMotion.addEventListener("change", updatePlayback);
    return () => {
      reducedMotion.removeEventListener("change", updatePlayback);
      video.pause();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src="/3.mp4"
      poster={demoPoster.src}
      width={1446}
      height={896}
      className="block h-auto w-full"
      aria-label="滑块沿圆轨道运动的动态演示"
      muted
      loop
      playsInline
      controls
      preload="metadata"
    >
      <a href="/3.mp4">查看物理过程演示视频</a>
    </video>
  );
}
