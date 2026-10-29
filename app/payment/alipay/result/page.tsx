import type { Metadata } from "next";

import { PaymentResult } from "@/components/payment/payment-result";
import { paymentOrderNumber } from "@/lib/payment-return";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "支付结果",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderNo?: string | string[] }>;
}) {
  const params = await searchParams;
  return <PaymentResult orderNo={paymentOrderNumber(params.orderNo)} />;
}
