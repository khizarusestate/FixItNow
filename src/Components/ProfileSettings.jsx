import { useEffect, useState } from "react";
import {
  LogOut,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { apiRequestWithAuth } from "../lib/api";
import {
  isPushSupported,
  setDevicePushEnabled,
  cacheDevicePushPreference,
} from "../utils/pushNotifications.js";

export default function ProfileSettings({
  userData,
  onLogout,
  onPreferenceChange,
}) {
  const userId = userData?._id || userData?.id;
  const [devicePushEnabled, setDevicePushEnabledState] = useState(
    userData?.devicePushEnabled !== false,
  );
  const [pushBusy, setPushBusy] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setDevicePushEnabledState(userData?.devicePushEnabled !== false);
  }, [userData?.devicePushEnabled, userId]);

  const handlePushToggle = async () => {
    const next = !devicePushEnabled;
    setPushBusy(true);
    setError("");

    try {
      if (next) {
        const result = await setDevicePushEnabled(true);
        if (!result.ok) {
          if (result.reason === "denied") {
            setError("Notifications blocked in browser settings.");
          } else if (result.reason === "disabled") {
            setError("Push is not configured on the server yet.");
          } else {
            setError("Could not enable notifications.");
          }
          setPushBusy(false);
          return;
        }
      } else {
        await setDevicePushEnabled(false);
      }

      setDevicePushEnabledState(next);
      cacheDevicePushPreference(userId, next);
      onPreferenceChange?.({ devicePushEnabled: next });
    } catch (err) {
      setError(err.message || "Could not update notification setting.");
    } finally {
      setPushBusy(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError("");

    try {
      const endpoint =
        userData?.type === "worker"
          ? "/auth/worker/delete-account"
          : "/auth/customer/delete-account";

      await apiRequestWithAuth(endpoint, {
        method: "DELETE",
        role: userData?.type === "worker" ? "worker" : "customer",
      });
      setMessage("Account deleted successfully.");
      setTimeout(() => onLogout(), 2000);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setDeleteLoading(false);
    }
  };

  const pushSupported = isPushSupported();

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-900">Notifications</p>
          <button
            type="button"
            role="switch"
            aria-checked={devicePushEnabled}
            aria-label="Notifications"
            disabled={pushBusy || !pushSupported}
            onClick={handlePushToggle}
            className={`relative inline-flex h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 ${
              devicePushEnabled ? "bg-orange-500" : "bg-slate-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
                devicePushEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h4 className="text-sm font-semibold text-slate-900">Account</h4>
        </div>
        <div className="p-4 space-y-3">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
          >
            <Trash2 size={18} />
            Delete Account
          </button>
        </div>
      </section>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
          <AlertTriangle size={16} />
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-blue-900/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Account?
              </h3>
              <p className="text-slate-600 mb-6 text-sm">
                This cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
