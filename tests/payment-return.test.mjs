import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { paymentPhase } from "../lib/payment-result-state.ts";
import {
  alipayReturnLocation,
  paymentOrderNumber,
  paymentResultPath,
} from "../lib/payment-return.ts";

test("return URLs retain a single bounded order hint, never signatures, seller or success flags", () => {
  assert.equal(
    alipayReturnLocation(
      "https://site.test/payment/alipay/return?out_trade_no=PTEST1&sign=private-response&trade_status=TRADE_SUCCESS&seller_id=x",
    ),
    "/payment/alipay/result?orderNo=PTEST1",
  );
  for (const suffix of [
    "",
    "?out_trade_no=P1&out_trade_no=P2",
    "?out_trade_no=https://evil.test",
    "?out_trade_no=..%2fP1",
    "?out_trade_no=" + "a".repeat(33),
  ]) {
    assert.equal(
      alipayReturnLocation("https://site.test/payment/alipay/return" + suffix),
      "/payment/alipay/result",
    );
  }
  for (const input of [
    null,
    ["P1"],
    "//evil.test",
    "/canvas",
    "P1?paid=true",
    "%50TEST",
    "P1#x",
    " P1",
  ])
    assert.equal(paymentOrderNumber(input), null);
  assert.equal(
    paymentResultPath("https://evil.test"),
    "/payment/alipay/result",
  );
});

const base = {
  accountId: "u1",
  orderNo: "P1",
  amountMinor: 500,
  points: 50,
  currency: "CNY",
  paymentStatus: "pending",
  fulfillmentStatus: "pending",
  refundStatus: null,
};
test("only session-owned server order states determine result messages", () => {
  assert.equal(paymentPhase(base, "u1", "P1"), "pending");
  assert.equal(
    paymentPhase({ ...base, paymentStatus: "paid" }, "u1", "P1"),
    "paid",
  );
  assert.equal(
    paymentPhase(
      { ...base, paymentStatus: "paid", fulfillmentStatus: "fulfilled" },
      "u1",
      "P1",
    ),
    "fulfilled",
  );
  for (const refundStatus of [
    "CREATED",
    "PROCESSING",
    "UNKNOWN",
    "UPSTREAM_SUCCEEDED",
    "NEEDS_REVIEW",
  ]) {
    assert.equal(
      paymentPhase(
        {
          ...base,
          paymentStatus: "paid",
          fulfillmentStatus: "fulfilled",
          refundStatus,
        },
        "u1",
        "P1",
      ),
      "refunding",
    );
  }
  assert.equal(
    paymentPhase(
      {
        ...base,
        paymentStatus: "refunded",
        fulfillmentStatus: "reversed",
        refundStatus: "SUCCEEDED",
      },
      "u1",
      "P1",
    ),
    "refunded",
  );
  assert.equal(
    paymentPhase({ ...base, paymentStatus: "closed" }, "u1", "P1"),
    "closed",
  );
  for (const altered of [
    { ...base, accountId: "other" },
    { ...base, orderNo: "P2" },
    { ...base, amountMinor: -1 },
    { ...base, currency: "USD" },
    { ...base, fulfillmentStatus: "fulfilled" },
    { ...base, refundStatus: "fake" },
  ]) {
    assert.throws(() => paymentPhase(altered, "u1", "P1"));
  }
});

test("the return UI is a bounded read-only lookup with no order/quote creation or local payment truth", async () => {
  const source = await readFile(
    new URL("../components/payment/payment-result.tsx", import.meta.url),
    "utf8",
  );
  assert.match(source, /attempts >= 18/);
  assert.match(source, /10_000/);
  assert.match(source, /visibilityState/);
  assert.match(source, /subscribeAuthSessionChanges/);
  assert.match(source, /controller\?\.abort/);
  assert.match(source, /accountId !== session\.data\.accountId/);
  assert.doesNotMatch(
    source,
    /client\.(POST|PUT)|localStorage|sessionStorage|searchParams|window\.opener|postMessage|dangerouslySetInnerHTML/,
  );
  assert.match(source, /\/api\/v3\/billing\/orders\/by-number\/\{orderNo\}/);
});
