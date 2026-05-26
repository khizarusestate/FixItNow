import { apiRequest, apiRequestWithAuth } from "../services/api.js";

const DISMISS_KEY = "fixitnow_push_prompt_dismissed";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) {
    output[i] = raw.charCodeAt(i);
  }
  return output;
}

async function getVapidPublicKey() {
  const res = await apiRequest("/push/vapid-public-key", { skipAuth: true });
  return res?.data?.publicKey || res?.publicKey || "";
}

export function isPushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getPushPermissionState() {
  if (!isPushSupported()) return "unsupported";
  return Notification.permission;
}

export function shouldShowPushPrompt() {
  if (!isPushSupported()) return false;
  if (localStorage.getItem(DISMISS_KEY) === "1") return false;
  return Notification.permission === "default";
}

export function dismissPushPrompt() {
  localStorage.setItem(DISMISS_KEY, "1");
}

/**
 * Must be called from a user gesture (button click) so the browser shows the permission dialog.
 */
export async function registerWebPush() {
  if (!isPushSupported()) {
    return { ok: false, reason: "unsupported" };
  }

  const publicKey = await getVapidPublicKey();
  if (!publicKey) {
    return { ok: false, reason: "disabled" };
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return { ok: false, reason: permission === "denied" ? "denied" : "dismissed" };
  }

  const registration = await navigator.serviceWorker.register("/sw.js", {
    scope: "/",
  });
  await navigator.serviceWorker.ready;

  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
  }

  await apiRequestWithAuth("/push/subscribe", {
    method: "POST",
    body: JSON.stringify({ subscription: subscription.toJSON() }),
  });

  localStorage.removeItem(DISMISS_KEY);
  return { ok: true };
}

export async function unregisterWebPush() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.getRegistration("/");
    const subscription = await registration?.pushManager?.getSubscription();
    if (subscription) {
      await apiRequestWithAuth("/push/subscribe", {
        method: "DELETE",
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      }).catch(() => {});
      await subscription.unsubscribe();
    }
  } catch {
    /* best effort */
  }
}
