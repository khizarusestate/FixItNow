import { useState } from "react";
import { Bell, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import {
  dismissPushPrompt,
  getPushPermissionState,
  registerWebPush,
  saveDevicePushPreference,
  shouldShowPushPrompt,
  cacheDevicePushPreference,
} from "../../utils/pushNotifications.js";

export default function PushNotificationPrompt() {
  const { isAuthenticated, user, updateUser } = useAuth();
  const userId = user?._id || user?.id;
  const devicePushEnabled = user?.devicePushEnabled !== false;
  const [visible, setVisible] = useState(() =>
    shouldShowPushPrompt(userId, devicePushEnabled),
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (
    !visible ||
    !isAuthenticated ||
    !devicePushEnabled ||
    (user?.type !== "customer" && user?.type !== "worker")
  ) {
    return null;
  }

  const handleEnable = async () => {
    setBusy(true);
    setMessage("");
    try {
      const result = await registerWebPush();
      if (result.ok) {
        await saveDevicePushPreference(true).catch(() => {});
        cacheDevicePushPreference(userId, true);
        updateUser({ devicePushEnabled: true });
        setVisible(false);
        return;
      }
      if (result.reason === "disabled") {
        setMessage("Push is not configured on the server yet.");
      } else if (result.reason === "denied") {
        setMessage("Notifications blocked. Enable them in browser site settings.");
        dismissPushPrompt();
      } else {
        setMessage("Permission was not granted.");
      }
    } catch {
      setMessage("Could not enable notifications. Try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleDismiss = () => {
    dismissPushPrompt();
    setVisible(false);
  };

  const permission = getPushPermissionState();
  if (permission === "granted") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[65] mx-auto max-w-md animate-slideUp sm:left-auto sm:right-6">
      <div className="rounded-2xl border border-orange-200 bg-white p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100">
            <Bell className="text-orange-600" size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-900 text-sm">
              Enable device notifications?
            </p>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Get alerts when the app is closed — bookings, messages, and updates
              like WhatsApp.
            </p>
            {message && (
              <p className="mt-2 text-xs font-medium text-amber-700">{message}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleEnable}
                disabled={busy}
                className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-600 disabled:opacity-60"
              >
                {busy ? "Enabling…" : "Allow notifications"}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Not now
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
