"use client";

import { PauseIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { type ReactNode, useState } from "react";

import { InViewMotion } from "../ui/in-view-motion";

export function ScenePlayer({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  const [paused, setPaused] = useState(false);
  const [revision, setRevision] = useState(0);

  return (
    <>
      <InViewMotion
        key={revision}
        paused={paused}
        className="relative size-full"
      >
        {children}
      </InViewMotion>
      <div className="absolute top-3 right-3 flex items-center gap-1 motion-reduce:hidden">
        <button
          type="button"
          aria-label={`${paused ? "播放" : "暂停"}${name}示意`}
          onClick={() => setPaused((value) => !value)}
          className="border-line bg-surface-2/90 text-ink-muted hover:text-brand grid size-11 place-items-center rounded-full border backdrop-blur-sm transition-colors"
        >
          {paused ? (
            <PlayIcon className="size-3.5" />
          ) : (
            <PauseIcon className="size-3.5" />
          )}
        </button>
        <button
          type="button"
          aria-label={`重播${name}示意`}
          onClick={() => {
            setRevision((value) => value + 1);
            setPaused(false);
          }}
          className="text-ink-muted hover:bg-surface-2 hover:text-brand grid size-11 place-items-center rounded-full transition-colors"
        >
          <RotateCcwIcon className="size-3.5" />
        </button>
      </div>
      <span className="text-ink-faint absolute top-4 right-4 hidden font-mono text-[0.6875rem] motion-reduce:block">
        静态示意
      </span>
    </>
  );
}
