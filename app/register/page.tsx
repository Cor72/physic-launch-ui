import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = { title: "注册" };

interface RegisterPageProps {
  searchParams: Promise<{
    returnTo?: string | string[];
    intent?: string | string[];
  }>;
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const query = await searchParams;
  const intent = (Array.isArray(query.intent) ? query.intent[0] : query.intent) === "ai"
    ? "ai"
    : undefined;
  if (query.returnTo !== undefined) {
    redirect(intent ? "/register?intent=ai" : "/register");
  }
  return <AuthForm mode="register" intent={intent} />;
}
