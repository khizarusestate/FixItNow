import { useState, useEffect } from "react";
import {
  X,
  Upload,
  MapPin,
  Camera,
  CheckCircle,
  ArrowRight,
  Phone,
  Shield,
} from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import { apiRequestWithAuth } from "../services/api.js";
import LocationPicker from "./LocationPicker";
import ServiceSelection from "./ServiceSelection.jsx";
import { geoFromUser } from "../utils/location.js";
import { resolveUploadMediaUrl } from "../utils/mediaUrl.js";
import { uploadUserProfilePicture } from "../utils/profilePictureUpload.js";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useI18n } from "../context/I18nContext.jsx";
import {
  getMissingProfileFields,
  workerNeedsProfessionalSignup,
} from "../utils/profileCompletion.js";

export default function CompleteProfile() {
  const { t } = useI18n();
  const { activeModal, closeModal, switchModal, openModal } = useModal();
  const { user, updateUser } = useAuth();
  const isWorker = user?.type === "worker";
  const missing = getMissingProfileFields(user);

  const [geo, setGeo] = useState(() => geoFromUser(user));
  const [form, setForm] = useState({
    phone: user?.phone || user?.phoneNumber || "",
    cnicNumber: user?.cnicNumber || "",
    primaryServiceCategory:
      user?.primaryServiceCategory && user.primaryServiceCategory !== "Unspecified"
        ? user.primaryServiceCategory
        : "",
    primaryServiceName: user?.primaryServiceName || "",
    primaryServiceId: user?.primaryServiceId ? String(user.primaryServiceId) : "",
    selectedServices: user?.services?.length
      ? user.services.map((s) => ({
          serviceId: String(s.serviceId || s._id || ""),
          serviceName: s.serviceName || "",
          serviceCategory: s.serviceCategory || "",
        }))
      : user?.primaryServiceId
        ? [{
            serviceId: String(user.primaryServiceId),
            serviceName: user.primaryServiceName || "",
            serviceCategory: user.primaryServiceCategory || "",
          }]
        : [],
    availability: user?.availability ?? true,
    profilePicture: null,
  });
  const [previewImage, setPreviewImage] = useState(
    user?.profilePicture ? resolveUploadMediaUrl(user.profilePicture) : null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (activeModal !== "completeProfile") return;
    if (!isWorker || !workerNeedsProfessionalSignup(user)) return;
    switchModal("workerProfessional", {
      email: user?.emailAddress || user?.email,
    });
  }, [activeModal, isWorker, user, switchModal]);

  if (activeModal !== "completeProfile") return null;

  if (isWorker && workerNeedsProfessionalSignup(user)) {
    return null;
  }

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setMessage("");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage("Image size should be less than 5MB");
        setIsError(true);
        return;
      }
      setForm((f) => ({ ...f, profilePicture: file }));
      setPreviewImage(URL.createObjectURL(file));
      setIsError(false);
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");
    setIsError(false);

    try {
      if (!geo.location?.trim()) {
        setMessage("Please select your location on the map.");
        setIsError(true);
        return;
      }

      if (missing.includes("phone") && !String(form.phone).trim()) {
        setMessage("Please enter your phone number.");
        setIsError(true);
        return;
      }
      if (form.phone.trim() && !isPhoneValid(form.phone)) {
        setMessage("Please enter a valid phone number.");
        setIsError(true);
        return;
      }


      const updateData = {
        location: geo.location.trim(),
        latitude: geo.latitude,
        longitude: geo.longitude,
        placeId: geo.placeId,
      };

      if (isWorker) {
        updateData.availability = form.availability;
        if (form.phone.trim()) updateData.phoneNumber = form.phone.trim();
        if (form.selectedServices?.length) {
          updateData.services = form.selectedServices;
        }
      } else if (form.phone.trim()) {
        updateData.phone = form.phone.trim();
      }

      let uploadedPicturePath = null;
      if (form.profilePicture instanceof File) {
        uploadedPicturePath = await uploadUserProfilePicture(
          form.profilePicture,
          user?.type,
        );
      }

      const endpoint = isWorker
        ? "/worker/profile"
        : "/auth/customer/profile";
      const response = await apiRequestWithAuth(endpoint, {
        method: "PUT",
        body: JSON.stringify(updateData),
        role: isWorker ? "worker" : "customer",
      });

      if (response.success) {
        updateUser({
          ...user,
          ...(response.data || {}),
          location: updateData.location || response.data?.location,
          latitude: updateData.latitude ?? response.data?.latitude,
          longitude: updateData.longitude ?? response.data?.longitude,
          address: updateData.location || response.data?.address,
          phone: response.data?.phone ?? updateData.phone ?? user.phone,
          phoneNumber:
            response.data?.phoneNumber ??
            updateData.phoneNumber ??
            user.phoneNumber,
          cnicNumber: response.data?.cnicNumber ?? user.cnicNumber,
          primaryServiceCategory:
            response.data?.primaryServiceCategory ?? user.primaryServiceCategory,
          primaryServiceName:
            response.data?.primaryServiceName ?? user.primaryServiceName,
          primaryServiceId:
            response.data?.primaryServiceId ?? user.primaryServiceId,
          availability:
            updateData.availability ??
            response.data?.availability ??
            user.availability,
          profilePicture:
            uploadedPicturePath ||
            response.data?.profilePicture ||
            user.profilePicture,
        });

        setDone(true);
        setMessage("Profile completed successfully!");
        setIsError(false);
        setTimeout(() => closeModal(), 2000);
      }
    } catch (err) {
      const msg = err.message || "Profile update failed. Please try again.";
      setMessage(
        msg.includes("too large") || msg.includes("entity")
          ? "Photo is too large. Try a smaller image or skip the photo for now."
          : msg,
      );
      setIsError(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    closeModal();
    setDone(false);
    setMessage("");
  };

  const subtitle = isWorker
    ? "Google sign-in does not include CNIC or trade — add the details below so we can verify your worker profile."
    : "Add any missing details below so bookings and notifications work smoothly.";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              {t("profile.complete")}
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              {t("profile.almostThere")}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
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
                {t("profile.completed")}
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                {t("profile.ready")}
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                {t("common.continue")} <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex flex-col items-center">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-orange-100 bg-slate-100 flex items-center justify-center">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera size={32} className="text-slate-400" />
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 bg-orange-500 text-white p-2 rounded-full shadow-lg group-hover:bg-orange-600 transition-colors">
                    <Upload size={14} />
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                <p className="mt-2 text-xs text-slate-500">
                  {t("profile.photoOptional")}
                </p>
              </div>

              {missing.includes("phone") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <Phone size={14} className="inline mr-1" />
                    {t("profile.phone")} *
                  </label>
                  <PhoneInput
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                  />
                </div>
              )}

              {isWorker && missing.includes("cnic") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    <Shield size={14} className="inline mr-1" />
                    CNIC *
                  </label>
                  <input
                    type="text"
                    value={form.cnicNumber}
                    onChange={(e) => update("cnicNumber", e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100"
                    placeholder="35201-1234567-8"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Required for worker verification (not provided by Google).
                  </p>
                </div>
              )}

              {isWorker && missing.includes("trade") && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Your services *
                  </label>
                  <ServiceSelection
                    selectedServices={form.selectedServices}
                    onChange={(selectedServices) =>
                      setForm((f) => ({ ...f, selectedServices }))
                    }
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1" />
                  Your location *
                </label>
                <LocationPicker value={geo} onChange={setGeo} />
              </div>

              {isWorker && (
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-sm font-medium text-slate-700">
                    Available for work
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      update("availability", !form.availability)
                    }
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      form.availability ? "bg-orange-500" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        form.availability ? "translate-x-6" : ""
                      }`}
                    />
                  </button>
                </div>
              )}

              {message && (
                <p
                  className={`text-sm ${isError ? "text-red-600" : "text-emerald-600"}`}
                >
                  {message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-60 transition-colors"
              >
                {submitting ? "Saving..." : "Save & Continue"}
                {!submitting && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
