/** Shown when the signed-in user has not filled a profile field yet. */
export const OWN_PROFILE_MISSING_HINT = "Add this in Edit Profile";

/** Shown when viewing someone else's empty field. */
export const OTHER_PROFILE_MISSING_HINT = "Not provided yet";

/**
 * @param {string|null|undefined} value
 * @param {{ ownProfile?: boolean }} options
 */
export function profileFieldText(value, { ownProfile = false } = {}) {
  const trimmed = String(value ?? "").trim();
  if (trimmed) return trimmed;
  return ownProfile ? OWN_PROFILE_MISSING_HINT : OTHER_PROFILE_MISSING_HINT;
}

export function profileLocationText(user, { ownProfile = false } = {}) {
  const loc =
    user?.location || user?.address || user?.serviceArea || "";
  return profileFieldText(loc, { ownProfile });
}

export function jobLocationText(job) {
  const loc = job?.location || job?.address || "";
  const trimmed = String(loc).trim();
  return trimmed || "Location not specified";
}
