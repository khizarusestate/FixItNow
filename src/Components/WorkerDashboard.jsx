import { useState, useEffect, useRef, useCallback } from "react";
import {
  Briefcase,
  CheckCircle,
  X,
  Loader2,
  MapPin,
  AlertTriangle,
  Phone,
  Search,
  User,
} from "lucide-react";

import { apiRequestWithAuth } from "../services/api.js";
import { shouldRefreshBookings } from "../utils/apiError";
import CompletionTicks from "./CompletionTicks";
import { useAuth } from "../context/AuthContext";
import { getUserData } from "../utils/jwt.js";

function jobPhone(job) {
  return job?.phone || job?.customerPhone || "-";
}

function jobCustomerName(job) {
  return job?.customerName?.trim() || (job?.isGuest ? "Guest" : "") || "";
}

function formatDistance(km) {
  if (km == null || Number.isNaN(Number(km))) return null;
  const n = Number(km);
  if (n < 1) return `${Math.round(n * 1000)} m away`;
  return `${n.toFixed(1)} km away`;
}

function JobCard({ job, children }) {
  const displayLocation = job?.location || job?.address || "N/A";
  const distanceLabel = formatDistance(job?._distanceKm);
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-base font-semibold text-slate-900">
          {job.serviceTitle || "Service"}
        </h4>
        {distanceLabel ? (
          <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
            {distanceLabel}
          </span>
        ) : job?._matchMeta?.approximateLocation ? (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
            Approx. area
          </span>
        ) : null}
      </div>
      <div className="mt-3 space-y-2 text-sm text-slate-600">
        {jobCustomerName(job) ? (
          <div className="flex items-start gap-2">
            <User size={16} className="mt-0.5 shrink-0 text-orange-500" />
            <span className="font-medium text-slate-800">{jobCustomerName(job)}</span>
          </div>
        ) : null}
        <div className="flex items-start gap-2">
          <Phone size={16} className="mt-0.5 shrink-0 text-orange-500" />
          <span className="break-all">{jobPhone(job)}</span>
        </div>
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-orange-500" />
          <span>{displayLocation}</span>
        </div>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function isNetworkError(message = "") {
  const msg = String(message);
  return (
    msg.includes("Failed to fetch") ||
    msg.includes("Network error") ||
    msg.includes("CONNECTION_REFUSED") ||
    msg.includes("Request timed out")
  );
}

export default function WorkerDashboard({ isOpen, onClose }) {
  const { user, newJobNotification, updateJobCount, updateUser } = useAuth();
  const storedWorker = getUserData("worker");
  const workerUser =
    user?.type === "worker"
      ? user
      : storedWorker
        ? { ...storedWorker, type: "worker" }
        : user;

  const [activeTab, setActiveTab] = useState("overview");

  const [availableJobs, setAvailableJobs] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [allAvailableJobs, setAllAvailableJobs] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [claiming, setClaiming] = useState(null);
  const [completing, setCompleting] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchInFlightRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const refreshTimerRef = useRef(null);
  const updateJobCountRef = useRef(updateJobCount);
  updateJobCountRef.current = updateJobCount;

  useEffect(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) {
      setAvailableJobs(allAvailableJobs);
      return;
    }
    setAvailableJobs(
      allAvailableJobs.filter(
        (job) =>
          job.serviceTitle?.toLowerCase().includes(q) ||
          job.address?.toLowerCase().includes(q) ||
          job.location?.toLowerCase().includes(q) ||
          jobCustomerName(job).toLowerCase().includes(q) ||
          jobPhone(job).toLowerCase().includes(q),
      ),
    );
  }, [searchTerm, allAvailableJobs]);

  const fetchData = useCallback(async (silent = false) => {
    if (fetchInFlightRef.current && silent) return;
    fetchInFlightRef.current = true;
    if (!silent) {
      setLoading(true);
      setError("");
    }

    try {
      const [jobsResult, myJobsResult, profileResult] =
        await Promise.allSettled([
          apiRequestWithAuth("/worker-jobs/available"),
          apiRequestWithAuth("/worker-jobs/my-jobs"),
          apiRequestWithAuth("/worker/profile"),
        ]);

      const rejected = [jobsResult, myJobsResult, profileResult].filter(
        (r) => r.status === "rejected",
      );
      if (rejected.length === 3) {
        const reason = rejected[0].reason;
        throw reason instanceof Error
          ? reason
          : new Error("Cannot reach the server.");
      }

      const jobsResponse =
        jobsResult.status === "fulfilled" ? jobsResult.value : { data: [] };
      const myJobsResponse =
        myJobsResult.status === "fulfilled" ? myJobsResult.value : { data: [] };
      const profileRes =
        profileResult.status === "fulfilled"
          ? profileResult.value
          : { data: null };

      const sortedAvailableJobs = jobsResponse.data || [];
      setAvailableJobs(sortedAvailableJobs);
      setAllAvailableJobs(sortedAvailableJobs);

      const sortedMyJobs = (myJobsResponse.data || []).sort((a, b) => {
        const aActive = a.status === "assigned" || a.status === "in-progress";
        const bActive = b.status === "assigned" || b.status === "in-progress";
        if (aActive && !bActive) return -1;
        if (!aActive && bActive) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setMyJobs(sortedMyJobs);
      const profileData = profileRes.data || null;
      setProfile(profileData);

      if (profileData && updateUser) {
        updateUser({
          ...profileData,
          id: profileData.id || profileData._id,
          _id: profileData._id || profileData.id,
          email: profileData.emailAddress || profileData.email,
          emailAddress: profileData.emailAddress || profileData.email,
          phone: profileData.phoneNumber || profileData.phone,
          phoneNumber: profileData.phoneNumber || profileData.phone,
          type: "worker",
        });
      }

      updateJobCountRef.current?.(sortedAvailableJobs.length);
    } catch (err) {
      if (!silent) {
        const msg = err?.message || "";
        const isOffline = isNetworkError(msg);
        setError(
          isOffline
            ? "Cannot reach the server. Check your connection and try again."
            : msg || "Failed to load data.",
        );
      }
    } finally {
      fetchInFlightRef.current = false;
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      hasLoadedRef.current = false;
      setLoading(false);
      fetchInFlightRef.current = false;
      return;
    }
    fetchData(hasLoadedRef.current);
    hasLoadedRef.current = true;
  }, [isOpen, fetchData]);

  useEffect(() => {
    if (!newJobNotification || !isOpen) return;
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newJobNotification, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const scheduleRefresh = () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => fetchData(true), 500);
    };

    window.addEventListener("fixitnow-worker-dashboard-refresh", scheduleRefresh);
    window.addEventListener("fixitnow-booking-updated", scheduleRefresh);
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      window.removeEventListener(
        "fixitnow-worker-dashboard-refresh",
        scheduleRefresh,
      );
      window.removeEventListener("fixitnow-booking-updated", scheduleRefresh);
    };
  }, [isOpen, fetchData]);

  const handleMarkJobDone = async (jobId) => {
    setCompleting(jobId);
    setError("");
    try {
      const res = await apiRequestWithAuth(`/worker-jobs/${jobId}/mark-done`, {
        method: "POST",
      });
      await fetchData(true);
      if (res?.data?.finalized) {
        setActiveTab("my-jobs");
      }
    } catch (err) {
      if (shouldRefreshBookings(err)) {
        await fetchData(true);
      }
      setError(err.message || "Failed to mark job as done.");
    } finally {
      setCompleting(null);
    }
  };

  const handleClaimJob = async (jobId) => {
    const jobToClaim = availableJobs.find((j) => j.id === jobId);
    if (!jobToClaim) {
      setError("Job not found.");
      return;
    }

    setClaiming(jobId);
    setError("");

    try {
      const response = await apiRequestWithAuth("/worker-jobs/claim", {
        method: "POST",
        body: JSON.stringify({ bookingId: jobId }),
      });

      if (response.success) {
        const claimedJob = {
          ...jobToClaim,
          status: "assigned",
          assignedAt: new Date().toISOString(),
        };

        setAvailableJobs((prev) => {
          const next = prev.filter((j) => j.id !== jobId);
          updateJobCountRef.current?.(next.length);
          return next;
        });
        setAllAvailableJobs((prev) => prev.filter((j) => j.id !== jobId));
        setMyJobs((prev) => [claimedJob, ...prev]);
        setActiveTab("my-jobs");
        fetchData(true);
      }
    } catch (err) {
      if (shouldRefreshBookings(err)) {
        await fetchData(true);
      }
      setError(err.message || "Failed to claim job.");
    } finally {
      setClaiming(null);
    }
  };

  if (!isOpen) return null;

  const activeMyJobs = myJobs.filter((job) => job.status !== "completed");

  const completedMyJobs = myJobs.filter((job) => job.status === "completed");

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scaleIn">
        {/* HEADER */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Worker Dashboard
            </h2>

            <p className="text-sm text-slate-500">
              Welcome back{" "}
              {profile?.fullName || workerUser?.fullName || "Worker"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0 min-h-[58px]">
          {[
            {
              key: "overview",
              label: "Overview",
            },

            {
              key: "jobs",
              label: "Jobs",
            },

            {
              key: "my-jobs",
              label: `My Jobs ${myJobs.length > 0 ? `(${myJobs.length})` : ""}`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 min-w-fit ${
                activeTab === tab.key
                  ? "border-orange-500 text-orange-600 bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* BODY */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2
                size={40}
                className="animate-spin text-orange-500 mb-4"
              />

              <p className="text-slate-500">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <AlertTriangle size={48} className="mx-auto text-red-300 mb-4" />

              <p className="text-red-600 font-medium">{error}</p>

              <button
                type="button"
                onClick={() => fetchData(false)}
                className="mt-4 px-5 py-2 rounded-lg bg-orange-500 text-white text-sm hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab("my-jobs")}
                    className="border rounded-xl p-5 hover:shadow-lg transition-all hover:border-orange-300 hover:bg-orange-50 text-left"
                  >
                    <Briefcase className="text-orange-500 mb-3" size={24} />

                    <p className="text-sm text-slate-500">Active Jobs</p>

                    <p className="text-3xl font-bold">{activeMyJobs.length}</p>
                  </button>

                  <button
                    onClick={() => setActiveTab("my-jobs")}
                    className="border rounded-xl p-5 hover:shadow-lg transition-all hover:border-green-300 hover:bg-green-50 text-left"
                  >
                    <CheckCircle className="text-green-500 mb-3" size={24} />

                    <p className="text-sm text-slate-500">Completed Jobs</p>

                    <p className="text-3xl font-bold">
                      {completedMyJobs.length}
                    </p>
                  </button>
                </div>
              )}

              {/* JOBS TAB */}
              {activeTab === "jobs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      Available Jobs
                    </h3>
                    <span className="text-sm text-slate-500">
                      {availableJobs.length} jobs found
                    </span>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={20} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by job title, customer, phone, or location..."
                      className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X
                          size={20}
                          className="text-slate-400 hover:text-slate-600"
                        />
                      </button>
                    )}
                  </div>

                  {searchTerm && (
                    <div className="text-sm text-slate-500">
                      Showing results for "{searchTerm}" ({availableJobs.length}{" "}
                      jobs)
                    </div>
                  )}

                  {availableJobs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Search
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <p className="text-slate-500 font-medium">
                        {searchTerm
                          ? "No jobs found matching your search"
                          : "No available jobs found"}
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        {searchTerm
                          ? "Try a different title, phone, or location"
                          : "Check back later for new opportunities"}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm("")}
                          className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Clear Search
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {availableJobs.map((job) => (
                        <div
                          key={job.id}
                          className="border rounded-xl p-5 hover:shadow-lg transition-all hover:border-orange-300 relative"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-slate-900">
                              {job.serviceTitle}
                            </h4>
                            <div className="flex flex-wrap items-center justify-end gap-1 shrink-0">
                            {job._demoted && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                Lower match
                              </span>
                            )}
                            {formatDistance(job._distanceKm) ? (
                              <span className="shrink-0 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700">
                                {formatDistance(job._distanceKm)}
                              </span>
                            ) : job?._matchMeta?.approximateLocation ? (
                              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                                Approx. area
                              </span>
                            ) : null}
                            </div>
                          </div>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            {jobCustomerName(job) ? (
                              <div className="flex items-start gap-2">
                                <User
                                  size={16}
                                  className="mt-0.5 shrink-0 text-orange-500"
                                />
                                <span className="font-medium text-slate-800">
                                  {jobCustomerName(job)}
                                </span>
                              </div>
                            ) : null}
                            <div className="flex items-start gap-2">
                              <Phone
                                size={16}
                                className="mt-0.5 shrink-0 text-orange-500"
                              />
                              <span className="break-all">{jobPhone(job)}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin
                                size={16}
                                className="mt-0.5 shrink-0 text-orange-500"
                              />
                              <span>
                                {job.location || job.address || "N/A"}
                              </span>
                            </div>
                          </div>
                          <div className="mt-4 flex gap-2">
                            <button
                              onClick={() => handleClaimJob(job.id)}
                              disabled={claiming === job.id}
                              className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {claiming === job.id ? (
                                <div className="flex items-center justify-center gap-2">
                                  <Loader2 size={16} className="animate-spin" />
                                  Claiming...
                                </div>
                              ) : (
                                "Claim Job"
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MY JOBS TAB */}
              {activeTab === "my-jobs" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      My Jobs
                    </h3>
                    <span className="text-sm text-slate-500">
                      {myJobs.length} jobs
                    </span>
                  </div>

                  {myJobs.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                      <Briefcase
                        size={48}
                        className="mx-auto text-slate-300 mb-4"
                      />
                      <p className="text-slate-500 font-medium">
                        No jobs assigned yet
                      </p>
                      <p className="text-sm text-slate-400 mt-2">
                        Accept jobs from the Available Jobs tab
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {myJobs.map((job) => {
                        const canMarkDone =
                          job.status !== "completed" &&
                          !job.workerMarkedDone &&
                          ["assigned", "in-progress"].includes(job.status);
                        const isGuestJob = Boolean(job.isGuest);
                        const waitingCustomer =
                          !isGuestJob &&
                          job.workerMarkedDone &&
                          !job.customerMarkedDone &&
                          job.status !== "completed";

                        return (
                          <JobCard key={job.id} job={job}>
                            <div className="flex flex-col items-end gap-2 w-full">
                              <div className="flex items-center gap-2">
                                <CompletionTicks
                                  guestOnly={isGuestJob}
                                  customerMarkedDone={job.customerMarkedDone}
                                  workerMarkedDone={job.workerMarkedDone}
                                />
                                {job.status === "completed" ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
                                    <CheckCircle size={12} />
                                    Completed
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                                    <Briefcase size={12} />
                                    {job.status === "assigned"
                                      ? "Assigned"
                                      : job.status === "in-progress"
                                        ? "In progress"
                                        : "Active"}
                                  </span>
                                )}
                              </div>
                              {waitingCustomer && (
                                <p className="text-xs text-blue-700 font-medium text-right">
                                  Waiting for customer rating
                                </p>
                              )}
                              {job.customerMarkedDone && !job.workerMarkedDone && (
                                <p className="text-xs text-orange-700 font-medium text-right">
                                  Customer marked done — confirm below
                                </p>
                              )}
                              {canMarkDone && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkJobDone(job.id)}
                                  disabled={completing === job.id}
                                  className="w-full px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                >
                                  {completing === job.id ? (
                                    <span className="inline-flex items-center justify-center gap-2">
                                      <Loader2 size={16} className="animate-spin" />
                                      Saving…
                                    </span>
                                  ) : (
                                    "Mark as Done"
                                  )}
                                </button>
                              )}
                            </div>
                          </JobCard>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
