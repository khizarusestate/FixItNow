import {
  getToken,
  isTokenExpired,
  logout,
  removeToken,
  removeUserData,
  isTokenExpiringSoon,
  getRefreshToken,
  setRefreshToken,
  setToken,
  getUserData,
  setUserData,
  isClientSessionValid,
  applySessionPolicy,
  getActiveSessionRole,
  markCookieSession,
  clearCookieSession,
} from "../utils/jwt.js";
import { createApiClientError } from "../utils/apiError.js";
import { API_BASE_URL } from "../config/env.js";
import { USE_HTTPONLY_COOKIES } from "../config/auth.js";

const ROLES = ["customer", "worker", "admin"];

function clearOtherRoleSessions(activeRole) {
  for (const r of ROLES) {
    if (r !== activeRole) {
      removeToken(r);
      removeUserData(r);
    }
  }
}
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 2;
const RETRY_DELAY_BASE = 1000; // 1 second

// Track ongoing refresh to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers = [];

// Helper to add timeout to fetch
async function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      credentials: "include",
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Request timed out. Please check your connection.");
    }
    throw error;
  }
}

// Add subscriber to wait for token refresh
function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

// Notify all subscribers that token is refreshed
function onTokenRefreshed(newToken, newRefreshToken, role) {
  refreshSubscribers.forEach((callback) =>
    callback(newToken, newRefreshToken, role),
  );
  refreshSubscribers = [];
}

function failTokenRefresh() {
  const waiting = refreshSubscribers;
  refreshSubscribers = [];
  waiting.forEach((callback) => callback(null, null, null));
}

/** Refresh access token if expired but client session is still valid. */
export async function ensureAccessToken(role) {
  if (!role) {
    throw new Error("Authentication required. Please login.");
  }

  if (!isClientSessionValid(role)) {
    removeToken(role);
    removeUserData(role);
    clearCookieSession();
    throw new Error("Your session has ended. Please login again.");
  }

  if (USE_HTTPONLY_COOKIES) {
    return null;
  }

  const token = getToken(role);
  if (token && !isTokenExpired(token)) {
    return token;
  }

  const refreshToken = getRefreshToken(role);
  if (!refreshToken) {
    removeToken(role);
    removeUserData(role);
    throw new Error("Authentication required. Please login.");
  }

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      subscribeTokenRefresh((newToken, _newRefresh, refreshedRole) => {
        if (!newToken || refreshedRole !== role) {
          reject(new Error("Session expired. Please login again."));
          return;
        }
        resolve(newToken);
      });
    });
  }

  isRefreshing = true;
  try {
    const { accessToken } = await refreshAccessToken(role);
    onTokenRefreshed(accessToken, getRefreshToken(role), role);
    return accessToken;
  } catch (err) {
    failTokenRefresh();
    removeToken(role);
    removeUserData(role);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// Refresh access token using refresh token
async function refreshAccessToken(role) {
  const refreshToken = getRefreshToken(role);
  if (!USE_HTTPONLY_COOKIES && !refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(refreshToken ? { refreshToken } : {}),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Token refresh failed");
  }

  if (!USE_HTTPONLY_COOKIES) {
    setToken(data.accessToken || data.token, role);
    if (data.refreshToken) {
      setRefreshToken(data.refreshToken, role);
    }
  }

  return {
    accessToken: data.accessToken || data.token,
    refreshToken: data.refreshToken,
  };
}

export async function apiRequest(
  path,
  options = {},
  retryCount = 0,
  isRetry = false,
) {
  const role = getActiveSessionRole();
  let token = role ? getToken(role) : null;

  // Don't set Content-Type for FormData - let browser set it with boundary
  const isFormData = options.body instanceof FormData;
  const headers = isFormData
    ? { ...(options.headers || {}) }
    : {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      };

  if (role && USE_HTTPONLY_COOKIES) {
    if (!isClientSessionValid(role)) {
      removeToken(role);
      removeUserData(role);
      clearCookieSession();
      throw new Error("Your session has ended. Please login again.");
    }
  } else if (token && role) {
    if (!isClientSessionValid(role)) {
      removeToken(role);
      removeUserData(role);
      throw new Error("Your session has ended. Please login again.");
    }

    if (isTokenExpired(token)) {
      const refreshToken = getRefreshToken(role);
      if (refreshToken) {
        try {
          await ensureAccessToken(role);
          token = getToken(role);
        } catch (err) {
          throw err;
        }
      } else {
        removeToken(role);
        removeUserData(role);
        throw new Error("Your session has expired. Please login again.");
      }
    }

    headers["Authorization"] = `Bearer ${token}`;
  } else if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && !isRetry) {
      const errorMessage =
        data.message || "Session expired. Please login again.";

      const refreshToken = getRefreshToken(role);
      const canRefresh = refreshToken || (USE_HTTPONLY_COOKIES && role);
      if (canRefresh && !isRefreshing) {
        isRefreshing = true;
        try {
          const { accessToken, refreshToken: newRefreshToken } =
            await refreshAccessToken(role);
          onTokenRefreshed(accessToken, newRefreshToken, role);
          isRefreshing = false;

          // Retry the original request with new token
          return apiRequest(path, options, retryCount, true);
        } catch (refreshError) {
          isRefreshing = false;
          failTokenRefresh();
          console.error("Token refresh failed:", refreshError);

          // Clear token and user data
          removeToken(role);
          removeUserData(role);

          // Show user-friendly message
          if (data.code === "TOKEN_EXPIRED") {
            throw new Error(
              "Your session has expired due to inactivity. Please login again.",
            );
          } else if (data.code === "INVALID_TOKEN") {
            throw new Error("Invalid authentication. Please login again.");
          } else {
            throw new Error(errorMessage);
          }
        }
      } else if (canRefresh && isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken, newRefreshToken, refreshedRole) => {
            if (!refreshedRole || refreshedRole !== role) {
              reject(new Error("Session expired. Please login again."));
              return;
            }
            resolve(apiRequest(path, options, retryCount, true));
          });
        });
      } else {
        // No refresh token available, logout
        removeToken(role);
        removeUserData(role);

        if (data.code === "TOKEN_EXPIRED") {
          throw new Error(
            "Your session has expired due to inactivity. Please login again.",
          );
        } else if (data.code === "INVALID_TOKEN") {
          throw new Error("Invalid authentication. Please login again.");
        } else {
          throw new Error(errorMessage);
        }
      }
    }

    // Retry on 5xx server errors
    if (response.status >= 500 && retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      await new Promise((r) => setTimeout(r, delay));
      return apiRequest(path, options, retryCount + 1, isRetry);
    }

    if (!response.ok || data.success === false) {
      throw createApiClientError(data, response.status);
    }

    return data;
  } catch (error) {
    // Retry on network errors (Failed to fetch / timeout)
    if (
      (error.message === "Failed to fetch" ||
        error.message.includes("timed out")) &&
      retryCount < MAX_RETRIES
    ) {
      const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
      await new Promise((r) => setTimeout(r, delay));
      return apiRequest(path, options, retryCount + 1, isRetry);
    }

    if (error.message === "Failed to fetch") {
      throw createApiClientError(
        {
          code: "NETWORK_ERROR",
          message: "Network error. Please check your internet connection.",
        },
        0,
      );
    }
    throw error;
  }
}

export async function apiRequestWithAuth(path, options = {}) {
  const role = getActiveSessionRole();
  if (!role) {
    throw new Error("Authentication required. Please login.");
  }
  await ensureAccessToken(role);
  return apiRequest(path, options);
}

// Auth endpoints
export const authService = {
  loginCustomer: (email, password, remember = true) =>
    apiRequest("/auth/customer/login", {
      method: "POST",
      body: JSON.stringify({ email, password, rememberMe: remember }),
    }).then((data) => {
      const token = data.accessToken || data.token;
      if (data.success) {
        const refreshToken = data.refreshToken;
        const userData = data.customer;

        clearOtherRoleSessions("customer");
        setToken(token, "customer");
        if (refreshToken) {
          setRefreshToken(refreshToken, "customer");
        }
        setUserData(userData, "customer");
        applySessionPolicy("customer", remember);
        markCookieSession("customer");
      }
      return { ...data, token };
    }),

  loginWorker: (email, password, remember = true) =>
    apiRequest("/auth/worker/login", {
      method: "POST",
      body: JSON.stringify({
        emailAddress: email,
        password,
        rememberMe: remember,
      }),
    }).then((data) => {
      const token = data.accessToken || data.token;
      if (data.success) {
        const refreshToken = data.refreshToken;
        const userData = data.worker;

        clearOtherRoleSessions("worker");
        setToken(token, "worker");
        if (refreshToken) {
          setRefreshToken(refreshToken, "worker");
        }
        setUserData(userData, "worker");
        applySessionPolicy("worker", remember);
        markCookieSession("worker");
      }
      return { ...data, token };
    }),

  loginAdmin: (email, pin) =>
    apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, pin }),
    }).then((data) => {
      const token = data.accessToken || data.token;
      if (data.success) {
        const refreshToken = data.refreshToken;
        const userData = data.admin;

        setToken(token, "admin");
        if (refreshToken) {
          setRefreshToken(refreshToken, "admin");
        }
        setUserData(userData, "admin");
      }
      return { ...data, token };
    }),

  registerCustomer: (data) =>
    apiRequest("/auth/customer/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  registerWorker: (data) =>
    apiRequest("/auth/worker/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  verifyEmail: (email, code) =>
    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  resendVerification: (email) =>
    apiRequest("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  requestPasswordReset: (email) =>
    apiRequest("/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email, code, password) =>
    apiRequest("/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ email, code, password }),
    }),

  logout: (role) => {
    const refreshToken = getRefreshToken(role);
    const userId = getUserData(role)?.id;

    // Call backend logout endpoint to revoke tokens
    fetch(`${API_BASE_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken, userId, userRole: role }),
    }).catch((err) => console.error("Logout API call failed:", err));

    clearCookieSession();
    logout(role);
  },
};

// Booking endpoints
export const bookingService = {
  createBooking: (data) => {
    const role = getActiveSessionRole();
    const request = role === "customer" ? apiRequestWithAuth : apiRequest;
    const opts = {
      method: "POST",
      body: data,
      headers: data instanceof FormData ? {} : { "Content-Type": "application/json" },
    };
    if (!(data instanceof FormData)) {
      opts.body = JSON.stringify(data);
    }
    return request("/bookings", opts);
  },

  getMyBookings: () => apiRequestWithAuth("/bookings/my"),

  cancelBooking: (id) =>
    apiRequestWithAuth(`/bookings/${id}`, {
      method: "DELETE",
    }),
};

// Services endpoints
export const servicesService = {
  getAll: () => apiRequest("/public/services"),
  getCategories: () => apiRequest("/public/services/categories"),
  getByCategory: (category) =>
    apiRequest(`/public/services?category=${category}`),
};

// Advertisement endpoints
export const advertisementService = {
  getMyAds: () => apiRequestWithAuth("/advertisements/my"),
  getActiveAds: () => apiRequest("/advertisements/active"),
  submit: (formData) => {
    const role = getActiveSessionRole();
    const request = role === "customer" || role === "worker" ? apiRequestWithAuth : apiRequest;
    return request("/advertisements", {
      method: "POST",
      body: formData,
      headers: {},
    });
  },
};

// App review endpoints
export const appReviewService = {
  getMy: () => apiRequestWithAuth("/app-reviews/my"),
  getActive: () => apiRequest("/app-reviews/active"),
  submit: (payload) =>
    apiRequestWithAuth("/app-reviews", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};
