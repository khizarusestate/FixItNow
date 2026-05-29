import { useState, useEffect, useCallback, useRef } from "react";
import { Megaphone, ChevronLeft, ChevronRight, Phone, Clock } from "lucide-react";
import { apiRequest, advertisementService } from "../services/api.js";
import { resolveUploadMediaUrl } from "../utils/mediaUrl.js";
import { useAuth } from "../context/AuthContext";

const getImageUrl = (url) => resolveUploadMediaUrl(url);

const ADS_PER_PAGE = 3;

function AdCard({ ad, fileIndex, onPrevFile, onNextFile }) {
  const videoRef = useRef(null);
  const files = ad?.adFileUrls || [];
  const safeIndex = Math.min(fileIndex, Math.max(0, files.length - 1));
  const url = files[safeIndex];

  return (
    <div className="service-card animate-scaleIn flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-xl">
      <div className="relative aspect-[4/3] bg-slate-100">
        {url ? (
          ad?.adType === "image" ? (
            <img
              src={getImageUrl(url)}
              alt={ad?.purpose || "Advertisement"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-slate-900">
              <video
                ref={videoRef}
                src={getImageUrl(url)}
                controls
                className="h-full w-full object-contain"
              />
            </div>
          )
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            <span className="text-sm">No media</span>
          </div>
        )}

        {files.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrevFile}
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/80 bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Previous image"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={onNextFile}
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/80 bg-black/40 p-1.5 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              aria-label="Next image"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white">
              {safeIndex + 1} / {files.length}
            </div>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-slate-100 p-4">
        <p className="line-clamp-2 text-xs font-medium text-slate-600">
          {ad?.purpose}
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-slate-100 pt-3">
          {ad?.submitterProfilePicture ? (
            <img
              src={getImageUrl(ad.submitterProfilePicture)}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full border-2 border-orange-100 object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-white">
              {ad?.name?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {ad?.name || "Advertiser"}
            </p>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-600">
              <Phone size={12} className="shrink-0 text-orange-500" />
              <span className="truncate font-medium text-slate-800">
                {ad?.phone?.trim() || "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApprovedAds() {
  const { isAuthenticated } = useAuth();
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [fileIndexByAdId, setFileIndexByAdId] = useState({});
  const [pendingMyAds, setPendingMyAds] = useState([]);

  const fetchPendingMine = useCallback(async () => {
    if (!isAuthenticated) {
      setPendingMyAds([]);
      return;
    }
    try {
      const d = await advertisementService.getMyAds();
      setPendingMyAds((d.data || []).filter((a) => a.status === "pending"));
    } catch {
      setPendingMyAds([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPendingMine();
  }, [fetchPendingMine]);

  useEffect(() => {
    const onAdStatus = () => fetchPendingMine();
    window.addEventListener("fixitnow-ad-status-update", onAdStatus);
    return () =>
      window.removeEventListener("fixitnow-ad-status-update", onAdStatus);
  }, [fetchPendingMine]);

  const fetchAds = async () => {
    setLoading(true);
    try {
      const data = await apiRequest("/advertisements/active");
      setAds(data.data || []);
    } catch (err) {
      console.error("Failed to fetch ads:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const totalPages = Math.max(1, Math.ceil(ads.length / ADS_PER_PAGE));

  const getPageAds = useCallback(() => {
    const start = currentPage * ADS_PER_PAGE;
    return ads.slice(start, start + ADS_PER_PAGE);
  }, [ads, currentPage]);

  const bumpFile = (adId, delta) => {
    const ad = ads.find((a) => String(a.id || a._id) === String(adId));
    const len = ad?.adFileUrls?.length || 0;
    if (len <= 1) return;
    setFileIndexByAdId((prev) => {
      const cur = prev[adId] ?? 0;
      const next = (cur + delta + len) % len;
      return { ...prev, [adId]: next };
    });
  };

  useEffect(() => {
    if (ads.length <= ADS_PER_PAGE) return;
    const t = setInterval(() => {
      setCurrentPage((p) => (p + 1) % totalPages);
    }, 14000);
    return () => clearInterval(t);
  }, [ads.length, totalPages]);

  if (loading) {
    return null;
  }

  if (ads.length === 0) {
    return null;
  }

  const pageAds = getPageAds();

  return (
    <section className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-5 py-16">
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-scaleIn { animation: scaleIn 0.35s ease-out both; }
        .service-card { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {pendingMyAds.length > 0 && (
          <div className="mb-8 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/90 px-4 py-3 shadow-sm ring-1 ring-amber-100/80">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Clock size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-amber-900">
                  You have {pendingMyAds.length} ad{pendingMyAds.length > 1 ? "s" : ""} pending approval
                </p>
                <p className="mt-0.5 text-xs text-amber-800/90">
                  Scroll to &quot;Advertise With Us&quot; for status updates, or check your email notifications.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100">
            <Megaphone size={24} className="text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Featured Advertisements
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-slate-600">
            Trusted partners promoting services on Fix It Now.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pageAds.map((ad) => {
            const id = String(ad.id || ad._id);
            const fi = fileIndexByAdId[id] ?? 0;
            return (
              <AdCard
                key={id}
                ad={ad}
                fileIndex={fi}
                onPrevFile={() => bumpFile(id, -1)}
                onNextFile={() => bumpFile(id, 1)}
              />
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() =>
                setCurrentPage((p) => (p - 1 + totalPages) % totalPages)
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50"
            >
              <ChevronLeft size={18} />
              Previous
            </button>
            <span className="text-sm text-slate-500">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => (p + 1) % totalPages)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
