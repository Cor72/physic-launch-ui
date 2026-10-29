"use client";

import { ChevronsUpDownIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className="text-ink-faint hover:text-ink size-10 shrink-0"
      title="切换明暗主题"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      {/* Keyed off the page theme on <html>, not the nearest `.dark`: the
          navbar turns dark over night-sky bands, and the icon must still
          describe the page. */}
      <MoonIcon aria-hidden="true" className="[html.dark_&]:hidden" />
      <SunIcon aria-hidden="true" className="hidden [html.dark_&]:block" />
      <span className="sr-only [html.dark_&]:hidden">切换到深色模式</span>
      <span className="sr-only hidden [html.dark_&]:inline">
        切换到浅色模式
      </span>
    </Button>
  );
}

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const themeLabels: Record<string, string> = {
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
  };
  const selectedTheme = themeLabels[theme ?? "light"] ?? "浅色";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="gap-1 px-2 py-0 text-xs">
          <span className="capitalize" suppressHydrationWarning>
            {selectedTheme}
          </span>
          <span className="inline">主题</span>
          <ChevronsUpDownIcon className="size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          浅色模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          深色模式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          跟随系统
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
