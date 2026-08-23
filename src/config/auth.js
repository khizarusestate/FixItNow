/**
 * Authentication transport policy.
 *
 * FixItNow customer/worker/admin frontends are deployed as separate SPA
 * origins from the API. Keep the client contract deterministic: use the
 * access token in Authorization and the refresh token in the refresh request.
 * The backend may still set HttpOnly cookies as an additional mechanism, but
 * the SPA must not switch transport modes after a refresh or page reload.
 */
export const USE_HTTPONLY_COOKIES = false;

export const SESSION_ROLE_KEY = "fixitnow_session_role";
