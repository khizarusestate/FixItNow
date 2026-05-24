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

export default function CompleteProfile() {
  const { activeModal, closeModal } = useModal();
  const { user, updateUser } = useAuth();
  const [geo, setGeo] = useState(() => geoFromUser(user));
  const [form, setForm] = useState({
    availability: user?.availability ?? true,
    profilePicture: null,
  });
  const [previewImage, setPreviewImage] = useState(
    user?.profilePicture || null,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      if (!geo.location?.trim()) {
        setMessage("Please select your location on the map.");
        setIsError(true);
        setSubmitting(false);
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

      // Handle profile picture upload
      if (form.profilePicture && form.profilePicture instanceof File) {
        // Convert file to base64 for now (in production, you'd upload to a service)
        const reader = new FileReader();
        reader.onloadend = async () => {
          updateData.profilePicture = reader.result;
          await submitProfileUpdate(updateData);
        };
        reader.readAsDataURL(form.profilePicture);
      } else {
        await submitProfileUpdate(updateData);
      }
    } catch (err) {
      setMessage(err.message || "Profile update failed. Please try again.");
      setIsError(true);
      setSubmitting(false);
    }
  };

  const submitProfileUpdate = async (updateData) => {
    try {
      const endpoint =
        user?.type === "worker" ? "/worker/profile" : "/auth/customer/profile";
      const response = await apiRequestWithAuth(endpoint, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        // Update user context with new data
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
            updateData.profilePicture ||
            response.data?.profilePicture ||
            user.profilePicture,
        });

        setDone(true);
        setMessage("Profile completed successfully!");
        setIsError(false);
        setTimeout(() => {
          closeModal();
        }, 2000);
      }
    } catch (err) {
      setMessage(err.message || "Profile update failed. Please try again.");
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
                OK
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Profile Picture{" "}
                  <span className="text-slate-400">(Optional)</span>
                </label>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border-2 border-slate-200">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Camera size={24} className="text-slate-400" />
                      )}
                    </div>
                    <label className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-orange-500 text-white flex items-center justify-center cursor-pointer hover:bg-orange-600 transition-colors">
                      <Upload size={14} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-600">
                      Upload a profile picture to personalize your account
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                </div>
              </div>

              <LocationPicker
                label="Location"
                required
                value={geo}
                onChange={setGeo}
              />

              {user?.type === "worker" && (
                <label className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.availability}
                    onChange={(e) => update("availability", e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-orange-500"
                  />
                  Available for work
                </label>
              )}

              {message && (
                <p
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium ${isError ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {message}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
                >
                  Skip for Now
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
                >
                  {submitting ? "Saving..." : "Complete Profile"}
                  <ArrowRight size={15} />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
