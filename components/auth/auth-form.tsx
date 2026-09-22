"use client";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import LaunchUI from "@/components/logos/launch-ui";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/mode-toggle";
import {
  apiErrorMessage,
  createBrowserPlatformClient,
} from "@/lib/user-session";

interface AuthFormProps {
  mode: "login" | "register";
  returnTo: "/canvas";
  intent?: "ai";
}

export function AuthForm({ mode, returnTo, intent }: AuthFormProps) {
  const router = useRouter();
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void client
      .GET("/api/user/v1/auth/me", { signal: controller.signal })
      .then(({ data }) => {
        if (controller.signal.aborted) return;
        if (data) router.replace(returnTo);
        else setChecking(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, [client, returnTo, router]);

  const alternatePath = mode === "login" ? "/register" : "/login";
  const alternateQuery = new URLSearchParams({ returnTo });
  if (intent) alternateQuery.set("intent", intent);
  const alternateHref = `${alternatePath}?${alternateQuery.toString()}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || checking) return;
    if (mode === "register" && password !== confirmPassword) {
      setMessage("两次输入的密码不一致");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const result =
        mode === "login"
          ? await client.POST("/api/user/v1/auth/login", {
              body: { username, password },
            })
          : await client.POST("/api/user/v1/auth/register", {
              body: { username, displayName, password },
            });
      if (!result.response.ok || !result.data) {
        throw new Error(
          apiErrorMessage(
            result.error,
            mode === "login"
              ? "登录失败，请核对用户名和密码"
              : "注册失败，请检查填写内容",
          ),
        );
      }
      setPassword("");
      setConfirmPassword("");
      router.replace(returnTo);
    } catch (error) {
      setPassword("");
      setConfirmPassword("");
      setMessage(error instanceof Error ? error.message : "服务暂时不可用");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "login" ? "继续你的物理探索" : "创建学习账户";
  const description =
    intent === "ai"
      ? "登录后即可回到刚才的画布，并继续使用 AI 搭建。"
      : mode === "login"
        ? "登录后进入物理画布，继续保存和分析你的题目。"
        : "注册后进入画布。新账户初始积分为 0，手动搭建可直接使用。";

  return (
    <main className="bg-background text-foreground relative isolate min-h-[100dvh] overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--brand)_15%,transparent),transparent_32%),radial-gradient(circle_at_80%_85%,color-mix(in_oklab,var(--brand)_9%,transparent),transparent_28%)]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <LaunchUI />
          悟言视界
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center gap-12 py-12 md:grid-cols-[1fr_440px]">
        <div className="hidden max-w-xl md:block">
          <p className="text-brand mb-5 text-sm font-semibold">AI 动态题目可视化学习平台</p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight lg:text-6xl">
            把抽象题目，变成看得见的物理过程
          </h1>
          <p className="text-muted-foreground mt-6 max-w-[52ch] text-lg leading-relaxed">
            从受力、运动到轨迹，在同一张画布中搭建、观察并验证物理情境。
          </p>
        </div>

        <div className="border-border bg-card/95 shadow-xl shadow-orange-950/5 rounded-2xl border p-6 backdrop-blur-sm sm:p-8">
          <div className="mb-7">
            <div className="bg-primary/10 text-primary mb-5 grid size-11 place-items-center rounded-xl">
              {mode === "login" ? <LockKeyhole /> : <UserRound />}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          {checking ? (
            <div className="space-y-4" aria-label="正在确认登录状态">
              <div className="bg-muted h-11 animate-pulse rounded-md" />
              <div className="bg-muted h-11 animate-pulse rounded-md" />
              <div className="bg-muted h-10 animate-pulse rounded-md" />
            </div>
          ) : (
            <form className="space-y-5" onSubmit={submit} noValidate={false}>
              {mode === "register" ? (
                <label className="grid gap-2 text-sm font-medium">
                  显示名称
                  <input
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    placeholder="你的称呼"
                    required
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                </label>
              ) : null}

              <label className="grid gap-2 text-sm font-medium">
                用户名
                <input
                  className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
                  autoComplete="username"
                  minLength={3}
                  maxLength={64}
                  pattern="[A-Za-z0-9][A-Za-z0-9._-]*"
                  placeholder="字母、数字、点、下划线或连字符"
                  required
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                密码
                <span className="relative">
                  <input
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 w-full rounded-md border px-3 pr-11 outline-none focus-visible:ring-2"
                    type={showPassword ? "text" : "password"}
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    minLength={8}
                    maxLength={128}
                    placeholder="至少 8 个字符"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 focus-visible:outline-none focus-visible:ring-2"
                    aria-label={showPassword ? "隐藏密码" : "显示密码"}
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </span>
              </label>

              {mode === "register" ? (
                <label className="grid gap-2 text-sm font-medium">
                  确认密码
                  <input
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    placeholder="再次输入密码"
                    required
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                  />
                </label>
              ) : null}

              {message ? (
                <p className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm" role="alert">
                  {message}
                </p>
              ) : null}

              <Button className="h-11 w-full active:scale-[0.98]" type="submit" disabled={busy}>
                {busy ? "正在处理" : mode === "login" ? "登录并进入画布" : "注册并进入画布"}
                {!busy ? <ArrowRight /> : null}
              </Button>
            </form>
          )}

          <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm">
            <Link className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1" href="/">
              <ArrowLeft /> 返回首页
            </Link>
            <Link className="text-primary font-medium hover:underline" href={alternateHref}>
              {mode === "login" ? "没有账户？立即注册" : "已有账户？直接登录"}
            </Link>
          </div>
          <Link className="text-muted-foreground hover:text-foreground mt-5 block text-center text-sm" href="/canvas">
            暂不登录，游客体验手动画布
          </Link>
        </div>
      </section>
    </main>
  );
}
