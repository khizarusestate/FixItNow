import { useState, useEffect } from "react";
import { X, Upload, Shield, Loader2, MapPin, Phone } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService } from "../services/api.js";
import ServiceSelection from "./ServiceSelection.jsx";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useI18n } from "../context/I18nContext.jsx";
import LocationPicker from "./LocationPicker";
import { loadFormDraft, saveFormDraft, clearFormDraft } from "../utils/formDraft.js";

const PROFESSIONAL_DRAFT_KEY = "fixitnow:worker-professional-draft";

function isOAuthProfessionalPayload(payload = {}) {
  if (payload.signupMethod === "oauth") return true;
  if (payload.authProvider === "google") return true;
  if (payload.isOAuth === true) return true;
  return false;
}

export default function WorkerProfessionalSignup() {
  const { t } = useI18n();
  const { activeModal, modalPayload, closeModal, switchModal } = useModal();
  const email = String(modalPayload?.email || "").trim().toLowerCase();
  const password = modalPayload?.password || "";
  const needsPhone = isOAuthProfessionalPayload(modalPayload);

  const [form, setForm] = useState(() => {
    const draft = loadFormDraft(PROFESSIONAL_DRAFT_KEY, {});
    if (draft.email !== email) {
      return {
        cnicNumber: "",
        phoneNumber: "",
        selectedServices: [],
      };
    }
    return {
      cnicNumber: draft.cnicNumber || "",
      phoneNumber: draft.phoneNumber || "",
      selectedServices: draft.selectedServices || [],
    };
  });
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const [geo, setGeo] = useState(() => {
    const draft = loadFormDraft(PROFESSIONAL_DRAFT_KEY, {});
    if (draft.email !== email) {
      return { location: "", latitude: null, longitude: null, placeId: "" };
    }
    return {
      location: draft.location || "",
      latitude: draft.latitude ?? null,
      longitude: draft.longitude ?? null,
      placeId: draft.placeId || "",
    };
  });

  useEffect(() => {
    if (activeModal !== "workerProfessional" || !email) return;
    saveFormDraft(PROFESSIONAL_DRAFT_KEY, {
      email,
      ...form,
      ...geo,
    });
  }, [activeModal, email, form, geo]);

  if (activeModal !== "workerProfessional") return null;

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage("");
    setIsError(false);
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage(t("worker.photoInvalid"));
      setIsError(true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage(t("worker.photoSize"));
      setIsError(true);
      return;
    }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setVerificationPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setMessage("");
    setIsError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage(t("worker.emailRequired"));
      setIsError(true);
      return;
    }

    if (needsPhone) {
      if (!form.phoneNumber?.trim()) {
        setMessage(t("signup.fillAll"));
        setIsError(true);
        return;
      }
      if (!isPhoneValid(form.phoneNumber)) {
        setMessage(t("signup.invalidPhone"));
        setIsError(true);
        return;
      }
    }

    const cnicClean = String(form.cnicNumber).replace(/-/g, "");
    if (!/^\d{13}$/.test(cnicClean)) {
      setMessage(t("worker.cnicInvalid"));
      setIsError(true);
      return;
    }
    if (!form.selectedServices?.length) {
      setMessage(t("worker.tradeRequired"));
      setIsError(true);
      return;
    }
    if (!verificationPhoto) {
      setMessage(t("worker.photoRequired"));
      setIsError(true);
      return;
    }

    if (!geo.location?.trim()) {
      setMessage("Please select your location on the map.");
      setIsError(true);
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("emailAddress", email);
      if (needsPhone && form.phoneNumber?.trim()) {
        body.append("phoneNumber", form.phoneNumber.trim());
      }
      if (password) body.append("password", password);
      body.append("cnicNumber", cnicClean);
      body.append("services", JSON.stringify(form.selectedServices));
      const primary = form.selectedServices[0];
      if (primary?.serviceId) body.append("primaryServiceId", primary.serviceId);
      body.append("verificationPhoto", verificationPhoto);
      body.append("location", geo.location.trim());
      if (geo.latitude != null) body.append("latitude", geo.latitude);
      if (geo.longitude != null) body.append("longitude", geo.longitude);
      if (geo.placeId) body.append("placeId", geo.placeId);

      const res = await authService.registerWorkerProfessional(body);
      if (res.success) {
        clearFormDraft(PROFESSIONAL_DRAFT_KEY);
        setDone(true);
        setMessage(res.message || t("worker.submitApproval"));
        setIsError(false);
      }
    } catch (err) {
      setMessage(err.message || t("worker.profFailed"));
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        onClick={closeModal}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-label={t("common.close")}
      />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="text-orange-500" size={22} />
            <h2 className="text-lg font-bold text-slate-900">{t("worker.profTitle")}</h2>
          </div>
          <button onClick={closeModal} className="rounded-lg p-1 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          {done ? (
            <div className="text-center py-4">
              <p className="text-sm text-emerald-700 font-medium mb-4">{message}</p>
              <button
                type="button"
                onClick={() => switchModal("login", { email })}
                className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white"
              >
                {t("worker.goLogin")}
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-600 mb-4">{t("worker.profSubtitle")}</p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t("worker.trade")} *
                  </label>
                  <ServiceSelection
                    selectedServices={form.selectedServices}
                    onChange={(selectedServices) =>
                      setForm((f) => ({ ...f, selectedServices }))
                    }
                  />
                </div>

                <input
                  type="text"
                  placeholder={`${t("worker.cnicPlaceholder")} *`}
                  value={form.cnicNumber}
                  onChange={(e) => update("cnicNumber", e.target.value)}
                  required
                  className={inputCls}
                />

                {needsPhone && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      <Phone size={13} className="inline mr-1" />
                      {t("signup.phone")} *
                    </label>
                    <PhoneInput
                      value={form.phoneNumber}
                      onChange={(v) => update("phoneNumber", v)}
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <MapPin size={13} /> Your Location *
                    </span>
                  </label>
                  <LocationPicker
                    value={geo}
                    onChange={setGeo}
                    placeholder="Search your city or area..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t("worker.passportPhoto")} *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhoto}
                    className="sr-only"
                    id="worker-verify-photo"
                  />
                  <label
                    htmlFor="worker-verify-photo"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-medium text-orange-800 hover:bg-orange-100"
                  >
                    <Upload size={16} />
                    {verificationPhoto ? t("worker.changePhoto") : t("worker.uploadPhoto")}
                  </label>
                  {photoPreview && (
                    <img
                      src={photoPreview}
                      alt=""
                      className="mt-3 h-28 w-28 rounded-lg border object-cover"
                    />
                  )}
                </div>

                {message && (
                  <p
                    className={`text-sm ${isError ? "text-red-600" : "text-emerald-700"}`}
                  >
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t("worker.submitting")}
                    </>
                  ) : (
                    t("worker.submitApproval")
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
