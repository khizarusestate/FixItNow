import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  Search,
  X,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Sparkles,
  Hammer,
  Zap,
  Droplets,
  Car,
  Monitor,
  Wrench,
  Lightbulb,
  Wind,
  Home,
  Paintbrush,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Banknote,
  Smartphone,
  ArrowRight,
  Upload,
  Clock,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { bookingService, servicesService } from "../services/api.js";
import { getActiveSessionRole } from "../utils/jwt.js";
import LocationPicker from "./LocationPicker.jsx";
import { geoFromUser, hasLocation } from "../utils/location.js";
import {
  buildPayToSummary,
  getEasypaisaMsisdn,
  getJazzcashMsisdn,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_VALUES,
} from "../utils/platformPayment.js";

// =======================
// CATEGORY ICONS
// =======================

const CATEGORY_ICONS = {
  Cleaning: Sparkles,
  "Home Repair": Hammer,
  Electrical: Zap,
  Plumbing: Droplets,
  Automotive: Car,
  "IT Support": Monitor,
  Carpentry: Wrench,
  Painting: Paintbrush,
  HVAC: Wind,
  Appliance: Lightbulb,
  "General Maintenance": Home,
};

const CATEGORY_COLORS = {
  Cleaning: "from-emerald-400 to-teal-500",
  "Home Repair": "from-orange-400 to-amber-500",
  Electrical: "from-yellow-400 to-orange-500",
  Plumbing: "from-blue-400 to-cyan-500",
  Automotive: "from-red-400 to-pink-500",
  "IT Support": "from-indigo-400 to-purple-500",
  Carpentry: "from-orange-400 to-red-500",
  Painting: "from-purple-400 to-pink-500",
  HVAC: "from-cyan-400 to-blue-500",
  Appliance: "from-green-400 to-emerald-500",
  "General Maintenance": "from-slate-400 to-gray-500",
};

// =======================
// ICON MAPPER
// =======================

const getIconComponent = (iconName) => {
  const icons = {
    Zap,
    Droplets,
    Car,
    Hammer,
    Wrench,
    Paintbrush,
    Wind,
    Lightbulb,
    Monitor,
    Home,
    Sparkles,
    CheckCircle,
  };

  return icons[iconName] || Wrench;
};

// =======================
// BOOKING FORM MODAL
// =======================

function BookingForm({ service, onClose, onSuccess }) {
  const { user } = useAuth();
  const receiptInputRef = useRef(null);

  const [geo, setGeo] = useState(() => geoFromUser(user));
  const [form, setForm] = useState({
    name: user?.fullName || user?.name || "",
    phone: user?.phone || user?.phoneNumber || "",
    email: user?.email || "",
    notes: "",
    serviceCategory: service?.category || "",
    paymentReceipt: null,
    paymentMethod: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receiptPreview, setReceiptPreview] = useState(null);

  useEffect(() => {
    if (user) {
      setGeo(geoFromUser(user));
      setForm((prev) => ({
        ...prev,
        name: user?.fullName || user?.name || "",
        phone: user?.phone || user?.phoneNumber || "",
        email: user?.email || "",
      }));
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const update = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }

    const preview = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      paymentReceipt: file,
    }));

    setReceiptPreview(preview);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError("Please fill all required fields.");
      return;
    }

    if (!form.paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (!form.paymentReceipt) {
      setError("Please upload payment receipt");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const formData = new FormData();

      formData.append("serviceId", service?.id);
      formData.append("serviceTitle", service?.title);
      formData.append("serviceCategory", service?.category);

      formData.append("name", form.name.trim());
      formData.append("phone", form.phone.trim());
      formData.append("email", form.email.trim());
      if (geo.location?.trim()) {
        formData.append("location", geo.location.trim());
        formData.append("address", geo.location.trim());
        if (geo.latitude != null) formData.append("latitude", String(geo.latitude));
        if (geo.longitude != null) formData.append("longitude", String(geo.longitude));
        if (geo.placeId) formData.append("placeId", geo.placeId);
      }
      formData.append("notes", form.notes.trim());
      formData.append("paymentMethod", form.paymentMethod);
      formData.append("payToSummary", buildPayToSummary(form.paymentMethod));

      formData.append("paymentReceipt", form.paymentReceipt);

      await bookingService.createBooking(formData);

      onSuccess();
    } catch (err) {
      console.error("Booking error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition-all";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-white">
                <Calendar size={24} />
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-orange-100">
                  Book Service
                </p>

                <h3 className="text-xl font-bold text-white">
                  {service?.title}
                </h3>
              </div>
            </div>

            <button
              onClick={onClose}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* PRICE */}
          {service?.price && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Banknote className="text-orange-600" size={20} />

                  <span className="text-sm font-semibold text-slate-700">
                    Service Price
                  </span>
                </div>

                <span className="text-2xl font-bold text-orange-600">
                  PKR {service.price}
                </span>
              </div>
            </div>
          )}

          {/* INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* NAME */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Name *
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className={`${inputCls} pl-10`}
                  required
                />
              </div>
            </div>

            {/* PHONE */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Phone Number *
              </label>

              <div className="relative">
                <Phone
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className={`${inputCls} pl-10`}
                  required
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email *
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  className={`${inputCls} pl-10`}
                  required
                />
              </div>
            </div>

            <LocationPicker
              label="Service location (optional)"
              value={geo}
              onChange={setGeo}
            />
          </div>

          {/* NOTES */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Notes
            </label>

            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              className={`resize-none ${inputCls}`}
            />
          </div>

          {/* PAYMENT METHOD */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Payment method <span className="text-red-500">*</span>
            </label>
            <select
              value={form.paymentMethod}
              onChange={(e) => update("paymentMethod", e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Select payment method</option>
              <option value={PAYMENT_METHOD_VALUES.EASYPAISA}>
                {PAYMENT_METHOD_LABELS[PAYMENT_METHOD_VALUES.EASYPAISA]}
              </option>
              <option value={PAYMENT_METHOD_VALUES.JAZZCASH}>
                {PAYMENT_METHOD_LABELS[PAYMENT_METHOD_VALUES.JAZZCASH]}
              </option>
            </select>
          </div>

          {form.paymentMethod === PAYMENT_METHOD_VALUES.EASYPAISA && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 flex gap-3">
              <Smartphone className="shrink-0 text-emerald-700 mt-0.5" size={20} />
              <div className="text-sm text-emerald-900">
                <p className="font-semibold">Pay via EasyPaisa</p>
                <p className="mt-1 text-emerald-800">
                  Send payment to this number:{" "}
                  <span className="font-mono font-bold">{getEasypaisaMsisdn()}</span>
                </p>
                <p className="mt-1 text-xs text-emerald-700/90">
                  Then upload your payment receipt below.
                </p>
              </div>
            </div>
          )}

          {form.paymentMethod === PAYMENT_METHOD_VALUES.JAZZCASH && (
            <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 flex gap-3">
              <Smartphone className="shrink-0 text-sky-700 mt-0.5" size={20} />
              <div className="text-sm text-sky-900">
                <p className="font-semibold">Pay via JazzCash</p>
                <p className="mt-1 text-sky-800">
                  Send payment to this number:{" "}
                  <span className="font-mono font-bold">{getJazzcashMsisdn()}</span>
                </p>
                <p className="mt-1 text-xs text-sky-700/90">
                  Then upload your payment receipt below.
                </p>
              </div>
            </div>
          )}

          {/* RECEIPT */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Payment receipt <span className="text-red-500">*</span>
            </label>

            <input
              ref={receiptInputRef}
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              className="sr-only"
              aria-hidden
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => receiptInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800 shadow-sm transition-all hover:bg-orange-100 hover:border-orange-300"
              >
                <Upload size={18} />
                {form.paymentReceipt ? "Change receipt" : "Upload receipt"}
              </button>

              {form.paymentReceipt && (
                <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                  {form.paymentReceipt.name}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-2">
              JPG or PNG, up to 5MB
            </p>

            {receiptPreview && (
              <div className="relative inline-block mt-3">
                <img
                  src={receiptPreview}
                  alt="Receipt preview"
                  className="w-28 h-28 object-cover rounded-lg border-2 border-orange-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (receiptPreview) {
                      URL.revokeObjectURL(receiptPreview);
                    }

                    setForm((prev) => ({
                      ...prev,
                      paymentReceipt: null,
                    }));

                    setReceiptPreview(null);
                    if (receiptInputRef.current) {
                      receiptInputRef.current.value = "";
                    }
                  }}
                  className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-md"
                  title="Remove receipt"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertTriangle className="text-red-500" size={20} />

              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-sm font-bold text-white disabled:opacity-60 hover:shadow-lg transition-all"
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Confirm Booking
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// =======================
// MAIN COMPONENT
// =======================

export default function BookingSection() {
  const { isAuthenticated, user } = useAuth();
  const { openModal } = useModal();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [page, setPage] = useState(1);

  const [services, setServices] = useState({});
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);

  // =======================
  // FETCH SERVICES
  // =======================

  const fetchCatalog = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // One request: categories + all active services (avoids N+1 and rate limits)
      const response = await servicesService.getAll();
      const payload = response?.data || {};
      const categoryList = Array.isArray(payload.categories)
        ? payload.categories
        : [];
      const allServices = Array.isArray(payload.services)
        ? payload.services
        : [];

      setCategories(categoryList);

      const servicesData = {};
      for (const cat of categoryList) {
        servicesData[cat] = [];
      }
      for (const s of allServices) {
        const cat = s?.category;
        if (!cat) continue;
        if (!servicesData[cat]) servicesData[cat] = [];
        servicesData[cat].push(s);
      }

      setServices(servicesData);
    } catch (err) {
      console.error("Fetch error:", err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load services",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated || user?.type !== "customer") {
      setPendingBookingCount(0);
      return;
    }
    let cancelled = false;
    bookingService
      .getMyBookings()
      .then((res) => {
        if (cancelled) return;
        const list = res?.data || [];
        setPendingBookingCount(list.filter((b) => b.status === "pending").length);
      })
      .catch(() => {
        if (!cancelled) setPendingBookingCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.type]);

  useEffect(() => {
    const role = getActiveSessionRole();
    if (role === "worker" || user?.type === "worker") {
      setLoading(false);
      return;
    }
    fetchCatalog();
  }, [fetchCatalog, user?.type]);

  // =======================
  // SELECT SERVICE
  // =======================

  const handleSelectService = useCallback(
    (service) => {
      if (isAuthenticated && user?.type === "customer" && !hasLocation(user)) {
        openModal("completeProfile");
        return;
      }

      const normalizedService = {
        id: service?.id || service?._id,
        title: service?.name || service?.title,
        category: service?.category,
        price: service?.price,
        description: service?.description || service?.text,
        icon: service?.icon,
      };

      setSelectedService(normalizedService);
    },
    [isAuthenticated, openModal, user?.type],
  );

  // =======================
  // FILTER SERVICES
  // =======================

  const sortServicesByName = useCallback((list) => {
    return [...list].sort((a, b) =>
      (a?.name || "").localeCompare(b?.name || "", undefined, {
        sensitivity: "base",
      }),
    );
  }, []);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();

    const collectAllServices = () => {
      const allServices = [];
      categories.forEach((cat) => {
        const catServices = services?.[cat] || [];
        catServices.forEach((s) => allServices.push(s));
      });
      return sortServicesByName(allServices);
    };

    // ALL SERVICES (no category selected)
    if (!q && !selectedCategory) {
      return collectAllServices();
    }

    // CATEGORY ONLY (no search)
    if (!q && selectedCategory) {
      return sortServicesByName(services?.[selectedCategory] || []);
    }

    // SEARCH INSIDE CATEGORY
    if (selectedCategory) {
      const categoryServices = services?.[selectedCategory] || [];

      return sortServicesByName(
        categoryServices.filter(
          (s) =>
            s?.name?.toLowerCase()?.includes(q) ||
            s?.description?.toLowerCase()?.includes(q),
        ),
      );
    }

    // SEARCH ALL CATEGORIES
    const allServices = [];

    categories.forEach((cat) => {
      const catServices = services?.[cat] || [];

      catServices.forEach((s) => {
        if (
          s?.name?.toLowerCase()?.includes(q) ||
          s?.description?.toLowerCase()?.includes(q)
        ) {
          allServices.push(s);
        }
      });
    });

    return sortServicesByName(allServices);
  }, [categories, search, selectedCategory, services, sortServicesByName]);

  // Reset paging when filters change
  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  // Rows-based pagination (2 rows, then 2 rows, then 3 rows...)
  const [gridCols, setGridCols] = useState(() => {
    if (typeof window === "undefined") return 1;
    if (window.matchMedia("(min-width: 1024px)").matches) return 3;
    if (window.matchMedia("(min-width: 640px)").matches) return 2;
    return 1;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mLg = window.matchMedia("(min-width: 1024px)");
    const mSm = window.matchMedia("(min-width: 640px)");
    const update = () => {
      setGridCols(mLg.matches ? 3 : mSm.matches ? 2 : 1);
    };
    update();
    mLg.addEventListener?.("change", update);
    mSm.addEventListener?.("change", update);
    return () => {
      mLg.removeEventListener?.("change", update);
      mSm.removeEventListener?.("change", update);
    };
  }, []);

  const rowsForPage = useCallback((p) => (p <= 2 ? 2 : 3), []);
  const itemsForPage = useCallback(
    (p) => rowsForPage(p) * gridCols,
    [gridCols, rowsForPage],
  );
  const startIndexForPage = useCallback(
    (p) => {
      let start = 0;
      for (let i = 1; i < p; i++) start += itemsForPage(i);
      return start;
    },
    [itemsForPage],
  );
  const totalPages = useMemo(() => {
    const total = filteredServices.length;
    if (!total) return 1;
    let p = 1;
    let covered = 0;
    while (covered < total && p < 200) {
      covered += itemsForPage(p);
      p++;
    }
    return Math.max(1, p - 1);
  }, [filteredServices.length, itemsForPage]);

  const currentStart = startIndexForPage(page);
  const currentEnd = currentStart + itemsForPage(page);
  const pagedServices = useMemo(
    () => filteredServices.slice(currentStart, currentEnd),
    [filteredServices, currentEnd, currentStart],
  );

  // Workers don't book through this section — hide UI only after all hooks run
  // (early return above caused "Rendered fewer hooks than expected".)
  if (user?.type === "worker") {
    return null;
  }

  return (
    <section id="booking" className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-5 py-20">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }

        .service-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .service-card:hover {
          transform: translateY(-4px);
        }

        .category-btn {
          transition: all 0.3s ease;
        }

        .category-btn.active {
          transform: scale(1.05);
        }
      `}</style>

      <div className="mx-auto max-w-7xl">
        {isAuthenticated && user?.type === "customer" && pendingBookingCount > 0 && (
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-3 shadow-sm ring-1 ring-amber-100/80">
            <div className="flex items-start gap-3 min-w-0">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <Clock size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-bold text-amber-900">
                  {pendingBookingCount} booking{pendingBookingCount > 1 ? "s" : ""} awaiting admin confirmation
                </p>
                <p className="text-xs text-amber-800/90 mt-0.5">
                  You can track status anytime from My Bookings.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent("open-my-bookings"))}
              className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
            >
              View bookings
            </button>
          </div>
        )}

        {/* HEADER */}
        <div className="text-center mb-12 animate-fadeIn">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3">
            Find the Perfect Service
          </h2>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Browse our collection of professional services and book with
            confidence
          </p>
        </div>

        {/* SEARCH */}
        <div className="max-w-3xl mx-auto mb-12 animate-slideUp">
          <div className="relative">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />

            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border-2 border-slate-200 pl-14 pr-6 py-4 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition-all hover:border-slate-300"
            />
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>

              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>
            </div>

            <p className="text-slate-600 font-medium">Loading services...</p>
          </div>
        )}

        {/* ERROR */}
        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {/* CONTENT — restaurant-style menu */}
        {!loading && !error && (
          <div className="rounded-2xl border-2 border-orange-100 bg-white shadow-xl overflow-hidden animate-slideUp">
            <div className="flex min-h-[420px] max-h-[min(78vh,760px)]">
              {/* Categories sidebar (left on mobile & desktop) */}
              <nav
                aria-label="Service categories"
                className="w-[5.5rem] sm:w-36 lg:w-44 shrink-0 border-r border-orange-100 bg-gradient-to-b from-amber-50 via-orange-50/80 to-white overflow-y-auto"
              >
                <p className="px-2 py-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-orange-900/70 text-center sm:text-left sm:px-3 border-b border-orange-100/80">
                  Menu
                </p>
                <div className="p-1.5 sm:p-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSearch("");
                    }}
                    className={`category-btn w-full rounded-lg px-1.5 py-2.5 sm:px-3 sm:py-2.5 text-[10px] sm:text-xs font-semibold transition-all text-center sm:text-left ${
                      !selectedCategory
                        ? "bg-orange-500 text-white shadow-md"
                        : "text-slate-700 hover:bg-orange-100/60"
                    }`}
                  >
                    All
                  </button>
                  {categories.map((category) => {
                    const CategoryIcon = CATEGORY_ICONS[category] || Wrench;
                    const isActive = selectedCategory === category;
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => setSelectedCategory(category)}
                        className={`category-btn w-full rounded-lg px-1.5 py-2.5 sm:px-3 sm:py-2.5 transition-all flex flex-col sm:flex-row items-center sm:gap-2 gap-0.5 ${
                          isActive
                            ? "bg-orange-500 text-white shadow-md"
                            : "text-slate-700 hover:bg-orange-100/60"
                        }`}
                      >
                        <CategoryIcon size={14} className="shrink-0" />
                        <span className="text-[9px] sm:text-xs font-semibold leading-tight text-center sm:text-left line-clamp-2">
                          {category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </nav>

              {/* Menu items */}
              <div className="flex-1 flex flex-col min-w-0 bg-[#fffdf9]">
                <div className="sticky top-0 z-10 border-b border-orange-100/80 bg-white/95 backdrop-blur px-4 py-3 sm:px-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                    Services
                  </p>
                  <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate">
                    {selectedCategory || "All Services"}
                  </h3>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {filteredServices.length > 0 ? (
                    <ul className="divide-y divide-orange-100/60">
                      {pagedServices.map((service, idx) => {
                        const ServiceIcon = getIconComponent(service?.icon);
                        const catColor =
                          CATEGORY_COLORS[service?.category] ||
                          "from-slate-400 to-slate-600";
                        return (
                          <li
                            key={service?._id || service?.id}
                            className="animate-scaleIn"
                            style={{ animationDelay: `${idx * 20}ms` }}
                          >
                            <div className="flex items-start gap-3 sm:gap-4 px-3 py-4 sm:px-6 sm:py-5 hover:bg-orange-50/40 transition-colors">
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br ${catColor} flex items-center justify-center text-white shrink-0`}
                              >
                                <ServiceIcon size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                  <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                                    {service?.name}
                                  </h4>
                                  {service?.price > 0 && (
                                    <span className="font-bold text-orange-600 text-sm whitespace-nowrap">
                                      PKR {service.price}
                                    </span>
                                  )}
                                </div>
                                {service?.description && (
                                  <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                    {service.description}
                                  </p>
                                )}
                                {service?.category && (
                                  <p className="mt-1 text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                                    {service.category}
                                  </p>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleSelectService(service)}
                                className="shrink-0 flex items-center gap-1 px-3 py-2 sm:px-4 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-all text-xs font-bold group mt-0.5"
                              >
                                Book
                                <ArrowRight
                                  size={14}
                                  className="group-hover:translate-x-0.5 transition-transform hidden sm:block"
                                />
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <div className="text-center py-16 px-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Search className="text-slate-400" size={28} />
                      </div>
                      <p className="text-slate-600 font-medium">
                        {search
                          ? "No services match your search"
                          : selectedCategory
                            ? "No services found in this category"
                            : "No services available"}
                      </p>
                    </div>
                  )}
                </div>

                {filteredServices.length > 0 && totalPages > 1 && (
                  <div className="border-t border-orange-100 px-4 py-3 flex items-center justify-center gap-3 bg-white">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Prev
                    </button>
                    <span className="text-xs font-semibold text-slate-600">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedService && (
        <BookingForm
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onSuccess={() => {
            setSelectedService(null);

            setBookingDone(true);

            if (isAuthenticated && user?.type === "customer") {
              bookingService
                .getMyBookings()
                .then((res) => {
                  const list = res?.data || [];
                  setPendingBookingCount(
                    list.filter((b) => b.status === "pending").length,
                  );
                })
                .catch(() => {});
            }

            setTimeout(() => {
              setBookingDone(false);
            }, 3000);
          }}
        />
      )}

      {/* SUCCESS TOAST */}
      {bookingDone && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] animate-slideUp">
          <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-white shadow-2xl">
            <CheckCircle size={24} />

            <span className="font-semibold">
              Booking submitted successfully!
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
