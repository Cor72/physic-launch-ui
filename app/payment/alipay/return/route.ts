import { alipayReturnLocation } from "@/lib/payment-return";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  // No HTML, resources or analytics are rendered at the signed callback URL.
  return new Response(null, {
    status: 303,
    headers: {
      location: alipayReturnLocation(request.url),
      "cache-control": "no-store, private",
      "referrer-policy": "no-referrer",
      "content-security-policy":
        "default-src 'none'; frame-ancestors 'none'; base-uri 'none'",
      "x-content-type-options": "nosniff",
    },
  });
}
