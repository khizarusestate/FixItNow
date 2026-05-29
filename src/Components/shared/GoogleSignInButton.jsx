import { GoogleLogin } from "@react-oauth/google";
import { authService } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { useModal } from "../../context/ModalContext.jsx";
import { needsCompleteProfile } from "../../utils/profileCompletion.js";

export default function GoogleSignInButton({
  role = "customer",
  onSuccess,
  onError,
  disabled = false,
  className = "",
}) {
  const { login } = useAuth();
  const { openModal } = useModal();

  const handleSuccess = async (credentialResponse) => {
    const credential = credentialResponse?.credential;
    if (!credential) {
      onError?.("Google sign-in was cancelled.");
      return;
    }
    try {
      const response =
        role === "worker"
          ? await authService.loginWithGoogleWorker(credential, true)
          : await authService.loginWithGoogle(credential, true);

      const authToken = response.token || response.accessToken;
      const userData =
        role === "worker"
          ? response.worker || response.data
          : response.customer || response.data;

      if (!authToken || !userData) {
        throw new Error("Google sign-in failed. Please try again.");
      }

      const userType = role === "worker" ? "worker" : "customer";
      login(userData, userType, authToken, true);
      onSuccess?.(userData);

      const profileUser = { ...userData, type: userType };
      if (needsCompleteProfile(profileUser)) {
        setTimeout(() => openModal("completeProfile"), 500);
      }
    } catch (err) {
      onError?.(err.message || "Google sign-in failed.");
    }
  };

  return (
    <div
      className={`flex justify-center ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => onError?.("Google sign-in failed. Please try again.")}
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
        width="320"
      />
    </div>
  );
}
