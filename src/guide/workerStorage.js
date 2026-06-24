const KEY = "fixitnow_worker_guide_v1";

export function hasSeenWorkerGuide() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function markWorkerGuideSeen() {
  try {
    localStorage.setItem(KEY, "1");
  } catch {
    /* ignore */
  }
}

export function shouldAutoShowWorkerGuide() {
  return !hasSeenWorkerGuide();
}
