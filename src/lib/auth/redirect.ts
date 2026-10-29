/** Only allow local application destinations, never protocol-relative/external URLs. */
export function safeReturnTo(value: string | null | undefined, fallback = "/profile") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return fallback;
  let path: string;
  try { path = decodeURIComponent(new URL(value, "https://questionflow.invalid").pathname).replace(/\/+$/, ""); } catch { return fallback; }
  if (path === "/login" || path === "/signup" || path.startsWith("/login/") || path.startsWith("/signup/") || path.startsWith("/api/")) return fallback;
  return value;
}
