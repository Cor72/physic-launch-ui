"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { subscribeAuthSessionChanges } from "@/lib/auth-session-sync";
import {
  PAYMENT_MESSAGES,
  type PaymentOrder,
  type PaymentPhase,
  paymentPhase,
} from "@/lib/payment-result-state";
import { paymentOrderNumber } from "@/lib/payment-return";
import { createBrowserPlatformClient } from "@/lib/user-session";

type View = PaymentPhase | "checking" | "login" | "unavailable" | "changed";

export function PaymentResult({ orderNo }: { orderNo: string | null }) {
  const client = useMemo(() => createBrowserPlatformClient(), []);
  const [view, setView] = useState<View>("checking");
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [name, setName] = useState("");
  const [retry, setRetry] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (!paymentOrderNumber(orderNo)) return;
    let active = true,
      inFlight = false,
      stopped = false,
      attempts = 0,
      generation = 0;
    let accountId: string | null = null;
    let controller: AbortController | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const query = async () => {
      if (
        !active ||
        stopped ||
        inFlight ||
        document.visibilityState !== "visible"
      )
        return;
      if (attempts >= 18) {
        setPaused(true);
        setView((value) => (value === "checking" ? "unavailable" : value));
        return;
      }
      inFlight = true;
      attempts++;
      const revision = generation;
      const requestController = new AbortController();
      controller = requestController;
      const signal = requestController.signal;
      const deadline = setTimeout(() => requestController.abort(), 15_000);
      const current = () => active && revision === generation;
      try {
        const session = await client.GET("/api/v3/auth/account", { signal });
        if (!current()) return;
        if (session.response.status === 401) {
          setOrder(null);
          setName("");
          setView("login");
          stopped = true;
          return;
        }
        if (!session.response.ok || !session.data)
          throw new Error("ACCOUNT_UNAVAILABLE");
        if (accountId && accountId !== session.data.accountId) {
          setOrder(null);
          setName("");
          setView("changed");
          stopped = true;
          return;
        }
        accountId = session.data.accountId;
        const result = await client.GET(
          "/api/v3/billing/orders/by-number/{orderNo}",
          {
            params: { path: { orderNo: orderNo! } },
            signal,
          },
        );
        if (!current()) return;
        if (result.response.status === 401) {
          setOrder(null);
          setName("");
          setView("login");
          stopped = true;
          return;
        }
        if (!result.response.ok || !result.data)
          throw new Error("ORDER_UNAVAILABLE");
        const phase = paymentPhase(result.data, accountId, orderNo!);
        setOrder(result.data);
        setName(session.data.displayName);
        setView(phase);
        stopped = ["fulfilled", "closed", "refunded"].includes(phase);
      } catch {
        if (current()) {
          setOrder(null);
          setName("");
          setView("unavailable");
        }
      } finally {
        clearTimeout(deadline);
        inFlight = false;
        if (active && !stopped) timer = setTimeout(() => void query(), 10_000);
      }
    };
    const onSession = () => {
      generation++;
      controller?.abort();
      stopped = false;
      setOrder(null);
      setName("");
      setView("checking");
      // The previous query's generation cannot publish a result for this session.
      clearTimeout(timer);
      timer = setTimeout(() => void query(), 0);
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timer);
        void query();
      }
    };
    const unsubscribe = subscribeAuthSessionChanges(onSession);
    document.addEventListener("visibilitychange", onVisible);
    queueMicrotask(() => void query());
    return () => {
      active = false;
      generation++;
      controller?.abort();
      clearTimeout(timer);
      unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [client, orderNo, retry]);

  const valid = paymentOrderNumber(orderNo);
  const labels =
    view in PAYMENT_MESSAGES ? PAYMENT_MESSAGES[view as PaymentPhase] : null;
  const title = !valid
    ? "无法识别原订单"
    : (labels?.[0] ??
      (
        {
          checking: "正在确认支付结果",
          login: "请登录后查询原订单",
          unavailable: "暂时无法确认支付结果",
          changed: "账户已切换",
        } as Partial<Record<View, string>>
      )[view]);
  const text = !valid
    ? "请返回积分中心查询，不要根据页面跳转重复付款。"
    : (labels?.[1] ??
      (view === "login"
        ? "登录后只查询原单，不会重新下单。"
        : "页面跳转不代表付款成功，请查询原单或联系客服。"));

  return (
    <main className="bg-muted/30 flex min-h-dvh items-center justify-center p-5">
      <section
        className="border-border bg-background w-full max-w-xl rounded-2xl border p-7 shadow-sm"
        aria-labelledby="payment-title"
      >
        <p className="text-primary mb-3 text-sm">星驰视界 · 支付结果</p>
        <h1
          id="payment-title"
          className="text-2xl font-semibold"
          aria-live="polite"
        >
          {title}
        </h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          {text}
        </p>
        {order ? (
          <dl className="bg-muted/40 mt-6 grid grid-cols-[auto_1fr] gap-x-5 gap-y-3 rounded-lg p-4 text-sm">
            <dt>订单编号</dt>
            <dd className="break-all">{order.orderNo}</dd>
            <dt>到账账户</dt>
            <dd>{name}</dd>
            <dt>订单金额</dt>
            <dd>¥{(order.amountMinor / 100).toFixed(2)}</dd>
            <dt>订单积分</dt>
            <dd>{order.points.toLocaleString("zh-CN")} 积分</dd>
          </dl>
        ) : null}
        {paused ? (
          <p className="text-muted-foreground mt-4 text-sm" role="status">
            自动查询已暂停，可手动查询原单。
          </p>
        ) : null}
        <div className="mt-7 flex flex-wrap items-center gap-4">
          {valid && view === "login" ? (
            <Link
              className="bg-primary text-primary-foreground rounded-md px-4 py-2"
              href={`/login?paymentOrderNo=${valid}`}
            >
              登录并查询原订单
            </Link>
          ) : valid ? (
            <button
              className="bg-primary text-primary-foreground rounded-md px-4 py-2 disabled:opacity-60"
              type="button"
              disabled={view === "checking"}
              onClick={() => {
                setView("checking");
                setOrder(null);
                setName("");
                setPaused(false);
                setRetry((value) => value + 1);
              }}
            >
              查询原订单
            </button>
          ) : null}
          <Link
            className="text-primary underline underline-offset-4"
            href="/canvas"
          >
            返回画布
          </Link>
          <Link
            className="text-muted-foreground text-sm underline underline-offset-4"
            href="/points-policy"
          >
            积分购买及退款规则
          </Link>
        </div>
      </section>
    </main>
  );
}
