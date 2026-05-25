const KEY = "fixitnow_coach_v2";

const DEFAULT = {
  helpSeen: false,
  practiceDone: false,
  myBookingsSeen: false,
  firstBookingSubmitted: false,
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
  const s = readCoachState();
  return !s.helpSeen;
}

export function shouldShowPracticeCoach() {
  const s = readCoachState();
  return s.firstBookingSubmitted && !s.practiceDone;
}

export function shouldShowMyBookingsCoach() {
  const s = readCoachState();
  return s.practiceDone && !s.myBookingsSeen;
}
