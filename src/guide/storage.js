const KEY = "fixitnow_app_guide_v1";

export function hasSeenAppGuide() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markAppGuideSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function shouldAutoShowAppGuide() {
  return !hasSeenAppGuide();
}
