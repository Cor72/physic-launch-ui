import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { safeReturnTo } from "@/lib/user-session";

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
  return (
    <AuthForm
      mode="register"
      returnTo={safeReturnTo(query.returnTo)}
      intent={intent}
    />
  );
}
