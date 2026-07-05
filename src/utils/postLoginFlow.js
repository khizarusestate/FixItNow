import {
  needsCompleteProfile,
} from "./profileCompletion.js";

/**
 * After auth succeeds: close login/signup modals and open the next required step.
 * Uses switchModal so we never stack modals that get closed by a delayed handleClose.
 */
export function runPostLoginFlow({
  userData,
  userType,
  password = "",
  switchModal,
  closeModal,
}) {
  const profileUser = { ...userData, type: userType };

  closeModal?.();

  if (needsCompleteProfile(profileUser)) {
    switchModal("completeProfile");
  }
}
