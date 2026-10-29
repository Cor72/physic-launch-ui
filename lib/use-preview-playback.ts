"use client";

import { useEffect, useRef, useState } from "react";

/* Shared by the two previews. User intent survives scrolling; automatic
   playback only runs while the preview and browser tab are visible. */
export function usePreviewPlayback() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const userPaused = useRef(false);
  const manualPlayback = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let active = true;

    const shouldPlay = () =>
      active &&
      visible &&
      !document.hidden &&
      !userPaused.current &&
      (!reduced.matches || manualPlayback.current);
    const sync = () => {
      if (shouldPlay()) {
        void video
          .play()
          .then(() => {
            if (!shouldPlay()) video.pause();
          })
          .catch(() => {});
      } else video.pause();
    };
    const onPlay = () => {
      userPaused.current = false;
      setPlaying(true);
    };
    const onPause = () => {
      if (
        active &&
        visible &&
        !document.hidden &&
        (!reduced.matches || manualPlayback.current)
      ) {
        userPaused.current = true;
      }
      setPlaying(false);
    };
    const onError = () => setFailed(true);
    const onLoaded = () => setFailed(false);
    const onMotionChange = () => {
      manualPlayback.current = false;
      sync();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.25 },
    );

    observer.observe(video);
    document.addEventListener("visibilitychange", sync);
    reduced.addEventListener("change", onMotionChange);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("error", onError);
    video.addEventListener("loadeddata", onLoaded);
    return () => {
      active = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      reduced.removeEventListener("change", onMotionChange);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("error", onError);
      video.removeEventListener("loadeddata", onLoaded);
      video.pause();
    };
  }, []);

  const play = () => {
    userPaused.current = false;
    manualPlayback.current = true;
    void videoRef.current?.play().catch(() => {});
  };
  const pause = () => {
    userPaused.current = true;
    videoRef.current?.pause();
  };
  const retry = () => {
    setFailed(false);
    videoRef.current?.load();
    play();
  };
  return { videoRef, playing, failed, play, pause, retry };
}
