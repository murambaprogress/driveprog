// Simple session utilities for demo auto-logout
const SESSION_KEY = 'drivecash_session_expires';

export function setSession(ttlMinutes = 5) {
  try {
    // enforce a minimum TTL of 5 minutes to avoid accidental early logout
    const minTtl = 5;
    const ttl = Math.max(ttlMinutes, minTtl);
    const expires = Date.now() + ttl * 60 * 1000;
    localStorage.setItem(SESSION_KEY, String(expires));
  } catch {
    // ignore storage errors (e.g., private mode)
  }
}

export function setUserName(name: string) {
  try { localStorage.setItem('drivecash_user_name', name); } catch { /* ignore */ } 
}

export function getUserName(): string | null {
  try { return localStorage.getItem('drivecash_user_name'); } catch { return null; }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export function getSessionExpiry(): number | null {
  try {
    const v = localStorage.getItem(SESSION_KEY);
    return v ? Number(v) : null;
  } catch { return null; }
}

export function isSessionValid(): boolean {
  const exp = getSessionExpiry();
  return exp !== null && Date.now() < exp;
}

export function timeUntilExpiryMs(): number {
  const exp = getSessionExpiry();
  if (!exp) return 0;
  return Math.max(0, exp - Date.now());
}

export default {
  setSession,
  clearSession,
  getSessionExpiry,
  isSessionValid,
  timeUntilExpiryMs
};
