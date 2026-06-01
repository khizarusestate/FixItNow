/** Session-only form drafts (cleared on tab close / full reload). */

export function loadFormDraft(key, defaults = {}) {
  if (!key || typeof sessionStorage === "undefined") return { ...defaults };
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return { ...defaults };
  }
}

export function saveFormDraft(key, data) {
  if (!key || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(key, JSON.stringify(data));
  } catch {
    /* quota */
  }
}

export function clearFormDraft(key) {
  if (!key || typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
