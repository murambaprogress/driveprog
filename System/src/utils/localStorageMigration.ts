// Migrate any existing localStorage keys from the old prefix 'vhoozh_' to 'drivecash_'.
// This is idempotent and safe to run on every startup.
const OLD_PREFIX = 'vhoozh_';
const NEW_PREFIX = 'drivecash_';

export function migrateLocalStorage() {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(OLD_PREFIX)) keys.push(k);
    }
    keys.forEach(k => {
      const newKey = NEW_PREFIX + k.substring(OLD_PREFIX.length);
      if (localStorage.getItem(newKey) == null) {
        const v = localStorage.getItem(k);
        if (v != null) localStorage.setItem(newKey, v);
      }
    });
  } catch {
    // ignore migration failures
  }
}

export default migrateLocalStorage;
