import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GOOGLE_CLIENT_ID as BUILD_TIME_CLIENT_ID } from "../config/oauth.js";
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

  const buildClientId = resolveBuildTimeClientId();

  useEffect(() => {
    if (buildClientId) {
      setFetched(true);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/public/config`, {
          credentials: "omit",
        });
        const data = await res.json();
        if (!cancelled && data?.googleClientId) {
          setRuntimeClientId(String(data.googleClientId).trim());
        }
      } catch {
        /* ignore — button stays hidden if unavailable */
      } finally {
        if (!cancelled) setFetched(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [buildClientId]);

  const googleClientId = buildClientId || runtimeClientId;
  const ready = Boolean(buildClientId) || fetched;

  const value = useMemo(
    () => ({
      googleClientId,
      ready,
      isGoogleSignInEnabled: Boolean(googleClientId),
    }),
    [googleClientId, ready],
  );

  const inner = (
    <OAuthConfigContext.Provider value={value}>
      {children}
    </OAuthConfigContext.Provider>
  );

  if (!googleClientId) {
    return inner;
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>{inner}</GoogleOAuthProvider>
  );
}

export function useOAuthConfig() {
  return useContext(OAuthConfigContext);
}
