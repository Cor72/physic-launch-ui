import type { OpenApiComponents } from "@physic/contracts";

export type PaymentOrder = OpenApiComponents["schemas"]["CanvasBillingOrder"];
export type PaymentPhase =
  "pending" | "paid" | "fulfilled" | "closed" | "refunding" | "refunded";

export function paymentPhase(
  value: unknown,
  accountId: string,
  orderNo: string,
): PaymentPhase {
  const order = value as PaymentOrder | null;
  if (
    !order ||
    order.accountId !== accountId ||
    order.orderNo !== orderNo ||
    order.currency !== "CNY" ||
    !Number.isSafeInteger(order.amountMinor) ||
    order.amountMinor < 1 ||
    !Number.isSafeInteger(order.points) ||
    order.points < 1 ||
    !["pending", "paid", "closed", "refunded"].includes(order.paymentStatus) ||
    !["pending", "fulfilled", "failed", "reversed"].includes(
      order.fulfillmentStatus,
    ) ||
    ![
      null,
      "CREATED",
      "PROCESSING",
      "UNKNOWN",
      "UPSTREAM_SUCCEEDED",
      "SUCCEEDED",
      "FAILED",
      "NEEDS_REVIEW",
    ].includes(order.refundStatus)
  ) {
    throw new Error("PAYMENT_RESULT_INVALID");
  }
  if (
    order.paymentStatus === "refunded" &&
    order.fulfillmentStatus === "reversed"
  )
    return "refunded";
  if (order.refundStatus && order.refundStatus !== "FAILED") return "refunding";
  if (order.fulfillmentStatus === "fulfilled" && order.paymentStatus === "paid")
    return "fulfilled";
  if (order.fulfillmentStatus === "failed" || order.paymentStatus === "closed")
    return "closed";
  if (order.paymentStatus === "paid") return "paid";
  if (
    order.paymentStatus === "pending" &&
    order.fulfillmentStatus === "pending"
  )
    return "pending";
  throw new Error("PAYMENT_RESULT_INVALID");
}

export const PAYMENT_MESSAGES = {
  pending: ["尚未确认付款", "请先查询原订单，不要重复付款。"],
  paid: ["付款已收到，积分处理中", "请勿再次付款，稍后可查询原订单。"],
  fulfilled: ["积分已到账", "可以返回画布继续使用。"],
  closed: [
    "订单已关闭或处理失败",
    "以服务端订单记录为准，如已付款请联系客服核对。",
  ],
  refunding: ["退款正在核对", "冻结积分暂不可使用，请勿重复申请退款。"],
  refunded: ["订单已退款", "购买和退款记录均已保留。"],
} as const;
