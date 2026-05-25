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
  recordTourSkipped,
  shouldShowPostTourChecklist,
  shouldShowFirstBookingTip,
  markFirstBookingTipShown,
  shouldElevateModals,
} from "../onboarding/storage";
import {
  CUSTOMER_STEPS,
  WORKER_SIGNUP_STEPS,
  WORKER_DASHBOARD_STEPS,
  CUSTOMER_CHECKLIST,
  WORKER_CHECKLIST,
} from "../onboarding/steps";
import WelcomeIntentModal from "../Components/onboarding/WelcomeIntentModal";
import TourGuideLayer from "../Components/onboarding/TourGuideLayer";
import TourPostChecklist from "../Components/onboarding/TourPostChecklist";
import TourGuestPrompt from "../Components/onboarding/TourGuestPrompt";
import FirstBookingTip from "../Components/onboarding/FirstBookingTip";

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

function finishPathLabel(phase) {
  if (phase === PHASE.CUSTOMER) return "customer";
  if (phase.startsWith("worker")) return "worker";
  return null;
}

export function OnboardingProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { openModal, closeModal } = useModal();
  const [showWelcome, setShowWelcome] = useState(false);
  const [phase, setPhase] = useState(PHASE.IDLE);
  const [stepIndex, setStepIndex] = useState(0);
  const [tourMyBookingsOnly, setTourMyBookingsOnly] = useState(false);
  const [workerTourMode, setWorkerTourMode] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [postChecklistPath, setPostChecklistPath] = useState(null);
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);
  const [showFirstBookingTip, setShowFirstBookingTip] = useState(false);

  const steps = useMemo(() => getStepsForPhase(phase), [phase]);
  const currentStep = steps[stepIndex] || null;
  const tourActive = phase !== PHASE.IDLE;

  const elevateModals = useMemo(
    () => shouldElevateModals(phase, currentStep?.id),
    [phase, currentStep?.id],
  );

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

  useEffect(() => {
    const onFirstBooking = () => {
      if (!isAuthenticated || user?.type !== "customer") return;
      if (!shouldShowFirstBookingTip()) return;
      setShowFirstBookingTip(true);
    };
    window.addEventListener("fixitnow-first-booking", onFirstBooking);
    return () =>
      window.removeEventListener("fixitnow-first-booking", onFirstBooking);
  }, [isAuthenticated, user?.type]);

  const afterTourComplete = useCallback(
    (path) => {
      if (path === "customer") {
        if (!isAuthenticated) {
          setShowGuestPrompt(true);
        } else if (shouldShowPostTourChecklist("customer")) {
          setPostChecklistPath("customer");
        }
      } else if (path === "worker" && shouldShowPostTourChecklist("worker")) {
        setPostChecklistPath("worker");
      }
    },
    [isAuthenticated],
  );

  const endTour = useCallback(
    (path, { skipped = false } = {}) => {
      if (path) markPathComplete(path);
      setPhase(PHASE.IDLE);
      setStepIndex(0);
      setTourMyBookingsOnly(false);
      setWorkerTourMode(false);
      closeModal();
      if (!skipped && path) afterTourComplete(path);
    },
    [afterTourComplete, closeModal],
  );

  const skipTour = useCallback(() => {
    const path = finishPathLabel(phase);
    if (currentStep) {
      recordTourSkipped(phase, currentStep.id, stepIndex);
    }
    if (path) endTour(path, { skipped: true });
    else {
      setPhase(PHASE.IDLE);
      setStepIndex(0);
      setShowWelcome(false);
    }
  }, [phase, currentStep, stepIndex, endTour]);

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
      const path = finishPathLabel(phase);
      if (path) endTour(path);
      return;
    }

    setStepIndex((i) => i + 1);
  }, [stepIndex, steps, phase, endTour, closeModal]);

  const startCustomerTour = useCallback(() => {
    setShowWelcome(false);
    setPostChecklistPath(null);
    setShowGuestPrompt(false);
    setPhase(PHASE.CUSTOMER);
    setStepIndex(0);
    setTourMyBookingsOnly(false);
    writeOnboardingState({ lastPath: "customer" });
  }, []);

  const startWorkerTour = useCallback(() => {
    setShowWelcome(false);
    setPostChecklistPath(null);
    setPhase(PHASE.WORKER_SIGNUP);
    setStepIndex(0);
    writeOnboardingState({ lastPath: "worker" });
  }, []);

  const openHowItWorks = useCallback(() => {
    if (tourActive) return;
    if (user?.type === "worker") startWorkerTour();
    else startCustomerTour();
  }, [tourActive, user?.type, startCustomerTour, startWorkerTour]);

  const replayTour = useCallback(
    (path) => {
      const patch = { dismissed: false };
      if (path === "customer") patch.customerDone = false;
      if (path === "worker") patch.workerDone = false;
      writeOnboardingState(patch);
      setPostChecklistPath(null);
      setShowGuestPrompt(false);
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
      elevateModals,
      replayTour,
      skipTour,
      startCustomerTour,
      startWorkerTour,
      openHowItWorks,
    }),
    [
      tourActive,
      phase,
      currentStep,
      tourMyBookingsOnly,
      workerTourMode,
      elevateModals,
      replayTour,
      skipTour,
      startCustomerTour,
      startWorkerTour,
      openHowItWorks,
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
      {postChecklistPath && !tourActive && (
        <TourPostChecklist
          path={postChecklistPath}
          items={
            postChecklistPath === "worker"
              ? WORKER_CHECKLIST
              : CUSTOMER_CHECKLIST
          }
          onClose={() => setPostChecklistPath(null)}
        />
      )}
      {showGuestPrompt && !tourActive && (
        <TourGuestPrompt
          onSignUp={() => {
            setShowGuestPrompt(false);
            openModal("signup");
          }}
          onDismiss={() => setShowGuestPrompt(false)}
        />
      )}
      {showFirstBookingTip && !tourActive && (
        <FirstBookingTip
          onOpenBookings={() => {
            markFirstBookingTipShown();
            setShowFirstBookingTip(false);
            window.dispatchEvent(new CustomEvent("open-my-bookings"));
          }}
          onDismiss={() => {
            markFirstBookingTipShown();
            setShowFirstBookingTip(false);
          }}
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
      elevateModals: false,
      replayTour: () => {},
      skipTour: () => {},
      openHowItWorks: () => {},
    };
  }
  return ctx;
}
