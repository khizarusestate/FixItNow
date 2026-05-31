/**
 * Centralized client env — all VITE_* reads go through here.
 * Production builds use Railway API when VITE_API_BASE_URL is unset.
 */

export const PRODUCTION_API_BASE_URL =
  "https://fixitnow-backand-production.up.railway.app/api";

export const PRODUCTION_SOCKET_URL =
  "https://fixitnow-backand-production.up.railway.app";

const DEV_API_BASE_URL = "http://localhost:5000/api";

const rawApiBase =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : DEV_API_BASE_URL);

/** REST base including /api suffix, e.g. /api or https://api.example.com/api */
export const API_BASE_URL = rawApiBase.replace(/\/$/, "");

/** API host without /api — used for uploads and optional direct socket */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

/**
 * Socket.IO server URL.
 * - VITE_SOCKET_URL if set
 * - same origin when API_BASE_URL is relative (/api)
 * - otherwise API host (production Railway when built for prod)
 */
export const SOCKET_URL = (() => {
  const explicit = import.meta.env.VITE_SOCKET_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  if (!API_ORIGIN || API_BASE_URL.startsWith("/")) return "";
  return API_ORIGIN;
})();

export const IS_PROD = import.meta.env.PROD;
export const IS_DEV = import.meta.env.DEV;
