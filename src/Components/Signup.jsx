import { useState, useEffect } from "react";
import {
  X,
  Eye,
  EyeOff,
  CheckCircle,
  ArrowRight,
  User,
  Briefcase,
} from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService, servicesService } from "../services/api.js";
import SearchableSelect from "./SearchableSelect.jsx";
import {
  buildServicePickerOptions,
  findServiceOption,
} from "../utils/servicePicker.js";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "../utils/formDraft.js";
import GoogleSignInButton from "./shared/GoogleSignInButton.jsx";
import { useOAuthConfig } from "../context/OAuthConfigContext.jsx";
import TermsAgreement from "./shared/TermsAgreement.jsx";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useI18n } from "../context/I18nContext.jsx";

const SIGNUP_DRAFT_KEY = "fixitnow_draft_signup";
const initialCustomer = { name: "", email: "", phone: "", password: "" };
const initialWorker = {
  fullName: "",
  emailAddress: "",
  phoneNumber: "",
  password: "",
};
export default function Signup() {
  const { t } = useI18n();
  const { isGoogleSignInEnabled } = useOAuthConfig();
  const { activeModal, closeModal, switchModal } = useModal();
  const savedDraft = loadFormDraft(SIGNUP_DRAFT_KEY, {});
  const [signupType, setSignupType] = useState(savedDraft.signupType ?? "customer");
  const [customerForm, setCustomerForm] = useState({
    ...initialCustomer,
    ...savedDraft.customerForm,
  });
  const [workerForm, setWorkerForm] = useState(() => {
    const draft = { ...initialWorker, ...savedDraft.workerForm };
    if (!draft.fullName && (draft.firstName || draft.lastName)) {
      draft.fullName = [draft.firstName, draft.lastName].filter(Boolean).join(" ");
    }
    return draft;
  });
  const [showPw, setShowPw] = useState(false);
  const [showWorkerPw, setShowWorkerPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(savedDraft.termsAgreed ?? false);
  const [tradeOptions, setTradeOptions] = useState([]);

  useEffect(() => {
    if (activeModal !== "signup") return;
    saveFormDraft(SIGNUP_DRAFT_KEY, {
      signupType,
      customerForm,
      workerForm,
      termsAgreed,
    });
  }, [activeModal, signupType, customerForm, workerForm, termsAgreed]);

  const updateCustomer = (k, v) => setCustomerForm((f) => ({ ...f, [k]: v }));
  const updateWorker = (k, v) => setWorkerForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (activeModal === "signup") {
      const loadServices = async () => {
        try {
          const response = await servicesService.getAll();
          const services = response?.data?.services || [];
          setTradeOptions(buildServicePickerOptions(services));
        } catch {
          setTradeOptions([]);
        }
      };
      loadServices();
    }
  }, [activeModal]);

  if (activeModal !== "signup") return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!termsAgreed) {
      setMessage(t("signup.termsRequired"));
      setIsError(true);
      return;
    }
    setSubmitting(true);

    try {
      if (signupType === "customer") {
        if (
          !customerForm.name ||
          !customerForm.email ||
          !customerForm.phone ||
          !customerForm.password
        ) {
          setMessage(t("signup.fillAll"));
          setIsError(true);
          setSubmitting(false);
          return;
        }
        if (!isPhoneValid(customerForm.phone)) {
          setMessage(t("signup.invalidPhone"));
          setIsError(true);
          setSubmitting(false);
          return;
        }

        const response = await authService.registerCustomer({
          fullName: customerForm.name,
          email: customerForm.email,
          phone: customerForm.phone,
          password: customerForm.password,
        });

        if (response.success) {
          clearFormDraft(SIGNUP_DRAFT_KEY);
          closeModal();
          switchModal("verifyEmail", {
            email: customerForm.email.trim().toLowerCase(),
          });
        }
      } else {
        if (
          !workerForm.fullName?.trim() ||
          !workerForm.emailAddress ||
          !workerForm.phoneNumber?.trim() ||
          !workerForm.password
        ) {
          setMessage(t("signup.workerRequired"));
          setIsError(true);
          setSubmitting(false);
          return;
        }
        if (!isPhoneValid(workerForm.phoneNumber)) {
          setMessage(t("signup.invalidPhone"));
          setIsError(true);
          setSubmitting(false);
          return;
        }

        const response = await authService.registerWorker({
          fullName: workerForm.fullName.trim(),
          emailAddress: workerForm.emailAddress,
          phoneNumber: workerForm.phoneNumber.trim(),
          password: workerForm.password,
        });

        if (response.success) {
          clearFormDraft(SIGNUP_DRAFT_KEY);
          closeModal();
          switchModal("verifyEmail", {
            email: workerForm.emailAddress.trim().toLowerCase(),
            role: "worker",
            password: workerForm.password,
          });
        }
      }
    } catch (err) {
      setMessage(err.message || t("signup.failed"));
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    saveFormDraft(SIGNUP_DRAFT_KEY, {
      signupType,
      customerForm,
      workerForm,
    });
    closeModal();
    setDone(false);
    setMessage("");
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <h2 className={`mt-1 text-2xl font-bold ${signupType === "worker" ? "text-blue-900" : "text-orange-500"}`}>
              {t("signup.title")}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6">
          {done ? (
            <div className="text-center py-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("signup.successTitle")}
              </h3>
              <p className="text-sm text-slate-600 mb-5">
                {t("signup.successBody")}
              </p>
              <button
                onClick={() => switchModal("login")}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                {t("signup.loginNow")} <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <>
              {/* Signup Type Toggle */}
              <div className="flex rounded-lg border border-slate-200 p-1 mb-4">
                <button
                  type="button"
                  data-signup-type="customer"
                  onClick={() => setSignupType("customer")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    signupType === "customer"
                      ? "bg-orange-500 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <User size={14} />
                  {t("signup.customer")}
                </button>
                <button
                  type="button"
                  data-signup-type="worker"
                  onClick={() => setSignupType("worker")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    signupType === "worker"
                      ? "bg-blue-900 text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <Briefcase size={14} />
                  {t("signup.worker")}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {signupType === "customer" ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder={t("signup.fullName")}
                        value={customerForm.name}
                        onChange={(e) => updateCustomer("name", e.target.value)}
                        required
                        className={inputCls}
                      />
                      <input
                        type="email"
                        placeholder={t("signup.email")}
                        value={customerForm.email}
                        onChange={(e) =>
                          updateCustomer("email", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          placeholder={t("signup.password")}
                          value={customerForm.password}
                          onChange={(e) =>
                            updateCustomer("password", e.target.value)
                          }
                          required
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                        >
                          {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      <PhoneInput
                        value={customerForm.phone}
                        onChange={(v) => updateCustomer("phone", v)}
                        placeholder={t("signup.phone")}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        placeholder={t("signup.fullName")}
                        value={workerForm.fullName}
                        onChange={(e) =>
                          updateWorker("fullName", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                      <input
                        type="email"
                        placeholder={t("signup.email")}
                        value={workerForm.emailAddress}
                        onChange={(e) =>
                          updateWorker("emailAddress", e.target.value)
                        }
                        required
                        className={inputCls}
                      />
                      <div className="relative">
                        <input
                          type={showWorkerPw ? "text" : "password"}
                          placeholder={t("signup.passwordMin")}
                          value={workerForm.password}
                          onChange={(e) =>
                            updateWorker("password", e.target.value)
                          }
                          required
                          minLength={6}
                          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWorkerPw(!showWorkerPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          aria-label={
                            showWorkerPw ? t("login.hidePassword") : t("login.showPassword")
                          }
                        >
                          {showWorkerPw ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                      <PhoneInput
                        value={workerForm.phoneNumber}
                        onChange={(v) => updateWorker("phoneNumber", v)}
                        placeholder={t("signup.phone")}
                        required
                      />
                    </div>
                  </>
                )}

                {message && (
                  <p
                    className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
                  >
                    {message}
                  </p>
                )}

                <TermsAgreement
                  checked={termsAgreed}
                  onChange={(v) => {
                    setTermsAgreed(v);
                    setMessage("");
                  }}
                  prefix="By signing up, you agree to the"
                />

                {isGoogleSignInEnabled && (
                  <>
                    <GoogleSignInButton
                      role={signupType === "worker" ? "worker" : "customer"}
                      disabled={submitting || !termsAgreed}
                      onSuccess={(userData) => {
                        clearFormDraft(SIGNUP_DRAFT_KEY);
                        if (
                          signupType === "worker" &&
                          (userData?.needsProfessionalProfile ||
                            userData?.signupStep !== "complete")
                        ) {
                          closeModal();
                          switchModal("workerProfessional", {
                            email: userData?.emailAddress || userData?.email,
                          });
                        } else {
                          setDone(true);
                          setMessage("");
                          setIsError(false);
                        }
                      }}
                      onError={(msg) => {
                        setMessage(msg);
                        setIsError(true);
                      }}
                    />
                    <div className="relative py-1">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200" />
                      </div>
                      <p className="relative mx-auto w-fit bg-white px-3 text-xs text-slate-400">
                        {t("signup.orEmail")}
                      </p>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={submitting || !termsAgreed}
                  className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                    signupType === "worker"
                      ? "bg-blue-900 hover:bg-blue-800"
                      : "bg-orange-500 hover:bg-orange-600"
                  }`}
                >
                  <span className="truncate">
                    {submitting
                      ? t("signup.creating")
                      : signupType === "worker"
                        ? t("signup.createWorker")
                        : t("signup.createCustomer")}
                  </span>
                  <ArrowRight size={15} />
                </button>
                <p className="text-center text-sm text-slate-500">
                  {t("signup.haveAccount")}{" "}
                  <button
                    type="button"
                    onClick={() => switchModal("login")}
                    className="font-medium text-orange-500 hover:text-orange-600 underline"
                  >
                    {t("signup.signIn")}
                  </button>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
