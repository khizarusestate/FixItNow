/** Google OAuth client ID (Web) — set VITE_GOOGLE_CLIENT_ID at build time. */
export const GOOGLE_CLIENT_ID =
  String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();

export const isGoogleSignInEnabled = () => Boolean(GOOGLE_CLIENT_ID);
