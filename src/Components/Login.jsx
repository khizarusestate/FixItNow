import { useState, useEffect } from "react";
import { X, LogIn, User, Briefcase, Eye, EyeOff } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/api.js";
import { isApiClientError } from "../utils/apiError.js";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "../utils/formDraft.js";
import GoogleSignInButton from "./shared/GoogleSignInButton.jsx";
import { useOAuthConfig } from "../context/OAuthConfigContext.jsx";

const LOGIN_DRAFT_KEY = "fixitnow_draft_login";
const initialForm = { email: "", password: "" };

export default function Login({ onLoginSuccess }) {
  const { isGoogleSignInEnabled } = useOAuthConfig();
  const { activeModal, closeModal, switchModal, openModal, modalPayload } =
    useModal();
  const savedDraft = loadFormDraft(LOGIN_DRAFT_KEY, {});

  useEffect(() => {
    if (activeModal !== "login") return;
    if (modalPayload?.email) {
      setForm((f) => ({
        ...f,
        email: String(modalPayload.email).trim().toLowerCase(),
      }));
    }
    if (modalPayload?.loginType === "worker" || modalPayload?.loginType === "customer") {
      setLoginType(modalPayload.loginType);
    }
  }, [activeModal, modalPayload?.email, modalPayload?.loginType]);

  const { login } = useAuth();
  const [form, setForm] = useState({
    email: savedDraft.email ?? "",
    password: savedDraft.password ?? "",
  });
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loginType, setLoginType] = useState(savedDraft.loginType ?? "customer");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(savedDraft.rememberMe ?? true);

  useEffect(() => {
    if (activeModal !== "login") return;
    saveFormDraft(LOGIN_DRAFT_KEY, {
      email: form.email,
      password: form.password,
      loginType,
      rememberMe,
    });
  }, [activeModal, form.email, form.password, loginType, rememberMe]);

  if (activeModal !== "login") return null;

  const handleClose = () => {
    saveFormDraft(LOGIN_DRAFT_KEY, {
      email: form.email,
      password: form.password,
      loginType,
      rememberMe,
    });
    closeModal();
  };

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setMessage("Please enter both email and password.");
      setIsError(true);
      return;
    }
    setSubmitting(true);
    setMessage("");
    try {
      let response;
      let userData;

      if (loginType === "worker") {
        response = await authService.loginWorker(
          form.email,
          form.password,
          rememberMe,
        );
      } else {
        response = await authService.loginCustomer(
          form.email,
          form.password,
          rememberMe,
        );
      }

      if (!response?.success) {
        setMessage(
          response?.message || "Login failed. Please check your credentials.",
        );
        setIsError(true);
        return;
      }

      const authToken = response.token || response.accessToken;
      if (loginType === "worker") {
        userData = response.worker || {
          fullName: form.email.split("@")[0],
          emailAddress: form.email,
          phoneNumber: "",
          serviceArea: "",
        };
        login(userData, "worker", authToken, rememberMe, response.refreshToken);
        window.dispatchEvent(new CustomEvent("fixitnow-show-worker-guide"));
      } else {
        userData = response.customer || {
          fullName: form.email.split("@")[0],
          email: form.email,
          phone: "",
          location: "",
        };
        login(userData, "customer", authToken, rememberMe, response.refreshToken);
      }

      setMessage("Login successful!");
      setIsError(false);
      if (onLoginSuccess) onLoginSuccess(userData);
      setTimeout(() => {
        clearFormDraft(LOGIN_DRAFT_KEY);
        handleClose();
        setForm(initialForm);
        setMessage("");
        // Show complete profile modal if user hasn't completed profile
        const needsLocation = !(
          userData?.location ||
          userData?.address ||
          userData?.serviceArea
        )?.trim();
        if (!userData.profilePicture || needsLocation) {
          setTimeout(() => openModal("completeProfile"), 500);
        }
      }, 800);
    } catch (err) {
      if (isApiClientError(err) && err.code === "EMAIL_NOT_VERIFIED") {
        const email =
          err.details?.email || form.email.trim().toLowerCase();
        setMessage(err.message);
        setIsError(true);
        setTimeout(() => {
          closeModal();
          switchModal("verifyEmail", { email });
        }, 1200);
        return;
      }
      setMessage(err.message || "Login failed. Please check your credentials.");
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label="Close"
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className={`mt-1 text-2xl font-bold ${loginType === "worker" ? "text-blue-900" : "text-orange-500"}`}>
              Welcome back
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-3">
          {/* Login Type Toggle */}
          <div className="flex rounded-lg border border-slate-200 p-1 mb-4">
            <button
              type="button"
              onClick={() => setLoginType("customer")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                loginType === "customer"
                  ? "bg-orange-500 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <User size={14} />
              Customer
            </button>
            <button
              type="button"
              onClick={() => setLoginType("worker")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                loginType === "worker"
                  ? "bg-blue-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Briefcase size={14} />
              Worker
            </button>
          </div>

          <input
            type="email"
            placeholder={
              loginType === "worker" ? "Worker Email address" : "Email address"
            }
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            required
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <label
              className="inline-flex items-center gap-2"
              title="Stay signed in for 3 days on this device"
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
              />
              Remember me
            </label>
            <button
              type="button"
              onClick={() => switchModal("forgotPassword")}
              className="font-medium text-orange-500 hover:text-orange-600"
            >
              Forgot password?
            </button>
          </div>

          {message && (
            <p
              className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              loginType === "worker"
                ? "bg-blue-900 hover:bg-blue-800"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            <LogIn size={15} />
            <span className="truncate">
              {submitting
                ? "Signing in..."
                : `Sign In as ${loginType === "worker" ? "Worker" : "Customer"}`}
            </span>
          </button>

          {isGoogleSignInEnabled && (
            <>
              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <p className="relative mx-auto w-fit bg-white px-3 text-xs text-slate-400">
                  or
                </p>
              </div>
              <GoogleSignInButton
                role={loginType === "worker" ? "worker" : "customer"}
                disabled={submitting}
                onSuccess={(userData) => {
                  setMessage("Login successful!");
                  setIsError(false);
                  if (onLoginSuccess) onLoginSuccess(userData);
                  setTimeout(() => {
                    clearFormDraft(LOGIN_DRAFT_KEY);
                    handleClose();
                    setForm(initialForm);
                    setMessage("");
                  }, 800);
                }}
                onError={(msg) => {
                  setMessage(msg);
                  setIsError(true);
                }}
              />
            </>
          )}

          <div className="text-center space-y-2">
            <p className="text-sm text-slate-500">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() =>
                  switchModal(loginType === "worker" ? "worker" : "signup")
                }
                className="font-medium text-orange-500 hover:text-orange-600 underline"
              >
                {loginType === "worker" ? "Join as Worker" : "Join Fix It Now"}
              </button>
            </p>
            {loginType === "worker" && (
              <p className="text-xs text-slate-400">
                Admin approval is required before you can log in as a worker.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
