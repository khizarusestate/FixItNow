import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
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
  CUSTOMER_STEPS,
  WORKER_SIGNUP_STEPS,
  WORKER_DASHBOARD_STEPS,
} from "../onboarding/steps";
import WelcomeIntentModal from "../Components/onboarding/WelcomeIntentModal";
import TourGuideLayer from "../Components/onboarding/TourGuideLayer";

const OnboardingContext = createContext(null);

const PHASE = {
  IDLE: "idle",
  CUSTOMER: "customer",
  WORKER_SIGNUP: "worker-signup",
  WORKER_DASHBOARD: "worker-dashboard",
};

function getStepsForPhase(phase) {
  switch (phase) {
    case PHASE.CUSTOMER:
      return CUSTOMER_STEPS;
    case PHASE.WORKER_SIGNUP:
      return WORKER_SIGNUP_STEPS;
    case PHASE.WORKER_DASHBOARD:
      return WORKER_DASHBOARD_STEPS;
    default:
      return [];
  }
}

export function OnboardingProvider({ children }) {
  const { user } = useAuth();
  const { openModal, closeModal } = useModal();
  const [showWelcome, setShowWelcome] = useState(false);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourMyBookingsOnly, setTourMyBookingsOnly] = useState(false);
  const [workerTourMode, setWorkerTourMode] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);

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
    setShowWelcome(shouldShowWelcome(user));
  }, [catalogReady, user?.type]);

  const endTour = useCallback((path) => {
    if (path === "customer") markPathComplete("customer");
    if (path === "worker") markPathComplete("worker");
    setPhase(PHASE.IDLE);
    setStepIndex(0);
    setTourMyBookingsOnly(false);
    setWorkerTourMode(false);
  }, []);

  const skipTour = useCallback(() => {
    if (phase === PHASE.CUSTOMER) endTour("customer");
    else if (phase.startsWith("worker")) endTour("worker");
    else {
      setPhase(PHASE.IDLE);
      setStepIndex(0);
      setShowWelcome(false);
    }
  }, [phase, endTour]);

  const goNext = useCallback(() => {
    const step = steps[stepIndex];

    if (step?.id === "my-bookings-header") {
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

    if (stepIndex >= steps.length - 1) {
      if (phase === PHASE.CUSTOMER) endTour("customer");
      else if (phase.startsWith("worker")) endTour("worker");
      return;
    }

    setStepIndex((i) => i + 1);
  }, [stepIndex, steps, phase, endTour, closeModal]);

  const startCustomerTour = useCallback(() => {
    setShowWelcome(false);
    setPhase(PHASE.CUSTOMER);
    setStepIndex(0);
    setTourMyBookingsOnly(false);
    writeOnboardingState({ lastPath: "customer" });
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

  useEffect(() => {
    if (phase === PHASE.WORKER_DASHBOARD) {
      setWorkerTourMode(true);
    }
  }, [phase]);

  useEffect(() => {
    if (!currentStep) return;

    if (currentStep.id === "bookings-list") {
      setTourMyBookingsOnly(true);
      window.dispatchEvent(new CustomEvent("open-my-bookings"));
      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent("fixitnow-tour-expand-sample"));
      }, 350);
    }

    if (currentStep.id === "worker-signup-tab") {
      openModal("signup");
      window.setTimeout(() => {
        document.querySelector("[data-tour='signup-worker-tab']")?.click();
      }, 350);
    }

    if (currentStep.id === "dashboard-open") {
      window.dispatchEvent(new CustomEvent("open-worker-dashboard"));
    }

    if (currentStep.id === "jobs-tab") {
      window.dispatchEvent(
        new CustomEvent("fixitnow-tour-set-worker-tab", {
          detail: { tab: "jobs" },
        }),
      );
    }

    if (currentStep.id === "claim-job") {
      window.dispatchEvent(
        new CustomEvent("fixitnow-tour-set-worker-tab", {
          detail: { tab: "jobs" },
        }),
      );
      window.dispatchEvent(new CustomEvent("fixitnow-tour-worker-claim-sample"));
    }

    if (currentStep.id === "mark-done") {
      window.dispatchEvent(
        new CustomEvent("fixitnow-tour-set-worker-tab", {
          detail: { tab: "my-jobs" },
        }),
      );
    }
  }, [currentStep?.id, openModal]);

  const value = useMemo(
    () => ({
      tourActive,
      phase,
      currentStep,
      tourMyBookingsOnly,
      workerTourMode,
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
      replayTour,
      skipTour,
      startCustomerTour,
      startWorkerTour,
    ],
  );

  const effectiveTarget =
    currentStep?.target &&
    (currentStep.id !== "my-bookings-header" ||
      document.querySelector(currentStep.target))
      ? currentStep.target
      : currentStep?.id === "my-bookings-header"
        ? null
        : currentStep?.target;

  const showCoach = tourActive && currentStep;

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
      {showCoach && (
        <TourGuideLayer
          targetSelector={effectiveTarget || null}
          stepIndex={stepIndex}
          totalSteps={steps.length}
          title={currentStep.title}
          body={currentStep.body}
          onNext={goNext}
          onSkip={skipTour}
          nextLabel={stepIndex >= steps.length - 1 ? "Finish" : "Next"}
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
      replayTour: () => {},
      skipTour: () => {},
    };
  }
  return ctx;
}
