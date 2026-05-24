import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import {
  getToken,
  getActiveSessionRole,
  getUserData,
  setToken,
  setUserData as saveUserData,
  logout as doLogout,
  isTokenExpired,
  removeToken,
  removeUserData,
  isTokenExpiringSoon,
  isClientSessionValid,
  applySessionPolicy,
  markCookieSession,
} from "../utils/jwt.js";
import {
  authService,
  apiRequestWithAuth,
  ensureAccessToken,
} from "../services/api.js";
import { SOCKET_URL } from "../config/env.js";
import { USE_HTTPONLY_COOKIES } from "../config/auth.js";

const LAST_SEEN_KEY = "fixitnow_last_seen";

let audioContext = null;
const initNotificationAudio = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume().catch(() => {});
  }
};

const playNotificationTone = () => {
  try {
    initNotificationAudio();
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(1000, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    oscillator.start(now);
    oscillator.stop(now + 0.18);
  } catch {
    /* ignore */
  }
};

const defaultAuthContext = {
  user: null,
  setUser: () => {},
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
  accountDeleted: false,
  deleteMessage: "",
  accountApproved: false,
  approvalMessage: "",
  accountRejected: false,
  rejectionMessage: "",
  newJobNotification: null,
  clearNewJobNotification: () => {},
  openWorkerDashboard: () => {},
  updateBadgeCount: () => {},
  badgeCount: 0,
  sessionExpiring: false,
  sessionExpired: false,
  handleSessionExpiredClose: () => {},
  handleSessionExpiringClose: () => {},
  updateJobCount: () => {},
};

const AuthContext = createContext(defaultAuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accountDeleted, setAccountDeleted] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [accountApproved, setAccountApproved] = useState(false);
  const [approvalMessage, setApprovalMessage] = useState("");
  const [accountRejected, setAccountRejected] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState("");
  const [newJobNotification, setNewJobNotification] = useState(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [adStatusMessage, setAdStatusMessage] = useState(null);
  const [sessionExpiring, setSessionExpiring] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const restoreSession = async () => {
      const activeRole = getActiveSessionRole();
      const activeUserData = activeRole ? getUserData(activeRole) : null;

      if (!activeRole || !activeUserData) {
        setIsInitializing(false);
        return;
      }

      if (activeRole !== "admin" && !isClientSessionValid(activeRole)) {
        removeToken(activeRole);
        removeUserData(activeRole);
        setIsInitializing(false);
        return;
      }

      try {
        if (activeRole !== "admin") {
          await ensureAccessToken(activeRole);
        } else {
          const t = getToken(activeRole);
          if (!t || isTokenExpired(t)) {
            removeToken(activeRole);
            removeUserData(activeRole);
            setIsInitializing(false);
            return;
          }
        }
      } catch {
        removeToken(activeRole);
        removeUserData(activeRole);
        setIsInitializing(false);
        return;
      }

      if (cancelled) return;

      const hydratedUser = getUserData(activeRole);
      setUser({ ...hydratedUser, type: activeRole });
      setIsAuthenticated(true);
      setIsInitializing(false);

      const checkSession = async () => {
        const role = getActiveSessionRole();
        if (!role || cancelled) return;

        if (role !== "admin" && !isClientSessionValid(role)) {
          handleSessionExpired();
          return;
        }

        if (USE_HTTPONLY_COOKIES) {
          try {
            await ensureAccessToken(role);
            setSessionExpiring(false);
          } catch {
            setSessionExpired(true);
            setSessionExpiring(false);
            setTimeout(() => handleSessionExpired(), 3000);
          }
          return;
        }

        const currentToken = getToken(role);
        if (!currentToken) return;

        if (
          isTokenExpired(currentToken) ||
          isTokenExpiringSoon(currentToken, 5)
        ) {
          try {
            await ensureAccessToken(role);
            setSessionExpiring(false);
          } catch {
            setSessionExpired(true);
            setSessionExpiring(false);
            setTimeout(() => handleSessionExpired(), 3000);
            return;
          }
        }

        if (isTokenExpiringSoon(getToken(role), 5)) {
          setSessionExpiring(true);
          setTimeout(() => setSessionExpiring(false), 10000);
        }
      };

      checkSession();
      intervalId = setInterval(checkSession, 60_000);
    };

    restoreSession();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const handleFirstInteraction = () => {
      initNotificationAudio();
      document.removeEventListener("click", handleFirstInteraction);
    };
    document.addEventListener("click", handleFirstInteraction);
    return () => document.removeEventListener("click", handleFirstInteraction);
  }, []);

  const handleSessionExpired = () => {
    const role = user?.type || getActiveSessionRole();
    if (role) {
      removeToken(role);
      removeUserData(role);
    }
    setUser(null);
    setIsAuthenticated(false);
    setSessionExpired(false);
    setSessionExpiring(false);

    window.dispatchEvent(new CustomEvent("fixitnow-open-login"));
  };

  // Socket.IO connection for account deletion notifications
  useEffect(() => {
    const userId = user?._id || user?.id;
    if (!isAuthenticated || !userId) return;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
      withCredentials: true,
    });

    const emitWorkerDashboardRefresh = () => {
      if (user?.type === "worker") {
        window.dispatchEvent(new CustomEvent("fixitnow-worker-dashboard-refresh"));
      }
    };

    socket.on("connect", () => {
      const token = getToken(user?.type);
      socket.emit("join-user", token ? { token, userId } : { userId });
    });

    // Listen for account deletion event from admin
    socket.on("account-deleted", (data) => {
      setDeleteMessage(
        data.message || "Your account has been deleted by the admin.",
      );
      setAccountDeleted(true);
      // Auto logout after showing message
      setTimeout(() => {
        handleDeletedLogout();
      }, 3000);
    });

    const handleAccountApproved = (data) => {
      setApprovalMessage(
        data.message || "Your worker account has been approved!",
      );
      setAccountApproved(true);
    };
    socket.on("worker-account-approved", handleAccountApproved);
    socket.on("account-approved", handleAccountApproved);

    const handleAccountRejected = (data) => {
      setRejectionMessage(
        data.message || "Your worker account application has been rejected.",
      );
      setAccountRejected(true);
      setTimeout(() => {
        handleDeletedLogout();
      }, 5000);
    };
    socket.on("worker-account-rejected", handleAccountRejected);
    socket.on("account-rejected", handleAccountRejected);

    // 🔥 Listen for new job assignment (worker only)
    socket.on("new-job", (data) => {
      setNewJobNotification(data);
      setBadgeCount((c) => Math.min(c + 1, 99));
      playNotificationTone();
      window.dispatchEvent(
        new CustomEvent("fixitnow-notification-new", { detail: data }),
      );
      setTimeout(() => setNewJobNotification(null), 30000);
    });

    socket.on("notification-new", (data) => {
      setBadgeCount((c) => Math.min(c + 1, 99));
      playNotificationTone();
      window.dispatchEvent(
        new CustomEvent("fixitnow-notification-new", { detail: data }),
      );
    });

    socket.on("profile-updated", (data) => {
      setUser((currentUser) => {
        const category =
          data.primaryServiceCategory ||
          data.serviceCategory ||
          currentUser?.primaryServiceCategory ||
          currentUser?.serviceCategory;
        const updatedUser = {
          ...currentUser,
          ...data,
          id: data.id || data._id || currentUser?.id,
          _id: data._id || data.id || currentUser?._id,
          type: currentUser?.type || data.type,
          email: data.email || data.emailAddress || currentUser?.email,
          phone: data.phone || data.phoneNumber || currentUser?.phone,
          ...(currentUser?.type === "worker" && category
            ? {
                primaryServiceCategory: category,
                serviceCategory: category,
              }
            : {}),
        };
        saveUserData(updatedUser, updatedUser.type);
        return updatedUser;
      });
    });

    socket.on("booking-status-update", (data) => {
      if (user?.type === "customer") {
        setBadgeCount((c) => Math.min(c + 1, 99));
        playNotificationTone();
      }
      window.dispatchEvent(
        new CustomEvent("fixitnow-booking-updated", { detail: data }),
      );
    });

    // Worker: job marked as done by customer
    socket.on("new-booking", emitWorkerDashboardRefresh);
    socket.on("booking-status-update", emitWorkerDashboardRefresh);
    socket.on("booking-status-changed", emitWorkerDashboardRefresh);
    socket.on("job-assigned", emitWorkerDashboardRefresh);
    socket.on("refresh", (payload) => {
      if (!payload?.type || payload.type === "bookings") {
        emitWorkerDashboardRefresh();
      }
    });

    socket.on("job-completed", (data) => {
      emitWorkerDashboardRefresh();
      // Refresh earnings and rating in local storage
      if (data.totalEarnings !== undefined) {
        setUser((currentUser) => {
          if (!currentUser || currentUser.type !== "worker") return currentUser;
          const updatedUser = {
            ...currentUser,
            totalEarnings: data.totalEarnings,
            ...(data.newRating && { rating: parseFloat(data.newRating) }),
          };
          saveUserData(updatedUser, "worker");
          return updatedUser;
        });
      }
    });

    const handleAdStatusUpdate = (data) => {
      setAdStatusMessage(
        data.message || `Your advertisement has been ${data.status}.`,
      );
      window.dispatchEvent(
        new CustomEvent("fixitnow-ad-status-update", { detail: data }),
      );
    };
    socket.on("advertisement-status-update", handleAdStatusUpdate);
    socket.on("ad-status-update", handleAdStatusUpdate);

    socket.on("app-review-status-update", (data) => {
      window.dispatchEvent(
        new CustomEvent("fixitnow-review-status-update", { detail: data }),
      );
    });

    socket.on("disconnect", () => {
      // Disconnected from server
    });

    return () => {
      socket.close();
    };
  }, [isAuthenticated, user?._id, user?.id]);

  const handleDeletedLogout = () => {
    doLogout();
    setUser(null);
    setIsAuthenticated(false);
    setAccountDeleted(false);
    setDeleteMessage("");
    setAccountApproved(false);
    setApprovalMessage("");
    setAccountRejected(false);
    setRejectionMessage("");
    // Redirect to home/signup
    window.dispatchEvent(new CustomEvent("fixitnow-open-signup"));
  };

  const handleApprovalClose = () => {
    setAccountApproved(false);
    setApprovalMessage("");
    // Refresh user data to get updated status
    window.location.reload();
  };

  const login = (userData, userType, token, rememberMe = true) => {
    const fullUser = { ...userData, type: userType };
    setToken(token, userType);
    saveUserData(fullUser, userType);
    markCookieSession(userType);
    if (userType === "customer" || userType === "worker") {
      applySessionPolicy(userType, rememberMe);
    }
    setUser(fullUser);
    setIsAuthenticated(true);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    saveUserData(updatedUser, updatedUser.type);
  };

  const logout = () => {
    const role = user?.type;
    if (role) {
      authService.logout(role);
    } else {
      removeToken();
      removeUserData();
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  // Clear new job notification
  const clearNewJobNotification = () => {
    setNewJobNotification(null);
  };

  // Handle session expiry
  const handleSessionExpiredClose = () => {
    setSessionExpired(false);
    window.dispatchEvent(new CustomEvent("fixitnow-open-login"));
  };

  const handleSessionExpiringClose = () => {
    setSessionExpiring(false);
  };

  const updateJobCount = useCallback((count) => {
    setUser((prev) => {
      if (!prev || prev.type !== "worker") return prev;
      if (prev.jobCount === count) return prev;
      const updatedUser = { ...prev, jobCount: count };
      saveUserData(updatedUser, "worker");
      return updatedUser;
    });
  }, []);

  const fetchBadgeSummary = useCallback(
    async (role) => {
      if (!role || role === "admin") return;
      const since = localStorage.getItem(`${LAST_SEEN_KEY}_${role}`);
      try {
        const res = await apiRequestWithAuth(
          `/notifications/badge-summary${since ? `?since=${encodeURIComponent(since)}` : ""}`,
        );
        const count = res?.data?.jobs ?? 0;
        setBadgeCount(count);
        if (role === "worker") updateJobCount(count);
      } catch {
        setBadgeCount(0);
      }
    },
    [updateJobCount],
  );

  useEffect(() => {
    if (!isAuthenticated || !user?.type) return;
    fetchBadgeSummary(user.type);
  }, [isAuthenticated, user?.type, fetchBadgeSummary]);

  const markUpdatesSeen = useCallback(() => {
    if (!user?.type) return;
    localStorage.setItem(
      `${LAST_SEEN_KEY}_${user.type}`,
      new Date().toISOString(),
    );
    setBadgeCount(0);
    if (user.type === "worker") updateJobCount(0);
  }, [user?.type, updateJobCount]);

  const openWorkerDashboard = useCallback(() => {
    setNewJobNotification(null);
    markUpdatesSeen();
    window.dispatchEvent(new CustomEvent("open-worker-dashboard"));
  }, [markUpdatesSeen]);

  if (isInitializing) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-900">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 text-center shadow-xl">
          <div className="mb-4 text-orange-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="mx-auto h-12 w-12"
            >
              <path
                fill="currentColor"
                d="M12 2a1 1 0 0 1 1 1v2.07a7 7 0 0 1 4.95 4.95H21a1 1 0 1 1 0 2h-2.05a7 7 0 0 1-4.95 4.95V21a1 1 0 1 1-2 0v-2.05a7 7 0 0 1-4.95-4.95H3a1 1 0 1 1 0-2h2.05A7 7 0 0 1 9 5.07V3a1 1 0 0 1 1-1Zm0 5a5 5 0 1 0 0 10A5 5 0 0 0 12 7Z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Loading session…</h2>
          <p className="mt-2 text-sm text-slate-500">
            Resolving authentication state before rendering the app.
          </p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        login,
        logout,
        updateUser,
        accountDeleted,
        deleteMessage,
        accountApproved,
        approvalMessage,
        accountRejected,
        rejectionMessage,
        newJobNotification,
        clearNewJobNotification,
        openWorkerDashboard,
        badgeCount,
  markUpdatesSeen,
  markCookieSession,
  sessionExpiring,
        sessionExpired,
        handleSessionExpiredClose,
        handleSessionExpiringClose,
        updateJobCount,
      }}
    >
      {children}
      {/* Account Deleted Modal */}
      {accountDeleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-fadeIn">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Account Deleted
            </h2>
            <p className="mb-6 text-slate-600">{deleteMessage}</p>
            <p className="text-sm text-slate-500">
              Redirecting to signup page...
            </p>
          </div>
        </div>
      )}
      {/* Account Approved Modal */}
      {accountApproved && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-fadeIn">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Account Approved!
            </h2>
            <p className="mb-6 text-slate-600">{approvalMessage}</p>
            <button
              onClick={handleApprovalClose}
              className="w-full rounded-lg bg-green-500 px-4 py-2.5 font-semibold text-white hover:bg-green-600 transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Advertisement status toast */}
      {adStatusMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 max-w-md -translate-x-1/2 animate-fadeIn">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
            <p className="text-sm text-slate-700">{adStatusMessage}</p>
            <button
              type="button"
              onClick={() => setAdStatusMessage(null)}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* New Job Assignment Notification (Worker Only) */}
      {newJobNotification && user?.type === "worker" && (
        <div className="fixed top-20 right-4 z-50 max-w-sm animate-slideInRight">
          <div className="bg-orange-500 text-white rounded-xl shadow-2xl p-4 border-l-4 border-orange-600">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">New Job Assigned!</h3>
                <p className="text-sm text-white/90 mb-2">
                  {newJobNotification.message}
                </p>
                <p className="text-xs text-white/70">
                  {newJobNotification.booking?.serviceTitle} -{" "}
                  {newJobNotification.booking?.customerName}
                </p>
                <button
                  type="button"
                  onClick={openWorkerDashboard}
                  className="mt-2 text-xs bg-white text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded font-semibold transition-colors"
                >
                  Open Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Rejected Modal */}
      {accountRejected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-fadeIn">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Application Rejected
            </h2>
            <p className="mb-6 text-slate-600">{rejectionMessage}</p>
            <p className="text-sm text-slate-500">
              Redirecting to signup page...
            </p>
          </div>
        </div>
      )}

      {/* Session Expiring Warning */}
      {sessionExpiring && (
        <div className="fixed top-4 right-4 z-50 max-w-sm animate-slideInRight">
          <div className="bg-amber-500 text-white rounded-xl shadow-2xl p-4 border-l-4 border-amber-600">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-white mb-1">
                  Session Expiring Soon
                </h4>
                <p className="text-sm text-white/90">
                  Your session will expire in less than 5 minutes. Please save
                  your work and login again.
                </p>
                <button
                  onClick={handleSessionExpiringClose}
                  className="mt-2 text-xs bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-white transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Session Expired Modal */}
      {sessionExpired && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl animate-fadeIn">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-900">
              Session Expired
            </h2>
            <p className="mb-6 text-slate-600">
              Your session has expired due to inactivity. Please login again to
              continue.
            </p>
            <button
              onClick={handleSessionExpiredClose}
              className="w-full rounded-lg bg-orange-500 px-4 py-2.5 font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              Login Again
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
