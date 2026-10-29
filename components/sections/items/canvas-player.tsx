"use client";

import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { usePreviewPlayback } from "@/lib/use-preview-playback";
import demoPoster from "@/public/hero-demo-poster.jpg";

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

export function CanvasPlayer({ pin }: { pin?: ReactNode }) {
  const { videoRef, playing, failed, play, pause, retry } =
    usePreviewPlayback();
  const [time, setTime] = useState({ current: 0, duration: 0 });
  const [rate, setRate] = useState("1");
  const [loading, setLoading] = useState(false);
  const syncTime = () => {
    const video = videoRef.current;
    if (video)
      setTime({
        current: video.currentTime,
        duration: Number.isFinite(video.duration) ? video.duration : 0,
      });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex flex-1 items-center justify-center p-4 sm:p-6">
        <video
          ref={videoRef}
          src="/3.mp4"
          poster={demoPoster.src}
          width={1446}
          height={896}
          muted
          loop
          playsInline
          preload="none"
          aria-label="滑块沿轨道运动的动态画布演示"
          className="border-line h-auto w-full rounded-xl border bg-white shadow-lg"
          onTimeUpdate={syncTime}
          onLoadedMetadata={syncTime}
          onWaiting={() => setLoading(true)}
          onPlaying={() => setLoading(false)}
          onCanPlay={() => setLoading(false)}
        />
        {loading && !failed && (
          <span
            role="status"
            className="border-line bg-surface-2/95 text-ink-muted absolute rounded-full border px-4 py-2 text-xs shadow-sm"
          >
            正在加载演示…
          </span>
        )}
        {failed && (
          <div
            role="alert"
            className="bg-surface-1/95 absolute inset-4 flex flex-col items-center justify-center gap-3 rounded-xl p-4 text-center sm:inset-6"
          >
            <p className="text-ink text-sm">演示视频暂时无法播放</p>
            <button
              type="button"
              onClick={retry}
              className="border-line text-brand min-h-11 rounded-full border px-5 text-sm"
            >
              重新加载
            </button>
          </div>
        )}
      </div>

      <div className="border-line-subtle bg-surface-2/60 flex flex-wrap items-center gap-2 border-t px-3 py-2 sm:gap-3 sm:px-4">
        {pin}
        <button
          type="button"
          onClick={playing ? pause : play}
          disabled={failed}
          aria-label={playing ? "暂停画布演示" : "播放画布演示"}
          className="bg-ink text-surface-1 grid size-11 shrink-0 place-items-center rounded-full transition-opacity hover:opacity-85 disabled:opacity-40"
        >
          {playing ? (
            <PauseIcon className="size-4" />
          ) : (
            <PlayIcon className="size-4 translate-x-px" />
          )}
        </button>
        <span className="numeral text-ink-muted w-9 shrink-0 font-mono text-[0.6875rem] sm:text-xs">
          {clock(time.current)}
        </span>
        <input
          type="range"
          min={0}
          max={time.duration || 1}
          step={0.1}
          value={time.current}
          disabled={!time.duration || failed}
          aria-label="画布演示进度"
          aria-valuetext={`${clock(time.current)} / ${clock(time.duration)}`}
          onChange={(event) => {
            if (videoRef.current)
              videoRef.current.currentTime = Number(event.target.value);
            syncTime();
          }}
          className="accent-brand h-11 min-w-12 flex-1 cursor-pointer disabled:cursor-default disabled:opacity-40"
        />
        <span className="numeral text-ink-faint w-9 shrink-0 text-right font-mono text-[0.6875rem] sm:text-xs">
          {time.duration ? clock(time.duration) : "--:--"}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            disabled={!time.duration || failed}
            aria-label="从头播放画布演示"
            onClick={() => {
              if (videoRef.current) videoRef.current.currentTime = 0;
              syncTime();
              play();
            }}
            className="text-ink-muted hover:text-brand grid size-11 place-items-center rounded-full disabled:opacity-40"
          >
            <RotateCcwIcon className="size-3.5" />
          </button>
          <select
            aria-label="画布演示播放速度"
            value={rate}
            onChange={(event) => {
              setRate(event.target.value);
              if (videoRef.current)
                videoRef.current.playbackRate = Number(event.target.value);
            }}
            className="border-line bg-surface-2 text-ink-muted h-11 rounded-full border px-2 font-mono text-xs"
          >
            {["0.5", "1", "1.5", "2"].map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
