// JWT Utility Functions for Frontend
import {
  USE_HTTPONLY_COOKIES,
  SESSION_ROLE_KEY,
} from "../config/auth.js";

// Role-specific token storage keys
const TOKEN_KEYS = {
  customer: "fixitnow_customer_token",
  worker: "fixitnow_worker_token",
  admin: "fixitnow_admin_token",
};

const REFRESH_TOKEN_KEYS = {
  customer: "fixitnow_customer_refresh_token",
  worker: "fixitnow_worker_refresh_token",
  admin: "fixitnow_admin_refresh_token",
};

const USER_DATA_KEYS = {
  customer: "fixitnow_customer_data",
  worker: "fixitnow_worker_data",
  admin: "fixitnow_admin_data",
};

const SESSION_EXPIRY_KEYS = {
  customer: "fixitnow_customer_session_expiry",
  worker: "fixitnow_worker_session_expiry",
  admin: "fixitnow_admin_session_expiry",
};

const REMEMBER_ME_KEYS = {
  customer: "fixitnow_customer_remember_me",
  worker: "fixitnow_worker_remember_me",
};

/** Client session cap when "Remember me" is checked at login (3 days). */
export const SESSION_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export const markCookieSession = (role) => {
  if (!USE_HTTPONLY_COOKIES || !role) return;
  localStorage.setItem(SESSION_ROLE_KEY, role);
};

export const clearCookieSession = () => {
  localStorage.removeItem(SESSION_ROLE_KEY);
};

export const getCookieSessionRole = () =>
  localStorage.getItem(SESSION_ROLE_KEY);

export const setSessionExpiry = (expiresAt, role) => {
  if (!role) {
    console.warn("setSessionExpiry requires a role parameter");
    return;
  }
  localStorage.setItem(
    SESSION_EXPIRY_KEYS[role],
    new Date(expiresAt).toISOString(),
  );
};

export const getSessionExpiry = (role) => {
  if (!role) return null;
  const value = localStorage.getItem(SESSION_EXPIRY_KEYS[role]);
  return value ? new Date(value) : null;
};

export const removeSessionExpiry = (role) => {
  if (role) {
    localStorage.removeItem(SESSION_EXPIRY_KEYS[role]);
  } else {
    Object.values(SESSION_EXPIRY_KEYS).forEach((key) =>
      localStorage.removeItem(key),
    );
  }
};

export const isSessionExpired = (role) => {
  const expiry = getSessionExpiry(role);
  return expiry ? expiry.getTime() <= Date.now() : false;
};

export const setRememberMe = (role, remember) => {
  if (!role || role === "admin") return;
  localStorage.setItem(REMEMBER_ME_KEYS[role], remember ? "1" : "0");
};

export const getRememberMe = (role) => {
  if (!role || role === "admin") return false;
  return localStorage.getItem(REMEMBER_ME_KEYS[role]) === "1";
};

/**
 * Client session validity.
 * - Remember me checked: expires after 3 days (or when user clears data / logs out).
 * - Remember me unchecked: no time limit until logout or browser data cleared.
 */
export const isClientSessionValid = (role) => {
  if (!role || role === "admin") return true;
  if (!getUserData(role)) return false;

  if (USE_HTTPONLY_COOKIES) {
    if (getCookieSessionRole() !== role) return false;
  } else if (!getToken(role) && !getRefreshToken(role)) {
    return false;
  }

  if (!getRememberMe(role)) return true;

  const expiry = getSessionExpiry(role);
  if (!expiry) return true;
  return expiry.getTime() > Date.now();
};

export const applySessionPolicy = (role, rememberMe) => {
  if (!role || role === "admin") return;
  setRememberMe(role, rememberMe);
  if (rememberMe) {
    setSessionExpiry(Date.now() + SESSION_DURATION_MS, role);
  } else {
    removeSessionExpiry(role);
  }
};

export const getToken = (role) => {
  if (role) {
    return localStorage.getItem(TOKEN_KEYS[role]);
  }
  // Customer app: never pick admin token for API calls
  return (
    localStorage.getItem(TOKEN_KEYS.worker) ||
    localStorage.getItem(TOKEN_KEYS.customer)
  );
};

export const setToken = (token, role) => {
  if (!role) {
    console.warn("setToken requires a role parameter");
    return;
  }
  localStorage.setItem(TOKEN_KEYS[role], token);
};

export const removeToken = (role) => {
  if (role) {
    localStorage.removeItem(TOKEN_KEYS[role]);
    localStorage.removeItem(REFRESH_TOKEN_KEYS[role]);
    removeSessionExpiry(role);
    if (role !== "admin") {
      localStorage.removeItem(REMEMBER_ME_KEYS[role]);
    }
    if (getCookieSessionRole() === role) clearCookieSession();
  } else {
    clearCookieSession();
    // Remove all tokens for logout
    Object.values(TOKEN_KEYS).forEach((key) => localStorage.removeItem(key));
    Object.values(REFRESH_TOKEN_KEYS).forEach((key) =>
      localStorage.removeItem(key),
    );
    removeSessionExpiry();
  }
};

export const getUserData = (role) => {
  if (role) {
    const userData = localStorage.getItem(USER_DATA_KEYS[role]);
    return userData ? JSON.parse(userData) : null;
  }
  // Backward compatibility: prefer admin data, then worker, then customer
  const adminData = localStorage.getItem(USER_DATA_KEYS.admin);
  const workerData = localStorage.getItem(USER_DATA_KEYS.worker);
  const customerData = localStorage.getItem(USER_DATA_KEYS.customer);
  return adminData
    ? JSON.parse(adminData)
    : workerData
      ? JSON.parse(workerData)
      : customerData
        ? JSON.parse(customerData)
        : null;
};

export const setUserData = (userData, role) => {
  if (!role) {
    console.warn("setUserData requires a role parameter");
    return;
  }
  localStorage.setItem(USER_DATA_KEYS[role], JSON.stringify(userData));
};

export const removeUserData = (role) => {
  if (role) {
    localStorage.removeItem(USER_DATA_KEYS[role]);
  } else {
    // Remove all user data for logout
    Object.values(USER_DATA_KEYS).forEach((key) =>
      localStorage.removeItem(key),
    );
  }
};

// Helper functions for backward compatibility
export const getCustomerToken = () => getToken("customer");
export const getWorkerToken = () => getToken("worker");
export const setCustomerToken = (token) => setToken(token, "customer");
export const setWorkerToken = (token) => setToken(token, "worker");
export const getCustomerData = () => getUserData("customer");
export const getWorkerData = () => getUserData("worker");
export const setCustomerData = (data) => setUserData(data, "customer");
export const setWorkerData = (data) => setUserData(data, "worker");

export const isAuthenticated = () => {
  const token = getToken();
  const userData = getUserData();
  const role = getActiveSessionRole();
  return !!(token && userData && role);
};

/**
 * Same session priority as AuthContext (admin → worker → customer),
 * resolved synchronously from storage. Use to avoid firing customer-only
 * API bursts before React state has hydrated (e.g. worker on home page).
 */
const roleHasRestorableSession = (role) => {
  const data = getUserData(role);
  if (!data) return false;

  if (USE_HTTPONLY_COOKIES) {
    if (getCookieSessionRole() !== role) return false;
    return isClientSessionValid(role);
  }

  const token = getToken(role);
  if (!token) return false;

  if (role === "admin") {
    return !isTokenExpired(token) && !isSessionExpired("admin");
  }

  if (!isClientSessionValid(role)) return false;

  if (!isTokenExpired(token)) return true;
  return !!getRefreshToken(role);
};

export const getActiveSessionRole = () => {
  const lastRole = getCookieSessionRole();
  if (
    lastRole &&
    (lastRole === "customer" || lastRole === "worker") &&
    roleHasRestorableSession(lastRole)
  ) {
    return lastRole;
  }
  if (roleHasRestorableSession("worker")) return "worker";
  if (roleHasRestorableSession("customer")) return "customer";
  return null;
};

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    const expiryTime = payload.exp;

    // Return true if expired
    return expiryTime < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiryTime = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? new Date(payload.exp * 1000) : null;
  } catch (error) {
    return null;
  }
};

export const getTokenRemainingTime = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
    const expiryTime = payload.exp;
    const remainingTime = expiryTime - currentTime;

    return remainingTime > 0 ? remainingTime : 0;
  } catch (error) {
    return 0;
  }
};

export const isTokenExpiringSoon = (token, minutes = 5) => {
  try {
    const remainingTime = getTokenRemainingTime(token);
    const secondsThreshold = minutes * 60;
    return remainingTime > 0 && remainingTime < secondsThreshold;
  } catch (error) {
    return true;
  }
};

export const getRefreshToken = (role) => {
  if (role) {
    return localStorage.getItem(REFRESH_TOKEN_KEYS[role]);
  }
  return (
    localStorage.getItem(REFRESH_TOKEN_KEYS.worker) ||
    localStorage.getItem(REFRESH_TOKEN_KEYS.customer)
  );
};

export const setRefreshToken = (token, role) => {
  if (!role) {
    console.warn("setRefreshToken requires a role parameter");
    return;
  }
  localStorage.setItem(REFRESH_TOKEN_KEYS[role], token);
};

export const logout = (role) => {
  removeToken(role);
  removeUserData(role);
  if (role) {
    removeSessionExpiry(role);
  }
  window.location.href = "/";
};

export const getAuthHeaders = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const decodeToken = (token) => {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (error) {
    return null;
  }
};

export const getTokenCreationDate = () => {
  const token = getToken();
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded?.iat) return null;
  // iat is in seconds, convert to milliseconds
  return new Date(decoded.iat * 1000).toISOString();
};
