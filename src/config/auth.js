/** HttpOnly cookie auth (tokens not readable by JS — mitigates XSS token theft). */
export const USE_HTTPONLY_COOKIES =
  import.meta.env.VITE_USE_HTTPONLY_COOKIES !== "false";

export const SESSION_ROLE_KEY = "fixitnow_session_role";
