import { useState } from "react";
import {
  X,
  Upload,
  MapPin,
  Camera,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import { apiRequestWithAuth } from "../services/api.js";
import LocationPicker from "./LocationPicker";
import { geoFromUser } from "../utils/location.js";
import { resolveUploadMediaUrl } from "../utils/mediaUrl.js";
import { uploadUserProfilePicture } from "../utils/profilePictureUpload.js";

export default function CompleteProfile() {
  const { activeModal, closeModal } = useModal();
  const { user, updateUser } = useAuth();
  const [geo, setGeo] = useState(() => geoFromUser(user));
  const [form, setForm] = useState({
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

  if (activeModal !== "completeProfile") return null;

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

      const updateData = {
        location: geo.location.trim(),
        latitude: geo.latitude,
        longitude: geo.longitude,
        placeId: geo.placeId,
      };

      if (user?.type === "worker") {
        updateData.availability = form.availability;
      }

      let uploadedPicturePath = null;
      if (form.profilePicture instanceof File) {
        uploadedPicturePath = await uploadUserProfilePicture(
          form.profilePicture,
          user?.type,
        );
      }

      const endpoint =
        user?.type === "worker" ? "/worker/profile" : "/auth/customer/profile";
      const response = await apiRequestWithAuth(endpoint, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        updateUser({
          ...user,
          ...(response.data || {}),
          location: updateData.location || response.data?.location,
          latitude: updateData.latitude ?? response.data?.latitude,
          longitude: updateData.longitude ?? response.data?.longitude,
          address: updateData.location || response.data?.address,
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

  const inputCls =
    "w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 bg-white";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto animate-[fadeScale_0.2s_ease-out]">
        <div className="flex items-start justify-between p-6 pb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
              Complete Profile
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">
              Almost there!
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add your photo and location for a complete profile
            </p>
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
                Profile Completed!
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Your profile is now complete and ready to use.
              </p>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
              >
                Continue <ArrowRight size={16} />
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
                  Optional — JPG/PNG/WebP, max 5MB
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  <MapPin size={14} className="inline mr-1" />
                  Your Location *
                </label>
                <LocationPicker value={geo} onChange={setGeo} />
              </div>

              {user?.type === "worker" && (
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
                {submitting ? "Saving..." : "Complete Profile"}
                {!submitting && <ArrowRight size={16} />}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
