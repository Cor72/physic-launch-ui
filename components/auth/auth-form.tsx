"use client";

import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import LaunchUI from "@/components/logos/launch-ui";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/mode-toggle";
import { publishAuthSessionChange } from "@/lib/auth-session-sync";
import {
  apiErrorMessage,
  createBrowserPlatformClient,
} from "@/lib/user-session";

interface AuthFormProps {
  mode: "login" | "register";
  intent?: "ai";
}

type LoginMethod = "password" | "code";

const phonePattern = /^1[3-9]\d{9}$/;
const subscribeHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

export function AuthForm({ mode, intent }: AuthFormProps) {
  const router = useRouter();
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getClientHydrationSnapshot,
    getServerHydrationSnapshot,
  );
  const [checking, setChecking] = useState(true);
  const [connected, setConnected] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("password");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  const bootstrapGeneration = useRef(0);
  const bootstrapController = useRef<AbortController | null>(null);

  const connect = useCallback(async () => {
    const generation = ++bootstrapGeneration.current;
    bootstrapController.current?.abort();
    const controller = new AbortController();
    bootstrapController.current = controller;
    let timedOut = false;
    setChecking(true);
    setConnected(false);
    setCsrfToken("");
    setMessage("");
    const timeout = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15_000);

    try {
      const { data, error, response } = await client.GET(
        "/api/v3/auth/bootstrap",
        { signal: controller.signal },
      );
      if (generation !== bootstrapGeneration.current) return false;
      if (!response.ok || !data) {
        throw new Error(apiErrorMessage(error, "账户服务暂时不可用"));
      }
      setCsrfToken(data.csrfToken);
      setConnected(true);
      setMessage("");
      if (data.account) router.replace("/canvas");
      return true;
    } catch (error) {
      if (generation !== bootstrapGeneration.current) return false;
      setConnected(false);
      setCsrfToken("");
      setMessage(
        timedOut
          ? "账户服务连接超时，请确认后台服务已启动后重新连接。"
          : error instanceof Error
            ? error.message
            : "账户服务暂时不可用",
      );
      return false;
    } finally {
      window.clearTimeout(timeout);
      if (generation === bootstrapGeneration.current) {
        bootstrapController.current = null;
        setChecking(false);
      }
    }
  }, [client, router]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void connect();
    });

    return () => {
      active = false;
      bootstrapGeneration.current += 1;
      bootstrapController.current?.abort();
      bootstrapController.current = null;
    };
  }, [connect]);

  useEffect(() => {
    if (retryAt <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  const alternatePath = mode === "login" ? "/register" : "/login";
  const alternateHref = intent
    ? `${alternatePath}?intent=${intent}`
    : alternatePath;
  const cooldown = Math.max(0, Math.ceil((retryAt - now) / 1_000));
  const normalizedPhone = phone.trim();
  const verificationMode = mode === "register" || loginMethod === "code";

  function resetChallenge(nextPhone = normalizedPhone) {
    setPhone(nextPhone.replace(/\D/g, "").slice(0, 11));
    setCode("");
    setChallengeId("");
    setRetryAt(0);
    setMessage("");
  }

  async function sendCode() {
    if (busy || checking) return;
    if (!connected || !csrfToken) {
      setMessage("账户服务尚未连接，请刷新页面后重试。");
      return;
    }
    if (!phonePattern.test(normalizedPhone)) {
      setMessage("请输入正确的 11 位中国大陆手机号。");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const result = await client.POST("/api/v3/auth/challenges", {
        params: {
          header: {
            "Idempotency-Key": crypto.randomUUID(),
            "X-CSRF-Token": csrfToken,
          },
        },
        body: {
          method: "phone",
          identity: `+86${normalizedPhone}`,
          purpose: mode === "register" ? "register" : "login",
        },
      });
      if (!result.response.ok || !result.data) {
        throw new Error(
          apiErrorMessage(result.error, "验证码发送失败，请稍后重试"),
        );
      }
      setChallengeId(result.data.challengeId);
      setRetryAt(Date.now() + result.data.retryAfterSeconds * 1_000);
      setNow(Date.now());
      setMessage("验证码已发送，5 分钟内有效。");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "验证码发送失败，请稍后重试",
      );
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || checking) return;
    if (!connected || !csrfToken) {
      setMessage("账户服务尚未连接，请刷新页面后重试。");
      return;
    }
    if (!phonePattern.test(normalizedPhone)) {
      setMessage("请输入正确的 11 位中国大陆手机号。");
      return;
    }
    if (verificationMode && (!challengeId || !/^\d{6}$/.test(code))) {
      setMessage("请先获取并填写 6 位验证码。");
      return;
    }
    if (mode === "register" && password !== confirmPassword) {
      setMessage("两次输入的密码不一致。");
      return;
    }

    setBusy(true);
    setMessage("");
    try {
      const params = { header: { "X-CSRF-Token": csrfToken } };
      const result =
        mode === "register"
          ? await client.POST("/api/v3/auth/register", {
              params,
              body: {
                method: "phone",
                identity: `+86${normalizedPhone}`,
                challengeId,
                code,
                password,
              },
            })
          : await client.POST("/api/v3/auth/login", {
              params,
              body:
                loginMethod === "password"
                  ? {
                      method: "password",
                      identity: `+86${normalizedPhone}`,
                      password,
                    }
                  : {
                      method: "phone",
                      identity: `+86${normalizedPhone}`,
                      challengeId,
                      code,
                    },
            });
      if (!result.response.ok || !result.data?.account) {
        throw new Error(
          apiErrorMessage(
            result.error,
            mode === "login"
              ? "登录失败，请检查手机号和登录信息"
              : "注册失败，请检查填写内容",
          ),
        );
      }
      setPassword("");
      setConfirmPassword("");
      setCode("");
      publishAuthSessionChange();
      router.replace("/canvas");
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
        ? "使用注册手机号登录，继续保存和分析你的题目。"
        : "验证手机号并设置密码。新账户初始积分为 0，手动搭建可直接使用。";

  return (
    <main className="bg-background text-foreground relative isolate min-h-[100dvh] overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_oklab,var(--brand)_15%,transparent),transparent_32%),radial-gradient(circle_at_80%_85%,color-mix(in_oklab,var(--brand)_9%,transparent),transparent_28%)]" />
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-semibold"
        >
          <LaunchUI />
          悟言视界
        </Link>
        <ThemeToggle />
      </header>

      <section className="mx-auto grid min-h-[calc(100dvh-5rem)] w-full max-w-6xl items-center gap-12 py-10 md:grid-cols-[minmax(0,1fr)_440px]">
        <div className="hidden max-w-xl md:block">
          <p className="text-brand mb-5 text-sm font-semibold">
            AI 动态题目可视化学习平台
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight lg:text-6xl">
            把抽象题目，变成看得见的物理过程
          </h1>
          <p className="text-muted-foreground mt-6 max-w-[52ch] text-lg leading-relaxed">
            从受力、运动到轨迹，在同一张画布中搭建、观察并验证物理情境。
          </p>
        </div>

        <div className="border-border bg-card/95 rounded-2xl border p-6 shadow-xl shadow-orange-950/5 backdrop-blur-sm sm:p-8">
          <div className="mb-6">
            <div className="bg-primary/10 text-primary mb-5 grid size-11 place-items-center rounded-xl">
              {mode === "login" ? <LockKeyhole /> : <UserRound />}
            </div>
            <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {description}
            </p>
          </div>

          <fieldset
            className="m-0 min-w-0 border-0 p-0 disabled:cursor-wait disabled:opacity-60"
            disabled={!hydrated}
            aria-busy={!hydrated || checking}
          >
            {mode === "login" ? (
              <div
                className="bg-muted mb-5 grid grid-cols-2 rounded-lg p-1"
                aria-label="选择登录方式"
              >
                {(["password", "code"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`min-h-9 rounded-md px-3 text-sm font-medium transition-colors ${loginMethod === method ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    aria-pressed={loginMethod === method}
                    onClick={() => {
                      setLoginMethod(method);
                      setPassword("");
                      resetChallenge();
                    }}
                  >
                    {method === "password" ? "密码登录" : "验证码登录"}
                  </button>
                ))}
              </div>
            ) : null}

            <form className="space-y-4" onSubmit={submit} noValidate={false}>
              <label className="grid gap-2 text-sm font-medium">
                手机号
                <span className="border-input bg-background focus-within:ring-ring flex h-11 items-center rounded-md border focus-within:ring-2">
                  <span
                    className="text-muted-foreground border-input border-r px-3"
                    aria-hidden="true"
                  >
                    +86
                  </span>
                  <input
                    className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent px-3 outline-none"
                    autoComplete="tel-national"
                    inputMode="tel"
                    maxLength={11}
                    pattern="1[3-9][0-9]{9}"
                    placeholder="请输入 11 位手机号"
                    required
                    value={phone}
                    onChange={(event) => resetChallenge(event.target.value)}
                  />
                </span>
              </label>

              {verificationMode ? (
                <label className="grid gap-2 text-sm font-medium">
                  验证码
                  <span className="border-input bg-background focus-within:ring-ring flex h-11 items-center rounded-md border focus-within:ring-2">
                    <input
                      className="text-foreground placeholder:text-muted-foreground h-full min-w-0 flex-1 bg-transparent px-3 outline-none"
                      autoComplete="one-time-code"
                      inputMode="numeric"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      placeholder="输入 6 位验证码"
                      required
                      value={code}
                      onChange={(event) =>
                        setCode(
                          event.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                    />
                    <button
                      type="button"
                      className="text-primary border-input h-7 shrink-0 border-l px-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={
                        busy ||
                        checking ||
                        !connected ||
                        !phonePattern.test(normalizedPhone) ||
                        cooldown > 0
                      }
                      onClick={() => void sendCode()}
                    >
                      {cooldown > 0 ? `${cooldown} 秒后重发` : "获取验证码"}
                    </button>
                  </span>
                </label>
              ) : null}

              {mode === "register" || loginMethod === "password" ? (
                <label className="grid gap-2 text-sm font-medium">
                  {mode === "register" ? "设置密码" : "密码"}
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
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setMessage("");
                      }}
                    />
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 focus-visible:ring-2 focus-visible:outline-none"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </span>
                </label>
              ) : null}

              {mode === "register" ? (
                <label className="grid gap-2 text-sm font-medium">
                  确认密码
                  <input
                    className="border-input bg-background text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11 rounded-md border px-3 outline-none focus-visible:ring-2"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    minLength={8}
                    maxLength={128}
                    placeholder="再次输入密码"
                    required
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setMessage("");
                    }}
                  />
                </label>
              ) : null}

              {!hydrated || checking ? (
                <p
                  className="text-muted-foreground flex items-center gap-2 text-sm"
                  role="status"
                >
                  <MessageSquareText className="size-4" />
                  {!hydrated
                    ? "正在加载登录功能。"
                    : "正在确认登录状态，已登录将自动进入画布。"}
                </p>
              ) : null}

              {message ? (
                <p
                  className={`rounded-md border px-3 py-2 text-sm ${message.startsWith("验证码已发送") ? "border-primary/25 bg-primary/5 text-foreground" : "border-destructive/30 bg-destructive/10 text-destructive"}`}
                  role="status"
                >
                  {message}
                </p>
              ) : null}

              <Button
                className="h-11 w-full active:scale-[0.98]"
                type={connected ? "submit" : "button"}
                disabled={busy || checking || !hydrated}
                onClick={connected ? undefined : () => void connect()}
              >
                {busy
                  ? "正在处理"
                  : !hydrated || checking
                    ? "正在连接账户服务"
                    : !connected
                      ? "重新连接账户服务"
                      : mode === "login"
                        ? "登录并进入画布"
                        : "确认注册并进入画布"}
                {!busy && !checking ? <ArrowRight /> : null}
              </Button>
            </form>
          </fieldset>

          <div className="border-border mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-sm">
            <Link
              className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
              href="/"
            >
              <ArrowLeft /> 返回首页
            </Link>
            <Link
              className="text-primary font-medium hover:underline"
              href={alternateHref}
            >
              {mode === "login" ? "没有账户？立即注册" : "已有账户？直接登录"}
            </Link>
          </div>
          <Link
            className="text-muted-foreground hover:text-foreground mt-5 block text-center text-sm"
            href="/canvas"
          >
            暂不登录，游客体验手动画布
          </Link>
        </div>
      </section>
    </main>
  );
}
