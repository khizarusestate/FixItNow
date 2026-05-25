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
  const patch = { completedAt: new Date().toISOString() };
  if (path === "customer") {
    writeOnboardingState({ customerDone: true, ...patch });
  }
  if (path === "worker") {
    writeOnboardingState({ workerDone: true, ...patch });
  }
}

export function dismissOnboardingPermanent() {
  writeOnboardingState({ dismissed: true });
}

export function recordTourSkipped(phase, stepId, stepIndex) {
  const prev = readOnboardingState().skipEvents || [];
  writeOnboardingState({
    skipEvents: [
      ...prev.slice(-19),
      { phase, stepId, stepIndex, at: new Date().toISOString() },
    ],
  });
}

export function shouldShowPostTourChecklist(path) {
  const s = readOnboardingState();
  if (path === "customer" && s.checklistDismissed) return false;
  if (path === "worker" && s.workerChecklistDismissed) return false;
  return true;
}

export function dismissPostTourChecklist(path) {
  if (path === "customer") writeOnboardingState({ checklistDismissed: true });
  if (path === "worker") writeOnboardingState({ workerChecklistDismissed: true });
}

export function shouldShowFirstBookingTip() {
  const s = readOnboardingState();
  return !s.firstBookingTipShown;
}

export function markFirstBookingTipShown() {
  writeOnboardingState({ firstBookingTipShown: true });
}

export function shouldElevateModals(phase, stepId) {
  if (phase === "worker-signup" || phase === "worker-dashboard") return true;
  if (
    phase === "customer" &&
    ["bookings-list", "sample-status", "rate-done", "my-bookings-header"].includes(
      stepId,
    )
  ) {
    return true;
  }
  return false;
}

export const TOUR_MODAL_Z = "z-[230]";
