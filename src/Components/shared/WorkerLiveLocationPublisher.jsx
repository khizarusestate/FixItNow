import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../../config/env.js";
import { apiRequestWithAuth } from "../../services/api.js";
import { getToken } from "../../utils/jwt.js";
import { useAuth } from "../../context/AuthContext.jsx";

const ACTIVE_STATUSES = new Set(["assigned", "worker-assigned", "in-progress"]);
const JOB_REFRESH_MS = 15000;

export default function WorkerLiveLocationPublisher() {
  const { user, isAuthenticated } = useAuth();
  const socketRef = useRef(null);
  const watchIdRef = useRef(null);
  const jobsRef = useRef([]);
  const lastSentRef = useRef(0);
  const refreshTimerRef = useRef(null);
  const workerSession = Boolean(isAuthenticated && user?.type === "worker");

  useEffect(() => {
    if (!workerSession) return undefined;

    let cancelled = false;
    const token = getToken("worker");
    if (!token) return undefined;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      autoConnect: true,
    });
    socketRef.current = socket;

    const syncJobs = async () => {
      try {
        const response = await apiRequestWithAuth("/worker-jobs/my-jobs", { role: "worker" });
        if (cancelled) return;
        jobsRef.current = (response?.data || []).filter((job) => ACTIVE_STATUSES.has(job.status));
      } catch {
        // Tracking should never break the dashboard if the refresh fails.
      }
    };

    const startWatching = () => {
      if (watchIdRef.current != null || !navigator.geolocation) return;
      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const jobs = jobsRef.current;
          if (!jobs.length) return;

          const now = Date.now();
          if (now - lastSentRef.current < 2500) return;
          lastSentRef.current = now;

          const { latitude, longitude, accuracy, heading, speed } = position.coords;
          for (const job of jobs) {
            if (!job?.id) continue;
            socket.emit("worker-location-update", {
              bookingId: String(job.id),
              latitude,
              longitude,
              accuracy,
              heading: Number.isFinite(heading) ? heading : null,
              speed: Number.isFinite(speed) ? speed : null,
            });
          }
        },
        () => {
          // Browser permission/GPS errors are intentionally non-fatal.
        },
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
      );
    };

    const syncAndWatch = async () => {
      await syncJobs();
      if (jobsRef.current.length) startWatching();
      else if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };

    socket.on("connect", () => {
      socket.emit("join-user", { token });
      syncAndWatch();
    });

    refreshTimerRef.current = window.setInterval(syncAndWatch, JOB_REFRESH_MS);
    syncAndWatch();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) window.clearInterval(refreshTimerRef.current);
      if (watchIdRef.current != null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      socket.disconnect();
      socketRef.current = null;
      jobsRef.current = [];
    };
  }, [workerSession]);

  return null;
}
