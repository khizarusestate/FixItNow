import { useState, useEffect } from "react";
import { X, Upload, Shield, Loader2, MapPin } from "lucide-react";
import { useModal } from "../context/ModalContext";
import { authService, servicesService } from "../services/api.js";
import SearchableSelect from "./SearchableSelect.jsx";
import { buildServicePickerOptions } from "../utils/servicePicker.js";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useI18n } from "../context/I18nContext.jsx";
import LocationPicker from "./LocationPicker";
import { geoFromUser } from "../utils/location.js";

export default function WorkerProfessionalSignup() {
  const { t } = useI18n();
  const { activeModal, modalPayload, closeModal, switchModal } = useModal();
  const email = String(modalPayload?.email || "").trim().toLowerCase();
  const password = modalPayload?.password || "";

  const [form, setForm] = useState({
    cnicNumber: "",
    primaryServiceId: "",
    primaryServiceName: "",
    primaryServiceCategory: "",
    phoneNumber: "",
  });
  const [verificationPhoto, setVerificationPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [tradeOptions, setTradeOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);
  const [geo, setGeo] = useState({ location: "", latitude: null, longitude: null, placeId: "" });

  useEffect(() => {
    if (activeModal !== "workerProfessional") return;
    servicesService
      .getAll()
      .then((response) => {
        const services = response?.data?.services || [];
        setTradeOptions(buildServicePickerOptions(services));
      })
      .catch(() => setTradeOptions([]));
  }, [activeModal]);

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
    const cnicClean = String(form.cnicNumber).replace(/-/g, "");
    if (!/^\d{13}$/.test(cnicClean)) {
      setMessage(t("worker.cnicInvalid"));
      setIsError(true);
      return;
    }
    if (!form.primaryServiceId && !form.primaryServiceCategory) {
      setMessage(t("worker.tradeRequired"));
      setIsError(true);
      return;
    }
    if (form.phoneNumber && !isPhoneValid(form.phoneNumber)) {
      setMessage(t("signup.invalidPhone"));
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
      if (password) body.append("password", password);
      body.append("cnicNumber", cnicClean);
      if (form.phoneNumber) body.append("phoneNumber", form.phoneNumber.trim());
      if (form.primaryServiceId) body.append("primaryServiceId", form.primaryServiceId);
      if (form.primaryServiceName) body.append("primaryServiceName", form.primaryServiceName);
      if (form.primaryServiceCategory) {
        body.append("primaryServiceCategory", form.primaryServiceCategory);
      }
      body.append("verificationPhoto", verificationPhoto);
      body.append("location", geo.location.trim());
      if (geo.latitude != null) body.append("latitude", geo.latitude);
      if (geo.longitude != null) body.append("longitude", geo.longitude);
      if (geo.placeId) body.append("placeId", geo.placeId);

      const res = await authService.registerWorkerProfessional(body);
      if (res.success) {
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
    <div className="fixed inset-0 z-[76] flex items-center justify-center px-4">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t("worker.trade")} *
                </label>
                <SearchableSelect
                  options={tradeOptions}
                  value={form.primaryServiceId}
                  onChange={(val) => update("primaryServiceId", val)}
                  onSelectOption={(opt) => {
                    setForm((f) => ({
                      ...f,
                      primaryServiceId: opt.value,
                      primaryServiceName: opt.name || "",
                      primaryServiceCategory: opt.category || "",
                    }));
                  }}
                  placeholder={t("worker.selectTrade")}
                  required
                />
                <input
                  type="text"
                  placeholder={`${t("worker.cnicPlaceholder")} *`}
                  value={form.cnicNumber}
                  onChange={(e) => update("cnicNumber", e.target.value)}
                  required
                  className={inputCls}
                />
                <PhoneInput
                  value={form.phoneNumber}
                  onChange={(v) => update("phoneNumber", v)}
                  placeholder={t("worker.phoneOptional")}
                />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    <span className="flex items-center gap-1"><MapPin size={13} /> Your Location *</span>
                  </label>
                  <LocationPicker
                    value={geo}
                    onChange={setGeo}
                    placeholder="Search your city or area..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t("worker.passportPhoto")} <span className="text-slate-400 font-normal">(Optional)</span>
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
                  <p className={`text-sm ${isError ? "text-red-600" : "text-emerald-600"}`}>
                    {message}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-orange-500 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60 flex items-center justify-center gap-2"
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
