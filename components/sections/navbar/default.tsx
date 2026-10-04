"use client";

import { type VariantProps } from "class-variance-authority";
import { Menu } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/config/site";
import { subscribeAuthSessionChanges } from "@/lib/auth-session-sync";
import { createBrowserPlatformClient } from "@/lib/user-session";
import { cn } from "@/lib/utils";

import LaunchUI from "../../logos/launch-ui";
import { Button, buttonVariants } from "../../ui/button";
import { ThemeToggle } from "../../ui/mode-toggle";
import {
  Navbar as NavbarComponent,
  NavbarLeft,
  NavbarRight,
} from "../../ui/navbar";
import Navigation from "../../ui/navigation";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../../ui/sheet";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavbarProps {
  logo?: ReactNode;
  name?: string;
  homeUrl?: string;
  mobileLinks?: NavbarLink[];
  actions?: NavbarActionProps[];
  showNavigation?: boolean;
  customNavigation?: ReactNode;
  className?: string;
}

export default function Navbar({
  logo = <LaunchUI />,
  name = siteConfig.name,
  homeUrl = siteConfig.homeUrl,
  mobileLinks,
  actions,
  showNavigation = true,
  customNavigation,
  className,
}: NavbarProps) {
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const [accountLabel, setAccountLabel] = useState("");

  useEffect(() => {
    let active = true;
    let revision = 0;
    let controller: AbortController | null = null;
    let scheduled = false;

    const refresh = () => {
      if (!active) return;
      const current = ++revision;
      controller?.abort();
      controller = new AbortController();
      const requestController = controller;
      const timeout = window.setTimeout(() => requestController.abort(), 4_000);

      void client
        .GET("/api/v3/auth/bootstrap", {
          signal: requestController.signal,
          cache: "no-store",
        })
        .then(({ data, response }) => {
          if (!active || current !== revision || requestController.signal.aborted) return;
          if (!response.ok || !data) throw new Error("SESSION_UNAVAILABLE");
          setAccountLabel(
            data.account
              ? data.account.displayName?.trim() || "我的账户"
              : "",
          );
        })
        .catch(() => {
          if (active && current === revision && !requestController.signal.aborted) {
            setAccountLabel("");
          }
        })
        .finally(() => window.clearTimeout(timeout));
    };
    const scheduleRefresh = () => {
      if (!active || scheduled) return;
      scheduled = true;
      window.queueMicrotask(() => {
        scheduled = false;
        refresh();
      });
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") scheduleRefresh();
    };

    refresh();
    const unsubscribe = subscribeAuthSessionChanges(scheduleRefresh);
    window.addEventListener("focus", scheduleRefresh);
    window.addEventListener("pageshow", scheduleRefresh);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      revision += 1;
      controller?.abort();
      unsubscribe();
      window.removeEventListener("focus", scheduleRefresh);
      window.removeEventListener("pageshow", scheduleRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [client]);

  const resolvedActions: NavbarActionProps[] = actions ?? (accountLabel
    ? [
        { text: accountLabel, href: siteConfig.canvasUrl, isButton: false },
        { text: "进入画布", href: siteConfig.canvasUrl, isButton: true, variant: "default" },
      ]
    : [
        { text: "登录", href: siteConfig.loginUrl, isButton: false },
        { text: "注册", href: siteConfig.registerUrl, isButton: true, variant: "white" },
        { text: "游客体验", href: siteConfig.canvasUrl, isButton: true, variant: "default" },
      ]);
  const resolvedMobileLinks: NavbarLink[] = mobileLinks ?? [
    ...(accountLabel
      ? [{ text: "进入画布", href: siteConfig.canvasUrl }]
      : [
          { text: "登录", href: siteConfig.loginUrl },
          { text: "注册", href: siteConfig.registerUrl },
          { text: "游客体验", href: siteConfig.canvasUrl },
        ]),
    { text: "动态演示", href: siteConfig.getStartedUrl },
    { text: "核心功能", href: siteConfig.links.features },
    { text: "题型模型", href: siteConfig.links.models },
    { text: "会员方案", href: siteConfig.links.pricing },
    { text: "教师使用", href: siteConfig.links.teachers },
    { text: "常见问题", href: siteConfig.links.faq },
  ];

  return (
    <header className={cn("sticky top-0 z-50 -mb-4 px-4 pb-4", className)}>
      <div className="fade-bottom bg-background/15 absolute left-0 h-24 w-full backdrop-blur-lg"></div>
      <div className="max-w-container relative mx-auto">
        <NavbarComponent className="flex-wrap gap-2">
          <NavbarLeft className="gap-2 md:gap-4">
            <a
              href={homeUrl}
              className="flex items-center gap-2 text-xl font-bold"
            >
              {logo}
              {name}
            </a>
            <ThemeToggle />
            {showNavigation && (
              <div className="hidden lg:block">
                {customNavigation || <Navigation />}
              </div>
            )}
          </NavbarLeft>
          <NavbarRight className="ml-auto gap-2 md:gap-4">
            {resolvedActions.map((action) =>
              action.isButton ? (
                <Button
                  key={`${action.href}-${action.text}`}
                  variant={action.variant || "default"}
                  asChild
                >
                  <a href={action.href}>
                    {action.icon}
                    {action.text}
                    {action.iconRight}
                  </a>
                </Button>
              ) : (
                <a
                  key={`${action.href}-${action.text}`}
                  href={action.href}
                  className="hidden text-sm md:block"
                >
                  {action.text}
                </a>
              ),
            )}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 lg:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">打开导航菜单</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">导航菜单</SheetTitle>
                <nav className="grid gap-6 text-lg font-medium">
                  <a
                    href={homeUrl}
                    className="flex items-center gap-2 text-xl font-bold"
                  >
                    <span>{name}</span>
                  </a>
                  {resolvedMobileLinks.map((link) => (
                    <SheetClose key={`${link.href}-${link.text}`} asChild>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {link.text}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </NavbarRight>
        </NavbarComponent>
      </div>
    </header>
  );
}
