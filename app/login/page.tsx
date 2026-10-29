import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { paymentOrderNumber } from '@/lib/payment-return';

export const metadata: Metadata = { title: "登录" };

interface LoginPageProps {
  searchParams: Promise<{
    returnTo?: string | string[];
    intent?: string | string[];
    paymentOrderNo?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const query = await searchParams;
  const intent = (Array.isArray(query.intent) ? query.intent[0] : query.intent) === "ai"
    ? "ai"
    : undefined;
  if (query.returnTo !== undefined) {
    redirect(intent ? "/login?intent=ai" : "/login");
  }
  return <AuthForm mode="login" intent={intent} paymentOrderNo={paymentOrderNumber(query.paymentOrderNo) ?? undefined} />;
}
