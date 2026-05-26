import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import AppGuidePanel from "../Components/guide/AppGuidePanel";
import { markAppGuideSeen, shouldAutoShowAppGuide } from "../guide/storage";

const GuideContext = createContext({
  openGuide: () => {},
  closeGuide: () => {},
  isGuideOpen: false,
});

export function GuideProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openGuide = useCallback(() => setIsOpen(true), []);

  const closeGuide = useCallback(() => {
    setIsOpen(false);
    markAppGuideSeen();
  }, []);

  useEffect(() => {
    const onOpen = () => openGuide();
    window.addEventListener("fixitnow-open-guide", onOpen);
    return () => window.removeEventListener("fixitnow-open-guide", onOpen);
  }, [openGuide]);

  useEffect(() => {
    if (!shouldAutoShowAppGuide()) return;
    const t = window.setTimeout(() => {
      window.scrollTo(0, 0);
      setIsOpen(true);
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <GuideContext.Provider value={{ openGuide, closeGuide, isGuideOpen: isOpen }}>
      {children}
      <AppGuidePanel isOpen={isOpen} onClose={closeGuide} />
    </GuideContext.Provider>
  );
}

export function useGuide() {
  return useContext(GuideContext);
}
