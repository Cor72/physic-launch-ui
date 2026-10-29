"use client";

import { Menu } from "lucide-react";
import { ReactNode, useEffect, useMemo, useState } from "react";

import { siteConfig } from "@/config/site";
import { subscribeAuthSessionChanges } from "@/lib/auth-session-sync";
import { createBrowserPlatformClient } from "@/lib/user-session";
import { cn } from "@/lib/utils";

import LaunchUI from "../../logos/launch-ui";
import { Button, type ButtonVariantProp } from "../../ui/button";
import Navigation, { HOME_SECTIONS } from "../../ui/navigation";
import { Container } from "../../ui/section";
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
  variant?: ButtonVariantProp;
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
          if (
            !active ||
            current !== revision ||
            requestController.signal.aborted
          )
            return;
          if (!response.ok || !data) throw new Error("SESSION_UNAVAILABLE");
          setAccountLabel(
            data.account ? data.account.displayName?.trim() || "我的账户" : "",
          );
        })
        .catch(() => {
          if (
            active &&
            current === revision &&
            !requestController.signal.aborted
          ) {
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

  const resolvedActions: NavbarActionProps[] =
    actions ??
    (accountLabel
      ? [
          { text: accountLabel, href: siteConfig.canvasUrl, isButton: false },
          {
            text: "进入画布",
            href: siteConfig.canvasUrl,
            isButton: true,
            variant: "ink",
          },
        ]
      : [
          { text: "登录", href: siteConfig.loginUrl, isButton: false },
          {
            text: "注册",
            href: siteConfig.registerUrl,
            isButton: true,
            variant: "ghost",
          },
          {
            text: "游客体验",
            href: siteConfig.canvasUrl,
            isButton: true,
            variant: "ink",
          },
        ]);

  const resolvedMobileLinks: NavbarLink[] = mobileLinks ?? [
    ...(accountLabel
      ? [{ text: "进入画布", href: siteConfig.canvasUrl }]
      : [
          { text: "登录", href: siteConfig.loginUrl },
          { text: "注册", href: siteConfig.registerUrl },
          { text: "游客体验", href: siteConfig.canvasUrl },
        ]),
    ...HOME_SECTIONS.map((link) => ({ text: link.title, href: link.href })),
  ];

  return (
    /* The navigation keeps the same white surface throughout the page. */
    <header
      className={cn(
        "pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4",
        className,
      )}
    >
      <Container className="max-w-[1160px]">
        <nav className="glass text-ink pointer-events-auto flex h-14 items-center gap-2 rounded-full pr-2 pl-4 backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color,box-shadow,color] duration-300 sm:gap-6 sm:pl-5">
          <div className="flex min-w-0 shrink lg:flex-1 lg:basis-0">
            <a
              href={homeUrl}
              className="text-ink flex min-w-0 items-center gap-2.5 text-[0.9375rem] font-semibold tracking-[-0.014em]"
            >
              {logo}
              <span className="truncate">{name}</span>
            </a>
          </div>

          {showNavigation && (
            <div className="hidden shrink-0 justify-center lg:flex">
              {customNavigation || <Navigation />}
            </div>
          )}

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1 sm:gap-2 lg:ml-0 lg:flex-1 lg:basis-0">
            {resolvedActions.map((action) =>
              action.isButton ? (
                <Button
                  key={`${action.href}-${action.text}`}
                  variant={action.variant || "default"}
                  size="sm"
                  className={
                    action.href === siteConfig.registerUrl
                      ? "hidden sm:inline-flex"
                      : undefined
                  }
                  asChild
                >
                  <a href={action.href} aria-label={action.text}>
                    {action.icon}
                    {action.text === "游客体验" ? (
                      <>
                        <span className="xs:hidden">体验</span>
                        <span className="xs:inline hidden">{action.text}</span>
                      </>
                    ) : (
                      action.text
                    )}
                    {action.iconRight}
                  </a>
                </Button>
              ) : (
                <a
                  key={`${action.href}-${action.text}`}
                  href={action.href}
                  className="text-ink-muted hover:text-ink hidden px-2 text-[0.8125rem] transition-colors md:block"
                >
                  {action.text}
                </a>
              ),
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="size-10 lg:hidden"
                >
                  <Menu className="size-4.5" />
                  <span className="sr-only">打开导航菜单</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetTitle className="sr-only">导航菜单</SheetTitle>
                <nav className="mt-2 grid gap-1">
                  <a
                    href={homeUrl}
                    className="text-ink mb-4 flex items-center gap-2.5 text-base font-semibold"
                  >
                    {logo}
                    <span>{name}</span>
                  </a>
                  {resolvedMobileLinks.map((link) => (
                    <SheetClose key={`${link.href}-${link.text}`} asChild>
                      <a
                        href={link.href}
                        className="text-ink-muted hover:bg-surface-3 hover:text-ink -mx-2 rounded-lg px-2 py-2.5 text-[0.9375rem] transition-colors"
                      >
                        {link.text}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </Container>
    </header>
  );
}
