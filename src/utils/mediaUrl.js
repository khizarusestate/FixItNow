import { API_ORIGIN } from "../config/env.js";

const CDN_BASE = String(import.meta.env.VITE_CDN_BASE_URL || "").replace(/\/$/, "");

export function getApiOriginForAssets() {
  return CDN_BASE || API_ORIGIN;
}

/** Optional CDN transform params (Cloudinary-style path or query). */
export function optimizeMediaUrl(url, { width, quality = 80 } = {}) {
  const resolved = resolveUploadMediaUrl(url);
  if (!resolved || !CDN_BASE) return resolved;
  if (resolved.includes("cloudinary.com") && width) {
    return resolved.replace("/upload/", `/upload/w_${width},q_${quality},f_auto/`);
  }
  return resolved;
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
