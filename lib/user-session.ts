import { createPlatformApiClient } from "./platform-api-client";
import type { OpenApiComponents } from "./platform-contracts";

export type UserSession = OpenApiComponents["schemas"]["UserPrincipal"];

export function createBrowserPlatformClient() {
  const baseUrl =
    typeof window === "undefined" ? "http://localhost" : window.location.origin;

  return createPlatformApiClient({ baseUrl });
}

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") return fallback;
  const candidate = error as {
    message?: unknown;
    error?: { message?: unknown; details?: Array<{ message?: unknown }> };
  };
  const detail = candidate.error?.details?.find(
    (item) => typeof item.message === "string",
  )?.message;
  if (typeof detail === "string" && detail) return detail;
  if (typeof candidate.error?.message === "string" && candidate.error.message) {
    return candidate.error.message;
  }
  if (typeof candidate.message === "string" && candidate.message) {
    return candidate.message;
  }
  return fallback;
}
