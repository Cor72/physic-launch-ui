"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export interface NavigationLink {
  title: string;
  href: `#${string}`;
}

/* In page order, so the highlighted link moves in one direction while the
   visitor scrolls. */
export const HOME_SECTIONS: readonly NavigationLink[] = [
  { title: "物理场景", href: siteConfig.links.models as `#${string}` },
  { title: "使用流程", href: siteConfig.links.workflow as `#${string}` },
  { title: "产品功能", href: siteConfig.links.features as `#${string}` },
  { title: "积分套餐", href: siteConfig.links.pricing as `#${string}` },
  { title: "常见问题", href: siteConfig.links.faq as `#${string}` },
];

interface NavigationProps {
  links?: readonly NavigationLink[];
  className?: string;
}

/* Tracks which section sits under the navbar: the last one whose top has
   crossed a line a third of the way down the viewport. */
function useActiveSection(links: readonly NavigationLink[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const targets = links
      .map((link) => document.getElementById(link.href.slice(1)))
      .filter((node): node is HTMLElement => node !== null);
    if (targets.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current: string | null = null;
      for (const target of targets) {
        const rect = target.getBoundingClientRect();
        if (rect.top <= line && rect.bottom > 0) current = `#${target.id}`;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [links]);

  return active;
}

export default function Navigation({
  links = HOME_SECTIONS,
  className,
}: NavigationProps) {
  const active = useActiveSection(links);
  const listRef = useRef<HTMLUListElement>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const link = active
        ? list.querySelector<HTMLElement>(`a[href="${active}"]`)
        : null;
      setPill(link ? { left: link.offsetLeft, width: link.offsetWidth } : null);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [active]);

  return (
    <nav aria-label="页面导航" className={className}>
      <ul ref={listRef} className="relative flex items-center gap-0.5">
        <span
          aria-hidden="true"
          className={cn(
            "bg-surface-3 border-line-subtle absolute inset-y-0 rounded-full border transition-[left,width,opacity] duration-300 ease-out motion-reduce:transition-none",
            pill ? "opacity-100" : "opacity-0",
          )}
          style={pill ? { left: pill.left, width: pill.width } : undefined}
        />
        {links.map((link) => {
          const current = active === link.href;
          return (
            <li key={link.href} className="relative">
              <a
                href={link.href}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "relative block rounded-full px-3.5 py-1.5 text-[0.8125rem] font-medium transition-colors xl:px-4",
                  "focus-visible:ring-ring/40 outline-none focus-visible:ring-2",
                  current ? "text-ink" : "text-ink-muted hover:text-ink",
                )}
              >
                {link.title}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
