const AUTH_SESSION_CHANNEL = "xingchi-auth-session-v1";
const AUTH_SESSION_STORAGE_KEY = "xingchi:auth-session:v1";
const AUTH_SESSION_EVENT = "session-changed";

const sourceId =
  typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;

type SessionChange = Readonly<{
  type: typeof AUTH_SESSION_EVENT;
  version: 1;
  sourceId: string;
  nonce: string;
}>;

function isSessionChange(value: unknown): value is SessionChange {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<SessionChange>;
  return (
    candidate.type === AUTH_SESSION_EVENT &&
    candidate.version === 1 &&
    typeof candidate.sourceId === "string" &&
    typeof candidate.nonce === "string"
  );
}
function createMessage(): SessionChange {
  return {
    type: AUTH_SESSION_EVENT,
    version: 1,
    sourceId,
    nonce:
      typeof globalThis.crypto?.randomUUID === "function"
        ? globalThis.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

export function publishAuthSessionChange(): void {
  if (typeof window === "undefined") return;
  const message = createMessage();

  try {
    const channel = new BroadcastChannel(AUTH_SESSION_CHANNEL);
    channel.postMessage(message);
    channel.close();
  } catch {
    // The storage event remains as a same-origin cross-tab fallback.
  }

  try {
    window.localStorage.setItem(
      AUTH_SESSION_STORAGE_KEY,
      JSON.stringify(message),
    );
  } catch {
    // Session refresh on focus/pageshow still reconciles with the server.
  }
}

export function subscribeAuthSessionChanges(listener: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  let channel: BroadcastChannel | null = null;

  const receive = (value: unknown) => {
    if (isSessionChange(value) && value.sourceId !== sourceId) listener();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== AUTH_SESSION_STORAGE_KEY || !event.newValue) return;
    try {
      receive(JSON.parse(event.newValue));
    } catch {
      // Ignore malformed, non-authoritative browser storage.
    }
  };

  try {
    channel = new BroadcastChannel(AUTH_SESSION_CHANNEL);
    channel.addEventListener("message", (event) => receive(event.data));
  } catch {
    channel = null;
  }
  window.addEventListener("storage", onStorage);

  return () => {
    channel?.close();
    window.removeEventListener("storage", onStorage);
  };
}
