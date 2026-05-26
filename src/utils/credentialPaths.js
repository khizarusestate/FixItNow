/** Paths where 401 means bad credentials, not an expired session. */
const CREDENTIAL_PATHS = new Set([
  "/auth/customer/login",
  "/auth/worker/login",
  "/auth/customer/register",
  "/auth/worker/register",
  "/auth/password/forgot",
  "/auth/password/reset",
]);

export function isCredentialPath(path) {
  if (!path) return false;
  const normalized = path.split("?")[0];
  return CREDENTIAL_PATHS.has(normalized);
}
