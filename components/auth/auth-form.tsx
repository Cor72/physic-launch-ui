"use client";

import type { PolicyConsent } from '@physic/contracts';
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
import { siteConfig } from "@/config/site";
import {
  publishAuthSessionChange,
  subscribeAuthSessionChanges,
} from "@/lib/auth-session-sync";
import { paymentOrderNumber, paymentResultPath } from '@/lib/payment-return';
import {
  apiErrorMessage,
  createBrowserPlatformClient,
} from "@/lib/user-session";

interface AuthFormProps {
  mode: "login" | "register";
  intent?: "ai";
  paymentOrderNo?: string;
}

type LoginMethod = "password" | "code";

const phonePattern = /^1[3-9]\d{9}$/;
const subscribeHydration = () => () => undefined;
const getClientHydrationSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

/* The four fields on this form had each been styled inline, and had drifted
   apart: two used focus-within, two focus-visible, and the ring colour and
   border token differed between them. Shared here so every field in the
   form focuses and fills identically. */
const fieldShell =
  "flex h-11 items-center rounded-lg border border-line bg-surface-1 transition-[border-color,box-shadow] focus-within:border-brand/50 focus-within:ring-2 focus-within:ring-ring/25";

const fieldInput =
  "text-ink placeholder:text-ink-faint h-full min-w-0 flex-1 bg-transparent px-3 text-base outline-none sm:text-[0.9375rem]";

const fieldLabel = "grid gap-2 text-[0.8125rem] font-medium text-ink";

export function AuthForm({ mode, intent, paymentOrderNo }: AuthFormProps) {
  const router = useRouter();
  const paymentOrder = paymentOrderNumber(paymentOrderNo);
  const successPath = paymentOrder ? paymentResultPath(paymentOrder) : '/canvas';
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
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [policyVersions, setPolicyVersions] = useState<Omit<PolicyConsent, 'accepted'> | null>(null);
  const [policyReminder, setPolicyReminder] = useState(0);
  const [code, setCode] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [csrfToken, setCsrfToken] = useState("");
  const [retryAt, setRetryAt] = useState(0);
  const [now, setNow] = useState(0);
  const [message, setMessage] = useState("");
  const bootstrapGeneration = useRef(0);
  const bootstrapController = useRef<AbortController | null>(null);
  const policyInput = useRef<HTMLInputElement>(null);
  const policyReminderTimer = useRef<number | null>(null);

  const showPolicyReminder = useCallback(() => {
    if (policyReminderTimer.current) {
      window.clearTimeout(policyReminderTimer.current);
    }
    setPolicyReminder((value) => value + 1);
    policyReminderTimer.current = window.setTimeout(
      () => setPolicyReminder(0),
      2_600,
    );
    policyInput.current?.focus();
  }, []);

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
      setPolicyVersions(data.legalPolicies ?? null);
      setAcceptedPolicies(false);
      if (data.account) router.replace(successPath);
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
  }, [client, router, successPath]);

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

  useEffect(() => subscribeAuthSessionChanges(() => void connect()), [connect]);

  useEffect(() => {
    if (retryAt <= Date.now()) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(timer);
  }, [retryAt]);

  useEffect(
    () => () => {
      if (policyReminderTimer.current) {
        window.clearTimeout(policyReminderTimer.current);
      }
    },
    [],
  );

  const alternatePath = mode === "login" ? "/register" : "/login";
  const alternateHref = paymentOrder
    ? `${alternatePath}?paymentOrderNo=${paymentOrder}`
    : intent
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
    if (mode === "register" && !acceptedPolicies) {
      showPolicyReminder();
      return;
    }
    if (mode === "register" && !policyVersions) {
      setMessage("协议版本未能读取，请重新连接后注册。");
      return;
    }
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
                policyConsent: { accepted: acceptedPolicies, ...policyVersions! } as PolicyConsent,
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
        if (mode === "register" && result.response.status === 409) {
          setAcceptedPolicies(false);
          void connect();
        }
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
      router.replace(successPath);
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
    <main className="bg-background text-foreground relative isolate min-h-[100dvh] overflow-x-hidden px-5 py-6 sm:px-8">
      {policyReminder ? (
        <div
          key={policyReminder}
          className="border-brand/25 bg-surface-2 text-ink motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:zoom-in-95 fixed top-5 left-1/2 z-50 flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 items-center gap-2 rounded-xl border px-4 py-3 text-[0.8125rem] font-medium shadow-lg motion-safe:duration-200"
          role="alert"
          aria-live="assertive"
        >
          <MessageSquareText className="text-brand size-4 shrink-0" />
          <span>请先勾选并同意用户协议、隐私政策及积分规则</span>
        </div>
      ) : null}
      {/* Calibrated field plus one warm bloom, matching the marketing
          pages. The stock background stacked two hard-stopped radials at
          20%/15% and 80%/85%, which banded across the card edges. */}
      <div
        aria-hidden="true"
        className="grid-field fade-radial pointer-events-none absolute inset-0 -z-10"
      />
      <div
        aria-hidden="true"
        className="from-brand/10 pointer-events-none absolute -top-32 left-1/4 -z-10 h-80 w-[40rem] -translate-x-1/2 rounded-[50%] bg-radial to-transparent to-70% blur-2xl"
      />

      <header className="max-w-container mx-auto flex w-full items-center justify-between">
        <Link
          href="/"
          className="text-ink flex items-center gap-2.5 text-[0.9375rem] font-semibold tracking-[-0.014em]"
        >
          <LaunchUI />
          {siteConfig.name}
        </Link>
      </header>

      <section className="max-w-container mx-auto grid min-h-[calc(100dvh-5rem)] w-full items-center gap-16 py-10 md:grid-cols-[minmax(0,1fr)_26.5rem]">
        <div className="hidden max-w-xl md:block">
          <p className="type-label text-brand mb-5">
            AI 动态题目可视化学习平台
          </p>
          <h1 className="type-h1 text-ink">
            <span className="block">把抽象题目，</span>
            <span className="block">变成看得见的物理过程</span>
          </h1>
          <p className="type-lede text-ink-muted mt-6 max-w-[46ch]">
            从受力、运动到轨迹，在同一张画布中搭建、观察并验证物理情境。
          </p>
        </div>

        <div className="border-line bg-surface-2 rounded-2xl border p-6 shadow-lg sm:p-8">
          <div className="mb-7">
            <div className="border-line bg-surface-3 text-brand mb-5 grid size-10 place-items-center rounded-lg border">
              {mode === "login" ? <LockKeyhole /> : <UserRound />}
            </div>
            <h2 className="type-h2 text-ink">{title}</h2>
            <p className="type-copy-sm text-ink-muted mt-2.5">{description}</p>
          </div>

          <fieldset
            className="m-0 min-w-0 border-0 p-0 disabled:cursor-wait disabled:opacity-60"
            disabled={!hydrated}
            aria-busy={!hydrated || checking}
          >
            {mode === "login" ? (
              <div
                className="border-line bg-surface-3 mb-5 grid grid-cols-2 gap-1 rounded-lg border p-1"
                aria-label="选择登录方式"
              >
                {(["password", "code"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    className={`min-h-8 rounded-md px-3 text-[0.8125rem] font-medium transition-colors ${loginMethod === method ? "bg-surface-2 text-ink border-line border shadow-sm" : "text-ink-muted hover:text-ink"}`}
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
              <label className={fieldLabel}>
                手机号
                <span className={fieldShell}>
                  <span
                    className="text-ink-faint border-line numeral border-r px-3 text-[0.8125rem]"
                    aria-hidden="true"
                  >
                    +86
                  </span>
                  <input
                    className={`${fieldInput} numeral`}
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
                <label className={fieldLabel}>
                  验证码
                  <span className={fieldShell}>
                    <input
                      className={`${fieldInput} numeral`}
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
                      className="text-brand border-line hover:bg-surface-3 h-full shrink-0 border-l px-3 text-[0.8125rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                      disabled={
                        busy ||
                        checking ||
                        !connected ||
                        !phonePattern.test(normalizedPhone) ||
                        cooldown > 0
                      }
                      onClick={() => void sendCode()}
                    >
                      {cooldown > 0 ? (
                        <span className="numeral">{cooldown} 秒后重发</span>
                      ) : (
                        "获取验证码"
                      )}
                    </button>
                  </span>
                </label>
              ) : null}

              {mode === "register" || loginMethod === "password" ? (
                <label className={fieldLabel}>
                  {mode === "register" ? "设置密码" : "密码"}
                  <span className={`${fieldShell} relative`}>
                    <input
                      className={`${fieldInput} pr-11`}
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
                      className="text-ink-faint hover:text-ink absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center rounded-md transition-colors"
                      aria-label={showPassword ? "隐藏密码" : "显示密码"}
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </span>
                </label>
              ) : null}

              {mode === "register" ? (
                <label className={fieldLabel}>
                  确认密码
                  <span className={fieldShell}>
                    <input
                      className={fieldInput}
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
                  </span>
                </label>
              ) : null}

              {mode === "register" ? (
                <div className="border-line bg-surface-3/60 flex items-start gap-3 rounded-lg border p-3.5">
                  <input
                    ref={policyInput}
                    id="accept-policies"
                    className="accent-brand mt-0.5 size-4 shrink-0"
                    type="checkbox"
                    aria-required="true"
                    checked={acceptedPolicies}
                    onChange={(event) => {
                      setAcceptedPolicies(event.target.checked);
                      setPolicyReminder(0);
                      setMessage("");
                    }}
                  />
                  <p className="text-ink-muted text-xs leading-[1.7]">
                    <label htmlFor="accept-policies" className="cursor-pointer">
                      我已阅读并同意
                    </label>
                    <Link
                      className="text-ink decoration-line-strong hover:decoration-brand underline decoration-1 underline-offset-2 transition-colors"
                      href={siteConfig.links.terms}
                      target="_blank"
                      rel="noreferrer"
                    >
                      《用户协议》
                    </Link>
                    、
                    <Link
                      className="text-ink decoration-line-strong hover:decoration-brand underline decoration-1 underline-offset-2 transition-colors"
                      href={siteConfig.links.privacy}
                      target="_blank"
                      rel="noreferrer"
                    >
                      《隐私政策》
                    </Link>
                    及
                    <Link
                      className="text-ink decoration-line-strong hover:decoration-brand underline decoration-1 underline-offset-2 transition-colors"
                      href={siteConfig.links.pointsPolicy}
                      target="_blank"
                      rel="noreferrer"
                    >
                      《积分购买及退款规则》
                    </Link>
                  </p>
                </div>
              ) : null}

              {!hydrated || checking ? (
                <p
                  className="text-ink-faint flex items-center gap-2 text-[0.8125rem]"
                  role="status"
                >
                  <MessageSquareText className="size-4 shrink-0" />
                  {!hydrated
                    ? "正在加载登录功能。"
                    : "正在确认登录状态，已登录将自动进入画布。"}
                </p>
              ) : null}

              {message ? (
                <p
                  className={`rounded-lg border px-3.5 py-2.5 text-[0.8125rem] leading-relaxed ${message.startsWith("验证码已发送") ? "border-brand/30 bg-brand-muted text-ink" : "border-destructive/30 bg-destructive/10 text-destructive-foreground"}`}
                  role="status"
                >
                  {message}
                </p>
              ) : null}

              <Button
                className="mt-1 h-11 w-full"
                size="lg"
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
                        : "确认注册并登录"}
                {!busy && !checking ? <ArrowRight /> : null}
              </Button>
            </form>
          </fieldset>

          <div className="border-line-subtle mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5 text-[0.8125rem]">
            <Link
              className="text-ink-muted hover:text-ink inline-flex items-center gap-1 transition-colors"
              href="/"
            >
              <ArrowLeft className="size-3.5" /> 返回首页
            </Link>
            <Link
              className="text-brand font-medium hover:underline"
              href={alternateHref}
            >
              {mode === "login" ? "没有账户？立即注册" : "已有账户？直接登录"}
            </Link>
          </div>
          <Link
            className="text-ink-faint hover:text-ink mt-5 block text-center text-[0.8125rem] transition-colors"
            href="/canvas"
          >
            暂不登录，游客体验手动画布
          </Link>
        </div>
      </section>
    </main>
  );
}
