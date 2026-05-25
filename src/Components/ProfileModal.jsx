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
  Trash2,
  LogOut,
  AlertTriangle,
  DollarSign,
} from "lucide-react";
import { apiRequestWithAuth } from "../lib/api";
import { resolveUploadMediaUrl } from "../utils/mediaUrl.js";
import { getTokenCreationDate } from "../utils/jwt";
import EditProfile from "./EditProfile";
import WorkerRatingBadge from "./WorkerRatingBadge";
import { useOnboarding } from "../context/OnboardingContext";
import { Compass } from "lucide-react";

export default function ProfileModal({
  isOpen,
  onClose,
  userData,
  onProfileUpdate,
  onLogout,
  openModal,
}) {
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { openHowItWorks } = useOnboarding();

  if (!isOpen) return null;

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    setError("");

    try {
      const endpoint =
        userData?.type === "worker"
          ? "/auth/worker/delete-account"
          : "/auth/customer/delete-account";

      await apiRequestWithAuth(endpoint, {
        method: "DELETE",
      });

      setMessage("Account deleted successfully!");

      // Auto logout after success
      setTimeout(() => {
        onLogout();
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to delete account");
      setDeleteLoading(false);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    onProfileUpdate(updatedData);
    setShowEdit(false);
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
          onClick={onClose}
        ></div>

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-100">
            <div>
              <p className="text-sm text-slate-500">
                {userData?.type === "worker"
                  ? "Worker Account"
                  : "Customer Account"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-slate-500" />
            </button>
          </div>

          {/* Profile Info */}
          <div className="p-6 space-y-6">
            {/* Avatar Section */}
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
                  <WorkerRatingBadge
                    rating={userData?.rating}
                    size="md"
                  />
                </div>
              )}
            </div>

            {/* Details Grid */}
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

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                {message}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  openHowItWorks();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors font-medium"
              >
                <Compass size={18} />
                How it works
              </button>
              <button
                onClick={() => setShowEdit(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
              >
                <Trash2 size={18} />
                Delete Account
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfile
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        userData={userData}
        onProfileUpdate={handleProfileUpdate}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-fadeIn">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Delete Account?
              </h3>
              <p className="text-slate-600 mb-6">
                This action cannot be undone. All your data including bookings
                and history will be permanently deleted.
              </p>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
                >
                  {deleteLoading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
