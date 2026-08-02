import { geoFromUser, hasLocation } from "./location.js";

export function getMissingProfileFields(user) {
  if (!user) return [];

  if (user.type === "customer") {
    const missing = [];
    if (!String(user.phone || "").trim()) missing.push("phone");
    if (!hasLocation(user) && !geoFromUser(user).location?.trim()) {
      missing.push("location");
    }
    return missing;
  }

  if (user.type === "worker") {
    const missing = [];
    if (!String(user.phoneNumber || user.phone || "").trim()) {
      missing.push("phone");
    }
    if (!hasLocation(user) && !geoFromUser(user).location?.trim()) {
      missing.push("location");
    }
    return missing;
  }

  return [];
}

export function needsCompleteProfile(user) {
  return getMissingProfileFields(user).length > 0;
}
