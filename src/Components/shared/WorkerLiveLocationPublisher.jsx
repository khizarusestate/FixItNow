import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import { apiRequestWithAuth } from "../../services/api.js";
import { getToken } from "../../utils/jwt.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ACTIVE_STATUSES = new Set(["assigned", "worker-assigned", "on-the-way", "in-progress"]);
const TRACKING_STATUSES = new Set(["on-the-way", "in-progress"]);
const JOB_REFRESH_MS = 15000;
const MIN_SEND_INTERVAL_MS = 2500;

function pickTrackingJob(jobs) {
  const active = jobs.filter((job) => ACTIVE_STATUSES.has(job?.status) && job?.id);
  if (!active.length) return null;

  // A worker can have multiple assigned jobs, but only one physical GPS
  // position should ever be published for tracking at a time. Prefer the job
  // that is actually being travelled to, then an in-progress job, then an
  // assigned job as a fallback (the first location update will move it on-the-way).
  return (
    active.find((job) => job.status === "on-the-way") ||
    active.find((job) => job.status === "in-progress") ||
    active.find((job) => job.status === "worker-assigned") ||
    active.find((job) => job.status === "assigned") ||
    null
  );
}

export default function WorkerLiveLocationPublisher() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const trackingJobRef = useRef(null);
  const lastSentRef = useRef(0);
  const lastPositionRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const workerSession = Boolean(isAuthenticated && user?.type === "worker");

  useEffect(() => {
    if (!workerSession || !navigator.geolocation) return undefined;

    let cancelled = false;
    const token = getToken("worker");
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
    socketRef.current = socket;

    const syncJobs = async () => {
      try {
        const response = await apiRequestWithAuth("/worker-jobs/my-jobs", { role: "worker" });
        if (cancelled) return;
        trackingJobRef.current = pickTrackingJob(response?.data || []);

        if (!trackingJobRef.current && watchIdRef.current != null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      } catch {
        // Keep the last known tracking job during a transient API failure.
      }
    };

    const emitLatestPosition = () => {
      const job = trackingJobRef.current;
      const position = lastPositionRef.current;
      if (!job?.id || !position || !socket.connected) return;

      socket.emit("worker-location-update", {
        bookingId: String(job.id),
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        heading: position.heading,
        speed: position.speed,
      });
      lastSentRef.current = Date.now();
    };

    const startWatching = () => {
      if (watchIdRef.current != null) return;
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const job = trackingJobRef.current;
          if (!job?.id) return;

          const { latitude, longitude, accuracy, heading, speed } = position.coords;
          const nextPosition = {
            latitude,
            longitude,
            accuracy: Number.isFinite(accuracy) ? accuracy : null,
            heading: Number.isFinite(heading) ? heading : null,
            speed: Number.isFinite(speed) ? speed : null,
          };
          lastPositionRef.current = nextPosition;

          if (!socket.connected) return;
          const now = Date.now();
          if (now - lastSentRef.current < MIN_SEND_INTERVAL_MS) return;

          socket.emit("worker-location-update", {
            bookingId: String(job.id),
            ...nextPosition,
          });
          lastSentRef.current = now;
        },
        () => {
          // watchPosition remains active and will continue receiving GPS fixes
          // when the browser can obtain them again.
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
      );
    };

    const syncAndWatch = async () => {
      await syncJobs();
      if (trackingJobRef.current) startWatching();
    };

    const onConnect = async () => {
      socket.emit("join-user", { token });
      await syncAndWatch();
      emitLatestPosition();
    };

    socket.on("connect", onConnect);

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        syncAndWatch();
        if (!socket.connected) socket.connect();
        else emitLatestPosition();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    refreshTimerRef.current = window.setInterval(syncAndWatch, JOB_REFRESH_MS);
    syncAndWatch();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) window.clearInterval(refreshTimerRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      socket.off("connect", onConnect);
      socket.disconnect();
      socketRef.current = null;
      trackingJobRef.current = null;
      lastPositionRef.current = null;
      lastSentRef.current = 0;
    };
  }, [workerSession]);

  return null;
}
