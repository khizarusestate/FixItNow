import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import CoachSpotlight from "../Components/coach/CoachSpotlight";
import {
  readCoachState,
  writeCoachState,
  shouldShowHelpCoach,
  shouldShowMyBookingsCoach,
} from "../coach/storage";

const CoachContext = createContext({ dismissCoach: () => {} });

export function CoachProvider({ children }) {
  const { isAuthenticated, user } = useAuth();
  const [coachStep, setCoachStep] = useState(null);

  const isCustomer =
    isAuthenticated && user?.type === "customer";
  const isWorker = isAuthenticated && user?.type === "worker";

  const dismissHelp = useCallback(() => {
    writeCoachState({ helpSeen: true });
    setCoachStep(null);
  }, []);

  const dismissMyBookings = useCallback(() => {
    writeCoachState({ myBookingsSeen: true });
    setCoachStep(null);
  }, []);

  useEffect(() => {
    if (isWorker) return;

    const t = window.setTimeout(() => {
      if (shouldShowHelpCoach()) {
        setCoachStep("help");
      }
    }, 600);

    return () => window.clearTimeout(t);
  }, [isWorker]);

  useEffect(() => {
    const onFirstBooking = () => {
      writeCoachState({ firstBookingSubmitted: true });
      const s = readCoachState();
      if (!s.practiceDone && !isWorker) {
        window.setTimeout(() => {
          window.dispatchEvent(
            new CustomEvent("fixitnow-coach-open-practice-bookings"),
          );
        }, 800);
      }
    };
    window.addEventListener("fixitnow-first-booking-submitted", onFirstBooking);
    return () =>
      window.removeEventListener(
        "fixitnow-first-booking-submitted",
        onFirstBooking,
      );
  }, [isWorker]);

  useEffect(() => {
    const onPracticeReady = () => {
      setCoachStep("practice_mark_done");
    };
    window.addEventListener(
      "fixitnow-coach-practice-panel-ready",
      onPracticeReady,
    );
    return () =>
      window.removeEventListener(
        "fixitnow-coach-practice-panel-ready",
        onPracticeReady,
      );
  }, []);

  useEffect(() => {
    const onLoggedIn = (e) => {
      const role = e.detail?.type;
      if (role !== "customer") return;
      if (!shouldShowMyBookingsCoach()) return;

      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      if (isMobile) {
        window.dispatchEvent(new CustomEvent("fixitnow-coach-open-menu"));
        window.setTimeout(() => setCoachStep("my_bookings"), 450);
      } else {
        window.setTimeout(() => setCoachStep("my_bookings"), 400);
      }
    };
    window.addEventListener("fixitnow-user-logged-in", onLoggedIn);
    return () =>
      window.removeEventListener("fixitnow-user-logged-in", onLoggedIn);
  }, []);

  useEffect(() => {
    if (!isCustomer) return;
    if (!shouldShowMyBookingsCoach()) return;
    const s = readCoachState();
    if (!s.practiceDone) return;

    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    const t = window.setTimeout(() => {
      if (isMobile) {
        window.dispatchEvent(new CustomEvent("fixitnow-coach-open-menu"));
        window.setTimeout(() => setCoachStep("my_bookings"), 450);
      } else {
        setCoachStep("my_bookings");
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, [isCustomer]);

  const coachConfig =
    coachStep === "help"
      ? {
          target: '[data-coach="help-btn"]',
          label: "Tap Help for a quick Customer or Worker guide.",
          placement: "bottom",
          onDismiss: dismissHelp,
        }
      : coachStep === "practice_mark_done"
        ? {
            target: '[data-coach="mark-done-btn"]',
            label: "Rate the worker, then tap Mark as Done when work is finished.",
            placement: "top",
            onDismiss: () => setCoachStep(null),
          }
        : coachStep === "my_bookings"
          ? {
              target: '[data-coach="my-bookings-btn"]',
              label: "Your real bookings live here — same flow you just practiced.",
              placement: "bottom",
              onDismiss: dismissMyBookings,
            }
          : null;

  return (
    <CoachContext.Provider value={{ dismissCoach: dismissHelp }}>
      {children}
      {coachConfig && (
        <CoachSpotlight
          targetSelector={coachConfig.target}
          label={coachConfig.label}
          placement={coachConfig.placement}
          onDismiss={coachConfig.onDismiss}
        />
      )}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
