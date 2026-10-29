// An order number is only a lookup hint. The API checks session ownership.
export function paymentOrderNumber(value: unknown): string | null {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,32}$/.test(value)
    ? value
    : null;
}

export function paymentResultPath(value: unknown): string {
  const order = paymentOrderNumber(value);
  return order
    ? `/payment/alipay/result?orderNo=${order}`
    : "/payment/alipay/result";
}

export function alipayReturnLocation(url: string): string {
  const values = new URL(url).searchParams.getAll("out_trade_no");
  return paymentResultPath(values.length === 1 ? values[0] : null);
}
