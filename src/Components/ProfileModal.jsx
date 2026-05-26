import { useState } from "react";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit3,
  Settings,
  ChevronLeft,
} from "lucide-react";
import { getTokenCreationDate } from "../utils/jwt";
import EditProfile from "./EditProfile";
import ProfileSettings from "./ProfileSettings";
import WorkerRatingBadge from "./WorkerRatingBadge";
import { resolveUploadMediaUrl } from "../utils/mediaUrl.js";

export default function ProfileModal({
  isOpen,
  onClose,
  userData,
  onProfileUpdate,
  onLogout,
}) {
  const [view, setView] = useState("profile");
  const [showEdit, setShowEdit] = useState(false);

  if (!isOpen) return null;

  const handleClose = () => {
    setView("profile");
    onClose();
  };

  const handleProfileUpdate = (updatedData) => {
    onProfileUpdate(updatedData);
    setShowEdit(false);
  };

  const handlePreferenceChange = (prefs) => {
    onProfileUpdate({ ...userData, ...prefs });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[9999] flex items-start justify-center p-4"
        style={{ paddingTop: "80px" }}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={handleClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2 min-w-0">
              {view === "settings" && (
                <button
                  type="button"
                  onClick={() => setView("profile")}
                  className="p-1.5 hover:bg-slate-100 rounded-lg shrink-0"
                  aria-label="Back to profile"
                >
                  <ChevronLeft size={20} className="text-slate-600" />
                </button>
              )}
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-slate-900 truncate">
                  {view === "settings" ? "Settings" : "My Profile"}
                </h2>
                <p className="text-xs text-slate-500 truncate">
                  {userData?.type === "worker"
                    ? "Worker account"
                    : "Customer account"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {view === "profile" && (
                <button
                  type="button"
                  onClick={() => setView("settings")}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Settings"
                  aria-label="Open settings"
                >
                  <Settings size={20} className="text-slate-600" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
          </div>

          {view === "settings" ? (
            <div className="p-6">
              <ProfileSettings
                userData={userData}
                onLogout={() => {
                  handleClose();
                  onLogout();
                }}
                onPreferenceChange={handlePreferenceChange}
              />
            </div>
          ) : (
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                  {userData?.profilePicture ? (
                    <img
                      src={resolveUploadMediaUrl(userData.profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    userData?.fullName?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">
                  {userData?.fullName || "User"}
                </h3>
                <p className="text-sm text-slate-500">
                  {userData?.email || userData?.emailAddress}
                </p>
                {userData?.type === "worker" && (
                  <div className="mt-2">
                    <WorkerRatingBadge rating={userData?.rating} size="md" />
                  </div>
                )}
              </div>

              <div className="grid gap-4">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email Address</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userData?.email || userData?.emailAddress || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Phone size={18} className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Phone Number</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userData?.phone || userData?.phoneNumber || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Location</p>
                    <p className="text-sm font-medium text-slate-900">
                      {userData?.location ||
                        userData?.address ||
                        userData?.serviceArea ||
                        "N/A"}
                    </p>
                  </div>
                </div>

                {userData?.type === "worker" && (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <Shield size={18} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">CNIC</p>
                        <p className="text-sm font-medium text-slate-900">
                          {userData?.cnicNumber || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <User size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Selected Work</p>
                        <p className="text-sm font-medium text-slate-900">
                          {userData?.primaryServiceCategory ||
                            userData?.serviceCategory ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="p-2 bg-emerald-100 rounded-lg">
                        <Shield size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Availability</p>
                        <p className="text-sm font-medium text-slate-900">
                          {(userData?.availability ?? true)
                            ? "Available"
                            : "Not Available"}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Calendar size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {userData?.type === "worker"
                        ? "Worker Since"
                        : "Member Since"}
                    </p>
                    <p className="text-sm font-medium text-slate-900">
                      {formatDate(
                        userData?.joinDate ||
                          userData?.createdAt ||
                          userData?.joinedAt ||
                          getTokenCreationDate(),
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>

              <button
                type="button"
                onClick={() => setView("settings")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <Settings size={18} />
                Settings
              </button>
            </div>
          )}
        </div>
      </div>

      <EditProfile
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        userData={userData}
        onProfileUpdate={handleProfileUpdate}
      />
    </>
  );
}
