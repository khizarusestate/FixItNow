import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { useModal } from "./ModalContext";
import {
  shouldShowWelcome,
  markPathComplete,
  dismissOnboardingPermanent,
  writeOnboardingState,
} from "../onboarding/storage";
import {
  CUSTOMER_BOOKING_STEPS,
  CUSTOMER_TRACK_STEPS,
  WORKER_SIGNUP_STEPS,
  WORKER_DASHBOARD_STEPS,
} from "../onboarding/steps";
import WelcomeIntentModal from "../Components/onboarding/WelcomeIntentModal";
import TourSpotlight from "../Components/onboarding/TourSpotlight";
import TourCoachCard from "../Components/onboarding/TourCoachCard";
import TourPracticeBookingModal from "../Components/onboarding/TourPracticeBookingModal";

const OnboardingContext = createContext(null);

const PHASE = {
  IDLE: "idle",
  CUSTOMER_BOOKING: "customer-booking",
  CUSTOMER_TRACK: "customer-track",
  WORKER_SIGNUP: "worker-signup",
  WORKER_DASHBOARD: "worker-dashboard",
};

function getStepsForPhase(phase) {
  switch (phase) {
    case PHASE.CUSTOMER_BOOKING:
      return CUSTOMER_BOOKING_STEPS;
    case PHASE.CUSTOMER_TRACK:
      return CUSTOMER_TRACK_STEPS;
    case PHASE.WORKER_SIGNUP:
      return WORKER_SIGNUP_STEPS;
    case PHASE.WORKER_DASHBOARD:
      return WORKER_DASHBOARD_STEPS;
    default:
      return [];
  }
}

export function OnboardingProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { openModal, closeModal } = useModal();
  const [showWelcome, setShowWelcome] = useState(false);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [stepIndex, setStepIndex] = useState(0);
  const [practiceModalOpen, setPracticeModalOpen] = useState(false);
  const [practiceService, setPracticeService] = useState(null);
  const [tourMyBookingsOnly, setTourMyBookingsOnly] = useState(false);
  const [workerTourMode, setWorkerTourMode] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const clickListenerRef = useRef(null);

  const steps = useMemo(() => getStepsForPhase(phase), [phase]);
  const currentStep = steps[stepIndex] || null;
  const tourActive = phase !== PHASE.IDLE;

  useEffect(() => {
    const onReady = () => setCatalogReady(true);
    window.addEventListener("fixitnow-catalog-ready", onReady);
    const fallback = window.setTimeout(() => setCatalogReady(true), 3000);
    return () => {
      window.removeEventListener("fixitnow-catalog-ready", onReady);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (!catalogReady) return;
    if (user?.type === "worker") {
      setShowWelcome(shouldShowWelcome(user));
      return;
    }
    if (user?.type === "customer") {
      setShowWelcome(shouldShowWelcome(user));
      return;
    }
    setShowWelcome(shouldShowWelcome(null));
  }, [catalogReady, user?.type]);

  const endTour = useCallback((path) => {
    if (path === "customer") markPathComplete("customer");
    if (path === "worker") markPathComplete("worker");
    setPhase(PHASE.IDLE);
    setStepIndex(0);
    setPracticeModalOpen(false);
    setTourMyBookingsOnly(false);
    setWorkerTourMode(false);
    setPracticeService(null);
  }, []);

  const skipTour = useCallback(() => {
    if (phase.startsWith("customer")) endTour("customer");
    else if (phase.startsWith("worker")) endTour("worker");
    else {
      setPhase(PHASE.IDLE);
      setStepIndex(0);
      setShowWelcome(false);
    }
  }, [phase, endTour]);

  const goNext = useCallback(() => {
    const step = steps[stepIndex];
    if (step?.id === "booking-section") {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    if (step?.id === "dashboard-open") {
      window.dispatchEvent(new CustomEvent("open-worker-dashboard"));
    }
    if (step?.id === "track-intro") {
      setTourMyBookingsOnly(true);
    }
    if (step?.id === "worker-approval") {
      closeModal();
      setPhase(PHASE.WORKER_DASHBOARD);
      setStepIndex(0);
      setWorkerTourMode(true);
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("open-worker-dashboard"));
      }, 300);
      return;
    }
    if (step?.id === "booking-done") {
      setPhase(PHASE.CUSTOMER_TRACK);
      setStepIndex(0);
      setTourMyBookingsOnly(true);
      return;
    }
    if (stepIndex >= steps.length - 1) {
      if (phase.startsWith("customer")) endTour("customer");
      else if (phase.startsWith("worker")) endTour("worker");
      return;
    }
    setStepIndex((i) => i + 1);
  }, [stepIndex, steps, phase, endTour]);

  const startCustomerTour = useCallback(() => {
    setShowWelcome(false);
    setPhase(PHASE.CUSTOMER_BOOKING);
    setStepIndex(0);
    writeOnboardingState({ lastPath: "customer" });
    window.setTimeout(() => {
      document.getElementById("booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  }, []);

  const startWorkerTour = useCallback(() => {
    setShowWelcome(false);
    setPhase(PHASE.WORKER_SIGNUP);
    setStepIndex(0);
    writeOnboardingState({ lastPath: "worker" });
  }, []);

  const replayTour = useCallback(
    (path) => {
      const patch = { dismissed: false };
      if (path === "customer") patch.customerDone = false;
      if (path === "worker") patch.workerDone = false;
      writeOnboardingState(patch);
      if (path === "customer") startCustomerTour();
      else startWorkerTour();
    },
    [startCustomerTour, startWorkerTour],
  );

  const openPracticeBooking = useCallback((service) => {
    setPracticeService(service);
    setPracticeModalOpen(true);
  }, []);

  const completePracticeBooking = useCallback(() => {
    setPracticeModalOpen(false);
    setPracticeService(null);
    const idx = CUSTOMER_BOOKING_STEPS.findIndex((s) => s.id === "booking-done");
    if (idx >= 0) setStepIndex(idx);
    else goNext();
  }, [goNext]);

  const notifyStepAction = useCallback(
    (stepId) => {
      if (!currentStep || currentStep.id !== stepId) return;
      if (currentStep.advance === "click") goNext();
    },
    [currentStep, goNext],
  );

  /** Called from BookingSection when user picks service during tour */
  const interceptServiceBook = useCallback(
    (service) => {
      if (phase !== PHASE.CUSTOMER_BOOKING) return false;
      if (currentStep?.id !== "service-pick") return false;
      openPracticeBooking(service);
      const idx = CUSTOMER_BOOKING_STEPS.findIndex((s) => s.id === "practice-form");
      if (idx >= 0) setStepIndex(idx);
      return true;
    },
    [phase, currentStep, openPracticeBooking],
  );

  useEffect(() => {
    if (!tourActive || !currentStep?.target || currentStep.advance !== "click") {
      if (clickListenerRef.current) {
        const { el, handler } = clickListenerRef.current;
        el?.removeEventListener("click", handler, true);
        clickListenerRef.current = null;
      }
      return;
    }

    const attach = () => {
      const el = document.querySelector(currentStep.target);
      if (!el) return;
      const handler = () => {
        window.setTimeout(() => notifyStepAction(currentStep.id), 80);
      };
      el.addEventListener("click", handler, true);
      clickListenerRef.current = { el, handler };
    };

    const t = window.setTimeout(attach, 200);
    return () => {
      window.clearTimeout(t);
      if (clickListenerRef.current) {
        const { el, handler } = clickListenerRef.current;
        el?.removeEventListener("click", handler, true);
        clickListenerRef.current = null;
      }
    };
  }, [tourActive, currentStep, notifyStepAction]);

  useEffect(() => {
    if (currentStep?.id === "my-bookings-btn") {
      setTourMyBookingsOnly(true);
    }
  }, [currentStep?.id]);

  useEffect(() => {
    if (phase === PHASE.WORKER_DASHBOARD) {
      setWorkerTourMode(true);
    }
  }, [phase]);

  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.id === "track-intro" && !isAuthenticated) {
      openModal("login");
    }
    if (currentStep.id === "worker-signup-tab") {
      openModal("signup");
      window.setTimeout(() => {
        document.querySelector("[data-tour='signup-worker-tab']")?.click();
      }, 350);
    }
    if (currentStep.id === "jobs-tab") {
      window.dispatchEvent(
        new CustomEvent("fixitnow-tour-set-worker-tab", { detail: { tab: "jobs" } }),
      );
    }
    if (currentStep.id === "my-bookings-btn") {
      window.dispatchEvent(new CustomEvent("open-my-bookings"));
    }
    if (currentStep.id === "sample-card") {
      window.dispatchEvent(new CustomEvent("open-my-bookings"));
      window.dispatchEvent(new CustomEvent("fixitnow-tour-expand-sample"));
    }
  }, [currentStep?.id, isAuthenticated, openModal]);

  const value = useMemo(
    () => ({
      tourActive,
      phase,
      currentStep,
      tourMyBookingsOnly,
      workerTourMode,
      interceptServiceBook,
      notifyStepAction,
      replayTour,
      skipTour,
      startCustomerTour,
      startWorkerTour,
    }),
    [
      tourActive,
      phase,
      currentStep,
      tourMyBookingsOnly,
      workerTourMode,
      interceptServiceBook,
      notifyStepAction,
      replayTour,
      skipTour,
      startCustomerTour,
      startWorkerTour,
    ],
  );

  const waitingForClick = currentStep?.advance === "click";
  const showSpotlight =
    tourActive &&
    currentStep?.target &&
    !practiceModalOpen &&
    currentStep.id !== "practice-form";

  const showCoach =
    tourActive && !practiceModalOpen && currentStep && currentStep.id !== "practice-form";

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      {showWelcome && !tourActive && (
        <WelcomeIntentModal
          onSelectCustomer={startCustomerTour}
          onSelectWorker={startWorkerTour}
          onBrowseOnly={() => setShowWelcome(false)}
          onDismissPermanent={() => {
            dismissOnboardingPermanent();
            setShowWelcome(false);
          }}
        />
      )}
      {showSpotlight && (
        <TourSpotlight targetSelector={currentStep.target} zIndex={215} />
      )}
      {showCoach && (
        <TourCoachCard
          stepIndex={stepIndex}
          totalSteps={steps.length}
          title={currentStep.title}
          body={currentStep.body}
          onNext={goNext}
          onSkip={skipTour}
          showNext={currentStep.advance === "next" || currentStep.advance === "modal"}
          waitingForClick={waitingForClick}
          nextLabel={
            stepIndex >= steps.length - 1 ? "Finish" : "Next"
          }
        />
      )}
      {practiceModalOpen && (
        <TourPracticeBookingModal
          service={practiceService}
          onClose={() => {
            setPracticeModalOpen(false);
            skipTour();
          }}
          onComplete={completePracticeBooking}
        />
      )}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    return {
      tourActive: false,
      tourMyBookingsOnly: false,
      workerTourMode: false,
      interceptServiceBook: () => false,
      notifyStepAction: () => {},
      replayTour: () => {},
      skipTour: () => {},
    };
  }
  return ctx;
}
