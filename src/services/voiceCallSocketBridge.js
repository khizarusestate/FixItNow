import { io } from "socket.io-client";
import { SOCKET_URL } from "../config/env.js";
import { getActiveSessionRole, getToken } from "../utils/jwt.js";
import { ensureAccessToken } from "./api.js";

let socket = null;
let cleanupHandlers = null;

function dispatch(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

export function startVoiceCallSocketBridge(user) {
  stopVoiceCallSocketBridge();

  const userId = user?._id || user?.id;
  const role = user?.type || getActiveSessionRole();
  if (!userId || !role || !["customer", "worker"].includes(role)) return () => {};

  socket = io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    autoConnect: true,
    withCredentials: true,
  });

  const join = async () => {
    try {
      await ensureAccessToken(role);
    } catch {
      // The normal auth/session layer will handle an expired session.
    }
    const token = getToken(role);
    if (token) socket?.emit("join-user", { token, userId });
  };

  const onConnect = () => {
    void join();
  };

  const onIncoming = (data) => {
    dispatch("fixitnow-voice-call-incoming", data);
  };

  const onSignal = (data) => {
    dispatch("fixitnow-voice-call-signal", data);
  };

  const onEnded = (data) => {
    dispatch("fixitnow-voice-call-ended", data);
  };

  const onError = (data) => {
    dispatch("fixitnow-voice-call-error", data);
  };

  const onStartSend = (event) => {
    const detail = event.detail || {};
    if (!detail.bookingId || !detail.targetUserId || !detail.callId) return;
    socket?.emit("voice-call-start", detail);
  };

  const onSignalSend = (event) => {
    const detail = event.detail || {};
    if (!detail.bookingId || !detail.targetUserId || !detail.callId || !detail.signal) return;
    socket?.emit("voice-call-signal", detail);
  };

  const onEndSend = (event) => {
    const detail = event.detail || {};
    if (!detail.bookingId || !detail.targetUserId || !detail.callId) return;
    socket?.emit("voice-call-end", detail);
  };

  socket.on("connect", onConnect);
  socket.on("voice-call-incoming", onIncoming);
  socket.on("voice-call-signal", onSignal);
  socket.on("voice-call-ended", onEnded);
  socket.on("voice-call-error", onError);

  window.addEventListener("fixitnow-voice-call-start-send", onStartSend);
  window.addEventListener("fixitnow-voice-call-signal-send", onSignalSend);
  window.addEventListener("fixitnow-voice-call-end-send", onEndSend);

  cleanupHandlers = () => {
    window.removeEventListener("fixitnow-voice-call-start-send", onStartSend);
    window.removeEventListener("fixitnow-voice-call-signal-send", onSignalSend);
    window.removeEventListener("fixitnow-voice-call-end-send", onEndSend);
    socket?.off("connect", onConnect);
    socket?.off("voice-call-incoming", onIncoming);
    socket?.off("voice-call-signal", onSignal);
    socket?.off("voice-call-ended", onEnded);
    socket?.off("voice-call-error", onError);
    socket?.disconnect();
    socket = null;
    cleanupHandlers = null;
  };

  return cleanupHandlers;
}

export function stopVoiceCallSocketBridge() {
  cleanupHandlers?.();
}
