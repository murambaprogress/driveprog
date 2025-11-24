// Small helper to attempt a smooth scroll to an element by id.
export function tryScrollToId(id: string): boolean {
  try {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      return true;
    }
  } catch {
    // ignore errors from DOM querying in non-browser environments
  }
  return false;
}
