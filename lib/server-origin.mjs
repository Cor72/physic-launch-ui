export function resolveInternalOrigin(value, { name, fallback, allowedHttpHosts = [] }) {
  const configured = String(value || fallback).trim();
  let origin;

  try {
    origin = new URL(configured);
  } catch {
    throw new Error(`${name} must be an absolute URL`);
  }

  const loopback = ["127.0.0.1", "localhost", "[::1]"].includes(
    origin.hostname,
  );
  const explicitlyAllowedPrivateHttp =
    origin.protocol === "http:" && allowedHttpHosts.includes(origin.hostname);
  if (
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    origin.search ||
    origin.hash ||
    (origin.protocol !== "https:" &&
      !(origin.protocol === "http:" && loopback) &&
      !explicitlyAllowedPrivateHttp)
  ) {
    throw new Error(
      `${name} must use HTTPS, or loopback HTTP, without credentials, paths, queries or fragments`,
    );
  }

  return origin.origin;
}
