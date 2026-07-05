import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { API_BASE_URL } from "../config/env.js";

const OAuthConfigContext = createContext({
  googleClientId: "",
  ready: false,
});

function resolveBuildTimeClientId() {
  const fromVite = String(BUILD_TIME_CLIENT_ID || "").trim();
  if (fromVite) return fromVite;

  if (typeof window !== "undefined" && window.__FIXITNOW_GOOGLE_CLIENT_ID__) {
    return String(window.__FIXITNOW_GOOGLE_CLIENT_ID__).trim();
  }
  return "";
}

export function OAuthConfigProvider({ children }) {
  const [runtimeClientId, setRuntimeClientId] = useState("");
  const [fetched, setFetched] = useState(false);

  // OAuth is disabled: always provide a disabled config so UI paths stay consistent
  const value = useMemo(
    () => ({
      googleClientId: "",
      ready: true,
      isGoogleSignInEnabled: false,
    }),
    [],
  );

  return (
    <OAuthConfigContext.Provider value={value}>
      {children}
    </OAuthConfigContext.Provider>
  );
}

export function useOAuthConfig() {
  return useContext(OAuthConfigContext);
}
