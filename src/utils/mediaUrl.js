import { API_ORIGIN } from "../config/env.js";

export function getApiOriginForAssets() {
  return API_ORIGIN;
}

/** Resolve stored upload paths to a fetchable URL (backend serves /uploads, not /api/uploads). */
export function resolveUploadMediaUrl(url) {
  if (!url || typeof url !== "string") return "";
  const u = url.trim();
  if (
    u.startsWith("http://") ||
    u.startsWith("https://") ||
    u.startsWith("data:")
  ) {
    return u;
  }
  let normalized = u.replace(/\\/g, "/");
  const lower = normalized.toLowerCase();
  const idx = lower.indexOf("/uploads/");
  if (idx >= 0) {
    normalized = normalized.slice(idx);
  } else if (lower.startsWith("uploads/")) {
    normalized = `/${normalized}`;
  }
  if (!normalized.startsWith("/uploads/")) {
    return u;
  }
  const origin = getApiOriginForAssets();
  if (origin) {
    return `${origin}${normalized}`;
  }
  return normalized;
}
