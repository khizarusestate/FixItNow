import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

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
  Phone,
  Mail,
  User,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import PhoneInput from "./shared/PhoneInput.jsx";
import { isPhoneValid } from "../utils/phoneValidation.js";
import { useAppData } from "../context/AppDataContext";
import { shapeServiceCatalog } from "../utils/catalogShape";
import { useModal } from "../context/ModalContext";
import { bookingService, servicesService } from "../services/api.js";
import { getActiveSessionRole } from "../utils/jwt.js";
import LocationPicker from "./LocationPicker.jsx";
import { geoFromUser, hasLocation } from "../utils/location.js";
import {
  loadFormDraft,
  saveFormDraft,
  clearFormDraft,
} from "../utils/formDraft.js";
import MenuPagination, {
  MENU_PAGE_SIZE,
} from "./shared/MenuPagination.jsx";
import TermsAgreement from "./shared/TermsAgreement.jsx";
import { useI18n } from "../context/I18nContext.jsx";

/* =========================================================
   CATEGORY IMAGES
========================================================= */

const CATEGORY_IMAGES = {
  /* AC / HVAC */
  "AC Repair":
    "https://images.unsplash.com/photo-1631545806609-6e0a6c0d8f3f?auto=format&fit=crop&w=1200&q=85",

  "Air Conditioning":
    "https://images.unsplash.com/photo-1631545806609-6e0a6c0d8f3f?auto=format&fit=crop&w=1200&q=85",

  HVAC:
    "https://images.unsplash.com/photo-1631545806609-6e0a6c0d8f3f?auto=format&fit=crop&w=1200&q=85",

  /* Plumbing */
  Plumbing:
    "https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1200&q=85",

  /* Electrical */
  Electrical:
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=85",

  /* Automotive */
  "Car Repair":
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=85",

  Automotive:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=85",

  Mechanic:
    "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=1200&q=85",

  /* Painting */
  Painting:
    "https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1200&q=85",

  /* Cleaning */
  Cleaning:
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",

  "Home Cleaning":
    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=85",

  /* Carpentry */
  Carpentry:
    "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=1200&q=85",

  Woodworking:
    "https://images.unsplash.com/photo-1601058268499-e52658b8bb88?auto=format&fit=crop&w=1200&q=85",

  /* Home Repair */
  "Home Repair":
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85",

  Handyman:
    "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85",

  /* Gardening */
  Gardening:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85",

  Landscaping:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=85",

  /* Pest Control */
  "Pest Control":
    "https://images.unsplash.com/photo-1628151015968-3a7b9a5c9c6e?auto=format&fit=crop&w=1200&q=85",

  /* Appliances */
  "Appliance Repair":
    "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=85",

  /* Electronics */
  Electronics:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=85",

  /* Computer */
  "Computer Repair":
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=85",

  "Laptop Repair":
    "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1200&q=85",

  /* Mobile */
  "Mobile Repair":
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=85",

  "Phone Repair":
    "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1200&q=85",

  /* Locksmith */
  Locksmith:
    "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=1200&q=85",

  /* Moving */
  Moving:
    "https://images.unsplash.com/photo-1600510349682-d24e6f9c3f1b?auto=format&fit=crop&w=1200&q=85",

  /* Car Wash */
  "Car Wash":
    "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=1200&q=85",

  /* Bike */
  "Bike Repair":
    "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1200&q=85",

  /* Welding */
  Welding:
    "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=85",

  /* Roofing */
  Roofing:
    "https://images.unsplash.com/photo-1632759145351-1d592919f522?auto=format&fit=crop&w=1200&q=85",

  /* Flooring */
  Flooring:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=85",

  /* Laundry */
  Laundry:
    "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=1200&q=85",

  /* Beauty */
  Beauty:
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=85",

  /* Salon */
  Salon:
    "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&q=85",
};

/* =========================================================
   FALLBACK IMAGE
========================================================= */

const FALLBACK_CATEGORY_IMAGE =
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1200&q=85";

/* =========================================================
   CATEGORY IMAGE RESOLVER
========================================================= */

const getCategoryImage = (category) => {
  if (!category) {
    return FALLBACK_CATEGORY_IMAGE;
  }

  const normalized = String(category)
    .toLowerCase()
    .trim();

  /* Exact match */
  if (CATEGORY_IMAGES[category]) {
    return CATEGORY_IMAGES[category];
  }

  /* Case-insensitive exact match */
  const exactNormalizedKey = Object.keys(
    CATEGORY_IMAGES,
  ).find(
    (key) =>
      key.toLowerCase().trim() ===
      normalized,
  );

  if (exactNormalizedKey) {
    return CATEGORY_IMAGES[
      exactNormalizedKey
    ];
  }

  /* AC / HVAC */
  if (
    normalized.includes("air condition") ||
    normalized.includes("air-conditioning") ||
    normalized.includes("aircon") ||
    normalized.includes("a/c") ||
    normalized === "ac" ||
    normalized.includes("hvac") ||
    normalized.includes("cooling") ||
    normalized.includes("cooler")
  ) {
    return CATEGORY_IMAGES["AC Repair"];
  }

  /* Plumbing */
  if (
    normalized.includes("plumb") ||
    normalized.includes("pipe") ||
    normalized.includes("drain") ||
    normalized.includes("water") ||
    normalized.includes("sanitary")
  ) {
    return CATEGORY_IMAGES["Plumbing"];
  }

  /* Electrical */
  if (
    normalized.includes("electric") ||
    normalized.includes("wiring") ||
    normalized.includes("electrician") ||
    normalized.includes("light") ||
    normalized.includes("power")
  ) {
    return CATEGORY_IMAGES["Electrical"];
  }

  /* Automotive */
  if (
    normalized.includes("car") ||
    normalized.includes("auto") ||
    normalized.includes("vehicle") ||
    normalized.includes("mechanic") ||
    normalized.includes("automotive")
  ) {
    return CATEGORY_IMAGES["Car Repair"];
  }

  /* Painting */
  if (
    normalized.includes("paint") ||
    normalized.includes("wall paint") ||
    normalized.includes("wallpaper") ||
    normalized.includes("decor")
  ) {
    return CATEGORY_IMAGES["Painting"];
  }

  /* Cleaning */
  if (
    normalized.includes("clean") ||
    normalized.includes("maid") ||
    normalized.includes("housekeeping") ||
    normalized.includes("janitor")
  ) {
    return CATEGORY_IMAGES["Cleaning"];
  }

  /* Carpentry */
  if (
    normalized.includes("carpent") ||
    normalized.includes("wood") ||
    normalized.includes("furniture") ||
    normalized.includes("cabinet")
  ) {
    return CATEGORY_IMAGES["Carpentry"];
  }

  /* Gardening */
  if (
    normalized.includes("garden") ||
    normalized.includes("gardener") ||
    normalized.includes("landscap") ||
    normalized.includes("lawn") ||
    normalized.includes("plant")
  ) {
    return CATEGORY_IMAGES["Gardening"];
  }

  /* Pest Control */
  if (
    normalized.includes("pest") ||
    normalized.includes("insect") ||
    normalized.includes("termite") ||
    normalized.includes("mosquito")
  ) {
    return CATEGORY_IMAGES["Pest Control"];
  }

  /* Appliance Repair */
  if (
    normalized.includes("appliance") ||
    normalized.includes("refrigerator") ||
    normalized.includes("fridge") ||
    normalized.includes("washing machine") ||
    normalized.includes("microwave")
  ) {
    return CATEGORY_IMAGES["Appliance Repair"];
  }

  /* Computer / Laptop */
  if (
    normalized.includes("computer") ||
    normalized.includes("laptop") ||
    normalized.includes("pc") ||
    normalized.includes("desktop")
  ) {
    return CATEGORY_IMAGES["Computer Repair"];
  }

  /* Mobile / Phone */
  if (
    normalized.includes("mobile") ||
    normalized.includes("phone") ||
    normalized.includes("smartphone") ||
    normalized.includes("iphone") ||
    normalized.includes("android")
  ) {
    return CATEGORY_IMAGES["Mobile Repair"];
  }

  /* Electronics */
  if (
    normalized.includes("electronic") ||
    normalized.includes("circuit") ||
    normalized.includes("gadget")
  ) {
    return CATEGORY_IMAGES["Electronics"];
  }

  /* Car Wash */
  if (
    normalized.includes("car wash") ||
    normalized.includes("carwash") ||
    normalized.includes("detailing") ||
    normalized.includes("vehicle wash")
  ) {
    return CATEGORY_IMAGES["Car Wash"];
  }

  /* Bike */
  if (
    normalized.includes("bike") ||
    normalized.includes("motorcycle") ||
    normalized.includes("motorbike")
  ) {
    return CATEGORY_IMAGES["Bike Repair"];
  }

  /* Welding */
  if (
    normalized.includes("weld") ||
    normalized.includes("fabrication") ||
    normalized.includes("metal work")
  ) {
    return CATEGORY_IMAGES["Welding"];
  }

  /* Roofing */
  if (
    normalized.includes("roof") ||
    normalized.includes("roofing")
  ) {
    return CATEGORY_IMAGES["Roofing"];
  }

  /* Flooring */
  if (
    normalized.includes("floor") ||
    normalized.includes("flooring") ||
    normalized.includes("tile") ||
    normalized.includes("tiles")
  ) {
    return CATEGORY_IMAGES["Flooring"];
  }

  /* Laundry */
  if (
    normalized.includes("laundry") ||
    normalized.includes("clothes") ||
    normalized.includes("cloth wash") ||
    normalized.includes("dry clean")
  ) {
    return CATEGORY_IMAGES["Laundry"];
  }

  /* Beauty / Salon */
  if (
    normalized.includes("beauty") ||
    normalized.includes("salon") ||
    normalized.includes("hair") ||
    normalized.includes("barber") ||
    normalized.includes("makeup")
  ) {
    return CATEGORY_IMAGES["Beauty"];
  }

  /* Locksmith */
  if (
    normalized.includes("lock") ||
    normalized.includes("locksmith") ||
    normalized.includes("key")
  ) {
    return CATEGORY_IMAGES["Locksmith"];
  }

  /* Moving */
  if (
    normalized.includes("moving") ||
    normalized.includes("mover") ||
    normalized.includes("shifting") ||
    normalized.includes("relocation")
  ) {
    return CATEGORY_IMAGES["Moving"];
  }

  /* Generic home repair */
  if (
    normalized.includes("repair") ||
    normalized.includes("maintenance") ||
    normalized.includes("handyman") ||
    normalized.includes("home")
  ) {
    return CATEGORY_IMAGES["Home Repair"];
  }

  return FALLBACK_CATEGORY_IMAGE;
};

/* =========================================================
   SERVICE ICON MAPPER
========================================================= */

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

/* =========================================================
   BOOKING FORM MODAL
========================================================= */

function BookingForm({
  service,
  onClose,
  onSuccess,
}) {
  const { t } = useI18n();
  const { user, isAuthenticated } =
    useAuth();

  const draftKey = `fixitnow_draft_booking_${
    service?.id || "service"
  }`;

  const savedDraft =
    loadFormDraft(draftKey, {});

  const hadDraft = Boolean(
    savedDraft.name ||
      savedDraft.email ||
      savedDraft.phone,
  );

  const [geo, setGeo] = useState(() =>
    savedDraft.geo
      ? savedDraft.geo
      : geoFromUser(user),
  );

  const [form, setForm] = useState({
    name:
      savedDraft.name ??
      user?.fullName ??
      user?.name ??
      "",

    phone:
      savedDraft.phone ??
      user?.phone ??
      user?.phoneNumber ??
      "",

    email:
      savedDraft.email ??
      user?.email ??
      "",

    notes: savedDraft.notes ?? "",

    serviceCategory:
      service?.category || "",
  });

  const [termsAgreed, setTermsAgreed] =
    useState(
      savedDraft.termsAgreed ?? false,
    );

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!user || hadDraft) return;

    setGeo(geoFromUser(user));

    setForm((prev) => ({
      ...prev,

      name:
        user?.fullName ||
        user?.name ||
        prev.name,

      phone:
        user?.phone ||
        user?.phoneNumber ||
        prev.phone,

      email:
        user?.email ||
        prev.email,
    }));
  }, [user, hadDraft]);

  useEffect(() => {
    saveFormDraft(draftKey, {
      name: form.name,
      phone: form.phone,
      email: form.email,
      notes: form.notes,
      geo,
      termsAgreed,
    });
  }, [
    draftKey,
    form,
    geo,
    termsAgreed,
  ]);

  const handleClose = () => {
    saveFormDraft(draftKey, {
      name: form.name,
      phone: form.phone,
      email: form.email,
      notes: form.notes,
      geo,
      termsAgreed,
    });

    onClose();
  };

  const update = (
    key,
    value,
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const submitBooking = async () => {
    if (
      !form.name.trim() ||
      !form.phone.trim() ||
      !form.email.trim()
    ) {
      setError(
        t("booking.fillRequired"),
      );
      return;
    }

    if (!isPhoneValid(form.phone)) {
      setError(
        t("booking.invalidPhone"),
      );
      return;
    }

    if (!hasLocation(geo)) {
      setError(
        t("booking.selectLocation"),
      );
      return;
    }

    if (!termsAgreed) {
      setError(
        t("booking.termsRequired"),
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        serviceId: service?.id,
        serviceTitle: service?.title,
        serviceCategory:
          service?.category,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        notes: form.notes.trim(),
      };

      if (geo.location?.trim()) {
        payload.location =
          geo.location.trim();

        payload.address =
          geo.location.trim();

        if (geo.latitude != null) {
          payload.latitude =
            geo.latitude;
        }

        if (geo.longitude != null) {
          payload.longitude =
            geo.longitude;
        }

        if (geo.placeId) {
          payload.placeId =
            geo.placeId;
        }
      }

      await bookingService.createBooking(
        payload,
        {
          asGuest: !(
            isAuthenticated &&
            user?.type === "customer"
          ),
        },
      );

      clearFormDraft(draftKey);

      onSuccess();
    } catch (err) {
      console.error(
        "Booking error:",
        err,
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          t("booking.failed"),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!termsAgreed) {
      setError(
        t("booking.termsRequired"),
      );
      return;
    }

    await submitBooking();
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
                  {t("booking.title")}
                </p>

                <h3 className="text-xl font-bold text-white">
                  {service?.title}
                </h3>
              </div>
            </div>

            <button
              onClick={handleClose}
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white hover:bg-white/30 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-5"
        >
          {/* PRICE */}

          {service?.price > 0 && (
            <div className="rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                {t("booking.price")}
              </p>

              <p className="mt-1 text-2xl font-bold text-orange-600">
                PKR {service.price}
              </p>
            </div>
          )}

          {/* INPUTS */}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* NAME */}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("booking.name")} *
              </label>

              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    update(
                      "name",
                      e.target.value,
                    )
                  }
                  className={`${inputCls} pl-10`}
                  required
                />
              </div>
            </div>

            {/* PHONE */}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("booking.phone")} *
              </label>

              <PhoneInput
                value={form.phone}
                onChange={(v) =>
                  update("phone", v)
                }
                required
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {t("booking.email")} *
              </label>

              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    update(
                      "email",
                      e.target.value,
                    )
                  }
                  className={`${inputCls} pl-10`}
                  required
                />
              </div>
            </div>

            <LocationPicker
              label={`${t(
                "booking.location",
              )} *`}
              value={geo}
              onChange={setGeo}
            />
          </div>

          {/* NOTES */}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t("booking.notes")}
            </label>

            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) =>
                update(
                  "notes",
                  e.target.value,
                )
              }
              className={`resize-none ${inputCls}`}
            />
          </div>

          {/* ERROR */}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
              <AlertTriangle
                className="text-red-500"
                size={20}
              />

              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          )}

          <TermsAgreement
            checked={termsAgreed}
            onChange={(v) => {
              setTermsAgreed(v);
              setError("");
            }}
          />

          <button
            type="submit"
            disabled={
              submitting ||
              !termsAgreed
            }
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-sm font-bold text-white disabled:opacity-60 hover:shadow-lg transition-all"
          >
            {submitting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                {t("booking.submit")}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function BookingSection() {
  const { isAuthenticated, user } =
    useAuth();

  const {
    catalog: bootstrapCatalog,
  } = useAppData();

  const { openModal } =
    useModal();

  const [search, setSearch] =
    useState("");

  const [
    selectedCategory,
    setSelectedCategory,
  ] = useState(null);

  const [
    selectedService,
    setSelectedService,
  ] = useState(null);

  const [
    categoryPage,
    setCategoryPage,
  ] = useState(1);

  const [
    servicePage,
    setServicePage,
  ] = useState(1);

  const [services, setServices] =
    useState({});

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    bookingDone,
    setBookingDone,
  ] = useState(false);

  const [
    pendingBookingCount,
    setPendingBookingCount,
  ] = useState(0);

  /* =======================================================
     FETCH SERVICES
  ======================================================= */

  const fetchCatalog =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await servicesService.getAll();

        const shaped =
          shapeServiceCatalog(
            response,
          );

        setCategories(
          shaped.categories,
        );

        setServices(
          shaped.services,
        );
      } catch (err) {
        console.error(
          "Fetch error:",
          err,
        );

        setError(
          err?.response?.data
            ?.message ||
            err?.message ||
            "Failed to load services",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  /* =======================================================
     PENDING BOOKINGS
  ======================================================= */

  useEffect(() => {
    if (
      !isAuthenticated ||
      user?.type !== "customer"
    ) {
      setPendingBookingCount(0);
      return;
    }

    let cancelled = false;

    bookingService
      .getMyBookings()
      .then((res) => {
        if (cancelled) return;

        const list =
          res?.data || [];

        setPendingBookingCount(
          list.filter(
            (b) =>
              b.status ===
                "pending" ||
              b.status ===
                "pending-confirmation",
          ).length,
        );
      })
      .catch(() => {
        if (!cancelled) {
          setPendingBookingCount(0);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    isAuthenticated,
    user?.type,
  ]);

  /* =======================================================
     INITIAL CATALOG
  ======================================================= */

  useEffect(() => {
    const role =
      getActiveSessionRole();

    if (
      role === "worker" ||
      user?.type === "worker"
    ) {
      setLoading(false);
      return;
    }

    if (
      bootstrapCatalog?.categories
        ?.length
    ) {
      setCategories(
        bootstrapCatalog.categories,
      );

      setServices(
        bootstrapCatalog.services ||
          {},
      );

      setLoading(false);
      setError("");

      return;
    }

    fetchCatalog();
  }, [
    fetchCatalog,
    user?.type,
    bootstrapCatalog,
  ]);

  /* =======================================================
     SELECT SERVICE
  ======================================================= */

  const handleSelectService =
    useCallback(
      (service) => {
        const normalizedService =
          {
            id:
              service?.id ||
              service?._id,

            title:
              service?.name ||
              service?.title,

            category:
              service?.category,

            price:
              service?.price,

            description:
              service?.description ||
              service?.text,

            icon:
              service?.icon,
          };

        if (
          isAuthenticated &&
          user?.type === "customer" &&
          !hasLocation(user)
        ) {
          openModal(
            "completeProfile",
          );

          return;
        }

        setSelectedService(
          normalizedService,
        );
      },
      [
        isAuthenticated,
        openModal,
        user?.type,
        user?.location,
        user?.address,
        user?.serviceArea,
      ],
    );

  /* =======================================================
     CUSTOM SERVICE EVENT
  ======================================================= */

  useEffect(() => {
    const handler = (e) => {
      const service =
        e?.detail?.service;

      if (service) {
        handleSelectService(
          service,
        );
      }
    };

    window.addEventListener(
      "fixitnow:select-service",
      handler,
    );

    return () =>
      window.removeEventListener(
        "fixitnow:select-service",
        handler,
      );
  }, [handleSelectService]);

  /* =======================================================
     SORT
  ======================================================= */

  const sortServicesByName =
    useCallback((list) => {
      return [...list].sort(
        (a, b) =>
          (a?.name || "").localeCompare(
            b?.name || "",
            undefined,
            {
              sensitivity:
                "base",
            },
          ),
      );
    }, []);

  /* =======================================================
     BROWSING STATE
  ======================================================= */

  const browsingServices =
    Boolean(
      selectedCategory ||
        search.trim(),
    );

  /* =======================================================
     CATEGORY COUNTS
  ======================================================= */

  const categoryCounts =
    useMemo(() => {
      const counts = {};

      categories.forEach(
        (cat) => {
          counts[cat] = (
            services?.[cat] || []
          ).length;
        },
      );

      return counts;
    }, [
      categories,
      services,
    ]);

  /* =======================================================
     FILTER SERVICES
  ======================================================= */

  const filteredServices =
    useMemo(() => {
      const q =
        search
          .trim()
          .toLowerCase();

      if (!browsingServices) {
        return [];
      }

      const matchesQuery =
        (s) =>
          !q ||
          s?.name
            ?.toLowerCase()
            ?.includes(q) ||
          s?.description
            ?.toLowerCase()
            ?.includes(q);

      if (selectedCategory) {
        return sortServicesByName(
          (
            services?.[
              selectedCategory
            ] || []
          ).filter(matchesQuery),
        );
      }

      const allServices = [];

      categories.forEach(
        (cat) => {
          (
            services?.[cat] || []
          ).forEach((s) => {
            if (matchesQuery(s)) {
              allServices.push(s);
            }
          });
        },
      );

      return sortServicesByName(
        allServices,
      );
    }, [
      browsingServices,
      categories,
      search,
      selectedCategory,
      services,
      sortServicesByName,
    ]);

  /* =======================================================
     CATEGORY NAVIGATION
  ======================================================= */

  const openCategory =
    useCallback((category) => {
      setSelectedCategory(
        category,
      );

      setSearch("");
      setServicePage(1);
    }, []);

  const backToCategories =
    useCallback(() => {
      setSelectedCategory(null);
      setSearch("");
      setServicePage(1);
    }, []);

  useEffect(() => {
    setServicePage(1);
  }, [
    search,
    selectedCategory,
  ]);

  /* =======================================================
     CATEGORY PAGINATION
  ======================================================= */

  const categoryTotalPages =
    useMemo(
      () =>
        Math.max(
          1,
          Math.ceil(
            categories.length /
              MENU_PAGE_SIZE,
          ),
        ),
      [categories.length],
    );

  const pagedCategories =
    useMemo(() => {
      const start =
        (categoryPage - 1) *
        MENU_PAGE_SIZE;

      return categories.slice(
        start,
        start + MENU_PAGE_SIZE,
      );
    }, [
      categories,
      categoryPage,
    ]);

  useEffect(() => {
    if (
      categoryPage >
      categoryTotalPages
    ) {
      setCategoryPage(
        categoryTotalPages,
      );
    }
  }, [
    categoryPage,
    categoryTotalPages,
  ]);

  /* =======================================================
     SERVICE PAGINATION
  ======================================================= */

  const serviceTotalPages =
    useMemo(
      () =>
        Math.max(
          1,
          Math.ceil(
            filteredServices.length /
              MENU_PAGE_SIZE,
          ),
        ),
      [filteredServices.length],
    );

  const pagedServices =
    useMemo(() => {
      const start =
        (servicePage - 1) *
        MENU_PAGE_SIZE;

      return filteredServices.slice(
        start,
        start + MENU_PAGE_SIZE,
      );
    }, [
      filteredServices,
      servicePage,
    ]);

  useEffect(() => {
    if (
      servicePage >
      serviceTotalPages
    ) {
      setServicePage(
        serviceTotalPages,
      );
    }
  }, [
    servicePage,
    serviceTotalPages,
  ]);

  /* =======================================================
     WORKER
  ======================================================= */

  if (user?.type === "worker") {
    return null;
  }

  return (
    <section
      id="booking"
      className="bg-gradient-to-br from-slate-50 via-white to-orange-50/30 px-5 py-20"
    >
      <style>{`

        @keyframes fadeIn {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
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
          transition:
            all 0.3s
            cubic-bezier(
              0.4,
              0,
              0.2,
              1
            );
        }

        .service-card:hover {
          transform: translateY(-4px);
        }

        .category-btn {
          transition:
            all 0.3s ease;
        }

        .category-btn.active {
          transform: scale(1.05);
        }

      `}</style>

      <div className="mx-auto max-w-7xl">

        {/* PENDING BOOKINGS */}

        {isAuthenticated &&
          user?.type === "customer" &&
          pendingBookingCount > 0 && (
            <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/80 px-4 py-3 shadow-sm ring-1 ring-amber-100/80">

              <div className="flex items-start gap-3 min-w-0">

                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Clock size={18} />
                </span>

                <div className="min-w-0">

                  <p className="text-sm font-bold text-amber-900">
                    {pendingBookingCount}{" "}
                    booking
                    {pendingBookingCount >
                    1
                      ? "s"
                      : ""}{" "}
                    awaiting admin
                    confirmation
                  </p>

                  <p className="text-xs text-amber-800/90 mt-0.5">
                    You can track status
                    anytime from My
                    Bookings.
                  </p>

                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  window.dispatchEvent(
                    new CustomEvent(
                      "open-my-bookings",
                    ),
                  )
                }
                className="shrink-0 rounded-lg bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition-colors"
              >
                View bookings
              </button>
            </div>
          )}

        {/* HEADER */}

        <div className="text-center mb-12 animate-fadeIn">

          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-3">
            Find the Perfect
            Service
          </h2>

          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Browse our collection
            of professional
            services and book with
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
              placeholder={
                selectedCategory
                  ? `Search in ${selectedCategory}...`
                  : "Search all services..."
              }
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value,
                );

                setServicePage(1);
              }}
              className="w-full rounded-full border-2 border-slate-200 pl-14 pr-6 py-4 text-base outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white transition-all hover:border-slate-300"
            />

          </div>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-8 sm:py-12">

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">

              {[...Array(6)].map(
                (_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100"
                  >

                    <div className="w-full h-28 bg-slate-200 rounded-xl mb-3 animate-pulse" />

                    <div className="h-4 bg-slate-200 rounded animate-pulse mb-2" />

                    <div className="h-3 bg-slate-100 rounded animate-pulse w-3/4" />

                  </div>
                ),
              )}

            </div>

          </div>
        )}

        {/* ERROR */}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">

            <p className="text-red-700 font-medium">
              {error}
            </p>

          </div>
        )}

        {/* CONTENT */}

        {!loading &&
          !error && (
            <div className="animate-slideUp w-full">

              {/* CATEGORY VIEW */}

              {!browsingServices ? (
                <div className="py-2 sm:py-4">

                  <div className="mb-8 text-center sm:text-left">

                    <h3 className="text-2xl sm:text-3xl font-bold text-blue-900">
                      Choose a category
                    </h3>

                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:gap-5">

                    {pagedCategories.map(
                      (
                        category,
                        idx,
                      ) => {
                        const categoryImage =
                          getCategoryImage(
                            category,
                          );

                        return (
                          <button
                            key={
                              category
                            }
                            type="button"
                            onClick={() =>
                              openCategory(
                                category,
                              )
                            }
                            aria-label={`Open ${category}`}
                            className="category-btn group relative overflow-hidden text-left rounded-2xl bg-white min-h-[190px] sm:min-h-[220px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all animate-scaleIn"
                            style={{
                              animationDelay: `${idx * 40}ms`,
                            }}
                          >

                            {/* IMAGE */}

                            <img
                              src={
                                categoryImage
                              }
                              alt={`${category} service`}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                              onError={(
                                e,
                              ) => {
                                e.currentTarget.onerror =
                                  null;

                                e.currentTarget.src =
                                  FALLBACK_CATEGORY_IMAGE;
                              }}
                            />

                            {/* OVERLAY */}

                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent" />

                            {/* CONTENT */}

                            <div className="relative z-10 flex h-full min-h-[190px] sm:min-h-[220px] flex-col justify-end p-4 sm:p-6">

                              <div className="flex items-end justify-between gap-3">

                                <div className="min-w-0">

                                  <h4 className="font-bold text-white text-base sm:text-xl leading-snug pr-2 drop-shadow-sm">
                                    {
                                      category
                                    }
                                  </h4>

                                </div>

                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur-sm text-white border border-white/20 group-hover:bg-orange-500 group-hover:border-orange-500 transition-all">

                                  <ChevronRight
                                    size={
                                      18
                                    }
                                  />

                                </span>

                              </div>

                            </div>

                          </button>
                        );
                      },
                    )}

                  </div>

                  {categories.length ===
                  0 ? (
                    <p className="text-center text-slate-500 py-12 text-base">
                      No categories
                      available yet.
                    </p>
                  ) : (
                    <MenuPagination
                      page={
                        categoryPage
                      }
                      totalPages={
                        categoryTotalPages
                      }
                      totalItems={
                        categories.length
                      }
                      onPageChange={
                        setCategoryPage
                      }
                    />
                  )}

                </div>
              ) : (

                /* SERVICES VIEW */

                <div className="flex flex-col w-full">

                  <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm py-4 mb-2">

                    <div className="flex items-center gap-3 sm:gap-4">

                      <button
                        type="button"
                        onClick={
                          backToCategories
                        }
                        className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 hover:bg-orange-50 hover:ring-orange-200 transition-colors"
                      >
                        <ChevronLeft
                          size={
                            18
                          }
                        />

                        Categories
                      </button>

                      <div className="min-w-0 flex-1">

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-600">
                          {search.trim() &&
                          !selectedCategory
                            ? "Search results"
                            : "Services"}
                        </p>

                        <h3 className="font-bold text-blue-900 text-lg sm:text-xl truncate">
                          {selectedCategory ||
                            (search.trim()
                              ? `“${search.trim()}”`
                              : "All services")}
                        </h3>

                      </div>

                      {filteredServices.length >
                        0 && (
                        <span className="shrink-0 rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-800">
                          {
                            filteredServices.length
                          }
                        </span>
                      )}

                    </div>

                  </div>

                  <div className="w-full">

                    {filteredServices.length >
                    0 ? (
                      <>

                        <ul className="space-y-3">

                          {pagedServices.map(
                            (
                              service,
                              idx,
                            ) => {

                              const ServiceIcon =
                                getIconComponent(
                                  service?.icon,
                                );

                              return (
                                <li
                                  key={
                                    service?._id ||
                                    service?.id
                                  }
                                  className="animate-scaleIn rounded-2xl bg-white/90 hover:bg-orange-50/50 transition-colors"
                                  style={{
                                    animationDelay: `${idx * 20}ms`,
                                  }}
                                >

                                  <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5">

                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shrink-0">

                                      <ServiceIcon
                                        size={
                                          24
                                        }
                                        strokeWidth={
                                          2.25
                                        }
                                      />

                                    </div>

                                    <div className="flex-1 min-w-0">

                                      <h4 className="font-bold text-blue-900 text-base sm:text-lg leading-snug">
                                        {
                                          service?.name
                                        }
                                      </h4>

                                      {service?.price >
                                        0 && (
                                        <p className="mt-1.5 inline-block rounded-lg bg-orange-100 px-2.5 py-1 text-sm font-bold text-orange-700">
                                          PKR{" "}
                                          {
                                            service.price
                                          }
                                        </p>
                                      )}

                                      {service?.description && (
                                        <p className="mt-1.5 text-sm text-slate-600 line-clamp-2 leading-relaxed">
                                          {
                                            service.description
                                          }
                                        </p>
                                      )}

                                      {!selectedCategory &&
                                        service?.category && (
                                          <p className="mt-1.5 text-[11px] uppercase tracking-wider text-orange-600/90 font-semibold">
                                            {
                                              service.category
                                            }
                                          </p>
                                        )}

                                    </div>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectService(
                                          service,
                                        )
                                      }
                                      className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 sm:px-5 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all text-sm font-bold group mt-0.5 shadow-sm"
                                    >
                                      Book

                                      <ArrowRight
                                        size={
                                          16
                                        }
                                        className="group-hover:translate-x-0.5 transition-transform hidden sm:block"
                                      />

                                    </button>

                                  </div>

                                </li>
                              );
                            },
                          )}

                        </ul>

                        <MenuPagination
                          page={
                            servicePage
                          }
                          totalPages={
                            serviceTotalPages
                          }
                          totalItems={
                            filteredServices.length
                          }
                          onPageChange={
                            setServicePage
                          }
                        />

                      </>
                    ) : (

                      <div className="text-center py-16 px-4 rounded-2xl bg-white/60">

                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">

                          <Search
                            className="text-slate-400"
                            size={28}
                          />

                        </div>

                        <p className="text-slate-600 font-medium text-base">
                          {search.trim()
                            ? "No services match your search"
                            : "No services in this category yet"}
                        </p>

                        {search.trim() && (
                          <button
                            type="button"
                            onClick={() =>
                              setSearch(
                                "",
                              )
                            }
                            className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                          >
                            Clear search
                          </button>
                        )}

                      </div>

                    )}

                  </div>

                </div>
              )}

            </div>
          )}

      </div>

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

      {selectedService && (
        <BookingForm
          service={
            selectedService
          }
          onClose={() =>
            setSelectedService(
              null,
            )
          }
          onSuccess={() => {
            setSelectedService(
              null,
            );

            setBookingDone(true);

            if (
              isAuthenticated &&
              user?.type ===
                "customer"
            ) {
              bookingService
                .getMyBookings()
                .then((res) => {
                  const list =
                    res?.data || [];

                  setPendingBookingCount(
                    list.filter(
                      (b) =>
                        b.status ===
                          "pending" ||
                        b.status ===
                          "pending-confirmation",
                    ).length,
                  );
                })
                .catch(() => {});
            }

            setTimeout(() => {
              setBookingDone(
                false,
              );
            }, 3000);
          }}
        />
      )}

      {/* =====================================================
          SUCCESS TOAST
      ===================================================== */}

      {bookingDone && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[70] animate-slideUp">

          <div className="flex items-center gap-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3.5 text-white shadow-2xl">

            <CheckCircle
              size={24}
            />

            <span className="font-semibold">
              Booking submitted
              successfully!
            </span>

          </div>

        </div>
      )}

    </section>
  );
}
