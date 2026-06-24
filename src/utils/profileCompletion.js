import { geoFromUser, hasLocation } from "./location.js";

export function workerNeedsProfessionalSignup(user) {
  if (!user || user.type !== "worker") return false;
  if (user.needsProfessionalProfile === true) return true;
  if (user.signupStep && user.signupStep !== "complete") return true;
  return false;
}

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
    if (workerNeedsProfessionalSignup(user)) {
      return ["professional_signup"];
    }
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
