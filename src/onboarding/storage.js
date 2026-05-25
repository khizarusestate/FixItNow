const STORAGE_KEY = "fixitnow_onboarding_v1";

export function readOnboardingState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeOnboardingState(patch) {
  const next = { ...readOnboardingState(), ...patch };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function shouldShowWelcome(user) {
  const s = readOnboardingState();
  if (s.dismissed) return false;
  if (user?.type === "worker" && s.workerDone) return false;
  if (user?.type === "customer" && s.customerDone) return false;
  if (!user && s.customerDone && s.workerDone) return false;
  return true;
}

export function markPathComplete(path) {
  if (path === "customer") writeOnboardingState({ customerDone: true });
  if (path === "worker") writeOnboardingState({ workerDone: true });
}

export function dismissOnboardingPermanent() {
  writeOnboardingState({ dismissed: true });
}
