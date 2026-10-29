export const AUTH_CHANGE_KEY = "questionflow:session-change";

export function finishAuthTransition(destination: string) {
  // Notify other open tabs without storing the cookie, token, or user details.
  try { localStorage.setItem(AUTH_CHANGE_KEY, crypto.randomUUID()); } catch { /* Storage can be disabled. */ }
  window.location.replace(destination);
}
