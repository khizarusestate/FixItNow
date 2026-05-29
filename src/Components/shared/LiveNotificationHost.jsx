import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import LiveNotificationPanel from "./LiveNotificationPanel.jsx";
import {
  resolveCustomerLiveNotification,
  runCustomerLiveAction,
} from "../../utils/liveNotificationActions.js";

const AUTO_DISMISS_MS = 8000;

function normalizeDetail(raw) {
  if (!raw || typeof raw !== "object") return { title: "Notification", message: "" };
  return {
    ...raw,
    title: raw.title || "Notification",
    message: raw.message || "",
  };
}

export default function LiveNotificationHost() {
  const { user, isAuthenticated } = useAuth();
  const [current, setCurrent] = useState(null);
  const queueRef = useRef([]);
  const showingRef = useRef(false);
  const currentRef = useRef(null);

  useEffect(() => {
    currentRef.current = current;
  }, [current]);

  const dismiss = useCallback(() => {
    if (currentRef.current?.kind === "session-expiring") {
      window.dispatchEvent(
        new CustomEvent("fixitnow-dismiss-session-expiring"),
      );
    }
    showingRef.current = false;
    setCurrent(null);
    const next = queueRef.current.shift();
    if (next) {
      setTimeout(() => {
        showingRef.current = true;
        setCurrent(next);
      }, 200);
    }
  }, []);

  const enqueue = useCallback(
    (detail) => {
      const normalized = normalizeDetail(detail);
      const key = normalized.id || `${normalized.title}-${normalized.message}`;
      if (
        queueRef.current.some(
          (q) => (q.id || `${q.title}-${q.message}`) === key,
        ) ||
        (current &&
          (current.id || `${current.title}-${current.message}`) === key)
      ) {
        return;
      }

      if (!showingRef.current && !current) {
        showingRef.current = true;
        setCurrent(normalized);
        return;
      }
      queueRef.current.push(normalized);
    },
    [current],
  );

  useEffect(() => {
    if (!current) return undefined;
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [current, dismiss]);

  useEffect(() => {
    if (!isAuthenticated) {
      queueRef.current = [];
      showingRef.current = false;
      setCurrent(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const onNotification = (e) => {
      enqueue(e.detail || {});
    };
    const onLiveAlert = (e) => {
      enqueue(e.detail || {});
    };

    window.addEventListener("fixitnow-notification-new", onNotification);
    window.addEventListener("fixitnow-live-alert", onLiveAlert);
    return () => {
      window.removeEventListener("fixitnow-notification-new", onNotification);
      window.removeEventListener("fixitnow-live-alert", onLiveAlert);
    };
  }, [enqueue]);

  if (!isAuthenticated || !current) return null;

  const resolved = resolveCustomerLiveNotification(current, user?.type);
  const panelActions = resolved.actions.map((a) => ({
    label: a.label,
    onClick: () => {
      runCustomerLiveAction(a.event);
      dismiss();
    },
  }));

  return (
    <LiveNotificationPanel
      variant={user?.type === "worker" ? "worker" : "customer"}
      title={resolved.title}
      message={resolved.message}
      actions={panelActions}
      dismissOnly={resolved.dismissOnly}
      onDismiss={dismiss}
    />
  );
}
