import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import CoachSpotlight from "../Components/coach/CoachSpotlight";
import { writeCoachState, shouldShowHelpCoach } from "../coach/storage";

const CoachContext = createContext({ dismissCoach: () => {} });

export function CoachProvider({ children }) {
  const { user } = useAuth();
  const [showHelpCoach, setShowHelpCoach] = useState(false);

  const isWorker = user?.type === "worker";

  const dismissHelp = useCallback(() => {
    writeCoachState({ helpSeen: true });
    setShowHelpCoach(false);
  }, []);

  useEffect(() => {
    if (isWorker) return;

    const t = window.setTimeout(() => {
      if (shouldShowHelpCoach()) {
        setShowHelpCoach(true);
      }
    }, 600);

    return () => window.clearTimeout(t);
  }, [isWorker]);

  return (
    <CoachContext.Provider value={{ dismissCoach: dismissHelp }}>
      {children}
      {showHelpCoach && (
        <CoachSpotlight
          targetSelector='[data-coach="help-btn"]'
          label="Tap Help for a quick Customer or Worker guide."
          placement="bottom"
          onDismiss={dismissHelp}
        />
      )}
    </CoachContext.Provider>
  );
}

export function useCoach() {
  return useContext(CoachContext);
}
