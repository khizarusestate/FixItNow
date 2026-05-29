import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AppGuidePanel from "../Components/guide/AppGuidePanel";
import WorkerGuidePanel from "../Components/guide/WorkerGuidePanel";
import { getActiveSessionRole } from "../utils/jwt.js";
import { markAppGuideSeen, shouldAutoShowAppGuide } from "../guide/storage";
import {
  markWorkerGuideSeen,
  shouldAutoShowWorkerGuide,
} from "../guide/workerStorage";

const GuideContext = createContext({
  openGuide: () => {},
  closeGuide: () => {},
  isGuideOpen: false,
  openWorkerGuide: () => {},
});

export function GuideProvider({ children }) {
  const [isCustomerGuideOpen, setIsCustomerGuideOpen] = useState(false);
  const [isWorkerGuideOpen, setIsWorkerGuideOpen] = useState(false);

  const openGuide = useCallback(() => setIsCustomerGuideOpen(true), []);

  const closeGuide = useCallback(() => {
    setIsCustomerGuideOpen(false);
    markAppGuideSeen();
  }, []);

  const openWorkerGuide = useCallback(() => setIsWorkerGuideOpen(true), []);

  const closeWorkerGuide = useCallback(() => {
    setIsWorkerGuideOpen(false);
    markWorkerGuideSeen();
  }, []);

  useEffect(() => {
    const onOpen = () => openGuide();
    window.addEventListener("fixitnow-open-guide", onOpen);
    return () => window.removeEventListener("fixitnow-open-guide", onOpen);
  }, [openGuide]);

  useEffect(() => {
    const onOpenWorker = () => {
      if (!shouldAutoShowWorkerGuide()) return;
      window.setTimeout(() => {
        window.scrollTo(0, 0);
        setIsWorkerGuideOpen(true);
      }, 700);
    };
    window.addEventListener("fixitnow-show-worker-guide", onOpenWorker);
    return () =>
      window.removeEventListener("fixitnow-show-worker-guide", onOpenWorker);
  }, []);

  useEffect(() => {
    if (!shouldAutoShowAppGuide()) return;
    if (getActiveSessionRole() === "worker") return;
    const t = window.setTimeout(() => {
      window.scrollTo(0, 0);
      setIsCustomerGuideOpen(true);
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <GuideContext.Provider
      value={{
        openGuide,
        closeGuide,
        isGuideOpen: isCustomerGuideOpen,
        openWorkerGuide,
      }}
    >
      {children}
      <AppGuidePanel isOpen={isCustomerGuideOpen} onClose={closeGuide} />
      <WorkerGuidePanel isOpen={isWorkerGuideOpen} onClose={closeWorkerGuide} />
    </GuideContext.Provider>
  );
}

export function useGuide() {
  return useContext(GuideContext);
}
