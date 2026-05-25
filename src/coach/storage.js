const KEY = "fixitnow_coach_v2";

const DEFAULT = {
  helpSeen: false,
};

export function readCoachState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function writeCoachState(patch) {
  const next = { ...readCoachState(), ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function shouldShowHelpCoach() {
  return !readCoachState().helpSeen;
}
