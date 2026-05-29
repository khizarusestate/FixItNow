/** Google OAuth client ID (Web) — VITE_GOOGLE_CLIENT_ID at build time, or runtime via OAuthConfigProvider. */
export const GOOGLE_CLIENT_ID =
  String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

export const isGoogleSignInEnabled = () => Boolean(GOOGLE_CLIENT_ID);
