/**
 * 本地平台接口类型。
 *
 * 原先这些类型由兄弟仓库 physic-platform 的 `@physic/contracts` 提供，
 * 该仓库不在本机时前端无法解析依赖，因此这里保留前端实际用到的形状。
 * 后端契约变更时同步修改此处即可。
 */

export interface UserPrincipal {
  accountId: string;
  displayName: string;
  points?: number;
  phoneMasked?: string;
}

export type PaymentStatus = "pending" | "paid" | "closed" | "refunded";
export type FulfillmentStatus = "pending" | "fulfilled" | "failed" | "reversed";
export type RefundStatus =
  | "CREATED"
  | "PROCESSING"
  | "UNKNOWN"
  | "UPSTREAM_SUCCEEDED"
  | "SUCCEEDED"
  | "FAILED"
  | "NEEDS_REVIEW";

export interface CanvasBillingOrder {
  orderNo: string;
  accountId: string;
  currency: "CNY";
  amountMinor: number;
  points: number;
  paymentStatus: PaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  refundStatus: RefundStatus | null;
  createdAt?: string;
}

export interface PolicyConsent {
  termsVersion: string;
  privacyVersion: string;
  accepted: boolean;
}

export type PolicyVersions = Omit<PolicyConsent, "accepted">;

export interface BillingCatalog {
  monthMinor: number;
  monthPoints: number;
  yearMinor: number;
  yearPoints: number;
}

export interface AuthBootstrap {
  csrfToken: string;
  account: UserPrincipal | null;
  catalog: BillingCatalog;
  legalPolicies: PolicyVersions | null;
}

export interface AuthChallenge {
  challengeId: string;
  retryAfterSeconds: number;
}

export interface AuthSession {
  account: UserPrincipal | null;
}

/**
 * 保留 openapi 生成器的命名习惯，历史代码按 `OpenApiComponents["schemas"][...]`
 * 取类型，这里给出等价入口。
 */
export interface OpenApiComponents {
  schemas: {
    UserPrincipal: UserPrincipal;
    CanvasBillingOrder: CanvasBillingOrder;
    BillingCatalog: BillingCatalog;
  };
}
