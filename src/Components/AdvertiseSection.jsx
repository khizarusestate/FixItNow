import { useState, useEffect, useCallback, useRef } from "react";
import {
  Megaphone,
  X,
  Upload,
  Image as ImageIcon,
  Video,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Smartphone,
  Banknote,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { advertisementService } from "../services/api.js";
import {
  PAYMENT_METHOD_VALUES,
  PAYMENT_METHOD_LABELS,
  getEasypaisaMsisdn,
  getJazzcashMsisdn,
  requiresPaymentReceipt,
} from "../utils/platformPayment.js";
import {
  AD_DURATION_PRICING,
  formatAdPrice,
  getAdPrice,
} from "../utils/adPricing.js";

export default function AdvertiseSection() {
  const { user, isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [purpose, setPurpose] = useState("");
  const [duration, setDuration] = useState("1 week");
  const [adType, setAdType] = useState("image");
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [pendingAds, setPendingAds] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [payAfterWork, setPayAfterWork] = useState(false);
  const [paymentReceipt, setPaymentReceipt] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [guestContact, setGuestContact] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const receiptInputRef = useRef(null);

  const fetchPendingAds = useCallback(async () => {
    if (!isAuthenticated) {
      setPendingAds([]);
      return;
    }
    try {
      const data = await advertisementService.getMyAds();
      setPendingAds((data.data || []).filter((a) => a.status === "pending"));
    } catch {
      setPendingAds([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchPendingAds();
  }, [fetchPendingAds]);

  useEffect(() => {
    const onAdStatus = () => fetchPendingAds();
    window.addEventListener("fixitnow-ad-status-update", onAdStatus);
    return () =>
      window.removeEventListener("fixitnow-ad-status-update", onAdStatus);
  }, [fetchPendingAds]);

  useEffect(() => {
    return () => {
      if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    };
  }, [receiptPreview]);

  const resetPaymentFields = () => {
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setPaymentMethod("");
    setPayAfterWork(false);
    setPaymentReceipt(null);
    setPaymentReference("");
    setReceiptPreview(null);
    if (receiptInputRef.current) receiptInputRef.current.value = "";
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image receipt (JPG or PNG).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Receipt must be less than 5MB.");
      return;
    }

    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setPaymentReceipt(file);
    setReceiptPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (selectedFiles.length > 3) {
      setError("Maximum 3 files allowed.");
      return;
    }

    const maxSize = 30 * 1024 * 1024; // 30MB per file
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    for (const file of selectedFiles) {
      if (file.size > maxSize) {
        setError("Each file must be less than 30MB.");
        return;
      }
      if (!allowedTypes.includes(file.type)) {
        setError(
          "Only images (JPG, PNG, GIF, WebP) and videos (MP4, WebM, MOV) are allowed.",
        );
        return;
      }
    }

    setFiles(selectedFiles);
    const previews = selectedFiles.map((file) => {
      if (file.type.startsWith("image/")) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setFilePreviews(previews);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      if (!guestContact.name.trim() || guestContact.name.trim().length < 2) {
        setError("Please enter your full name.");
        return;
      }
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestContact.email.trim());
      if (!emailOk) {
        setError("Please enter a valid email address.");
        return;
      }
    }

    if (!purpose.trim()) {
      setError("Please describe the purpose of your advertisement.");
      return;
    }

    if (!files || files.length === 0) {
      setError("Please upload at least one image or video file.");
      return;
    }

    if (!payAfterWork && !paymentMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (requiresPaymentReceipt(paymentMethod, payAfterWork) && !paymentReceipt) {
      setError("Please upload your payment receipt.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("purpose", purpose.trim());
      formData.append("duration", duration);
      formData.append("adType", adType);
      formData.append("payAfterWork", payAfterWork ? "true" : "false");
      const methodForApi = payAfterWork
        ? PAYMENT_METHOD_VALUES.PAY_AFTER_WORK
        : paymentMethod;
      formData.append("paymentMethod", methodForApi);
      if (paymentReference.trim()) {
        formData.append("paymentReference", paymentReference.trim());
      }
      if (paymentReceipt) {
        formData.append("paymentReceipt", paymentReceipt);
      }
      files.forEach((file) => formData.append("adFiles", file));

      if (!isAuthenticated) {
        formData.append("name", guestContact.name.trim());
        formData.append("email", guestContact.email.trim().toLowerCase());
        formData.append("phone", guestContact.phone.trim());
      }

      await advertisementService.submit(formData);

      setSuccess(true);
      fetchPendingAds();
      setPurpose("");
      setFiles([]);
      setFilePreviews([]);
      setAdType("image");
      resetPaymentFields();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError("");
    setSuccess(false);
    setPurpose("");
    setDuration("1 week");
    setFiles([]);
    setFilePreviews([]);
    setAdType("image");
    resetPaymentFields();
    setGuestContact({ name: "", email: "", phone: "" });
  };

  const openAdModal = () => {
    setShowModal(true);
  };

  return (
    <>
      {/* Section on homepage */}
      <section
        id="advertise"
        className="bg-gradient-to-br from-orange-50 to-white py-16 sm:py-20"
      >
        <div className="mx-auto max-w-4xl px-5 text-center">
          {pendingAds.length > 0 && (
            <div className="mb-6 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50 to-orange-50/90 px-4 py-3 text-left shadow-sm ring-1 ring-amber-100/80">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                  <Clock size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-amber-900">
                    {pendingAds.length} advertisement{pendingAds.length > 1 ? "s" : ""} pending review
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800/90">
                    We will notify you when each ad is approved or needs changes.
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-700">
                    {pendingAds.slice(0, 3).map((a) => (
                      <li key={a.id} className="truncate">
                        • {a.purpose || "Ad submission"}
                      </li>
                    ))}
                    {pendingAds.length > 3 ? (
                      <li className="text-slate-500">+{pendingAds.length - 3} more…</li>
                    ) : null}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100">
            <Megaphone size={32} className="text-orange-600" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            Advertise With Us
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-slate-600">
            Reach thousands of verified customers and professionals on FixItNow.
            Submit your advertisement and our team will review it within 24
            hours.
          </p>

          <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-orange-200 bg-white/90 p-4 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600 mb-3">
              Pricing (PKR)
            </p>
            <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 text-sm">
              {Object.entries(AD_DURATION_PRICING).map(([key, { label, price }]) => (
                <li
                  key={key}
                  className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                >
                  <span className="font-semibold text-slate-800">{label}</span>
                  <span className="block text-orange-600 font-bold">Rs {price}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Pay via EasyPaisa, JazzCash, or hand-to-hand. Admin confirms payment before your ad goes live.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={openAdModal}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/30"
            >
              <Megaphone size={18} />
              Submit Advertisement
            </button>
            {!isAuthenticated && (
              <p className="text-sm text-slate-500">
                No account needed — submit as a guest
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
                  <Megaphone size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Advertise With Us
                  </h3>
                  <p className="text-xs text-slate-500">
                    Complete the form below
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {success ? (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Submitted Successfully!
                  </h4>
                  <p className="mt-2 text-slate-600">
                    Your advertisement has been submitted and will be reviewed
                    by our team within 24 hours.
                  </p>
                  <button
                    onClick={closeModal}
                    className="mt-6 inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Contact details */}
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                      {isAuthenticated ? "Your Details" : "Your Contact Details"}
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={
                            isAuthenticated
                              ? user?.fullName || ""
                              : guestContact.name
                          }
                          onChange={(e) =>
                            setGuestContact((p) => ({
                              ...p,
                              name: e.target.value,
                            }))
                          }
                          disabled={isAuthenticated}
                          required
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={
                              isAuthenticated
                                ? user?.email || user?.emailAddress || ""
                                : guestContact.email
                            }
                            onChange={(e) =>
                              setGuestContact((p) => ({
                                ...p,
                                email: e.target.value,
                              }))
                            }
                            disabled={isAuthenticated}
                            required
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1">
                            Phone
                          </label>
                          <input
                            type="text"
                            value={
                              isAuthenticated
                                ? user?.phone || user?.phoneNumber || ""
                                : guestContact.phone
                            }
                            onChange={(e) =>
                              setGuestContact((p) => ({
                                ...p,
                                phone: e.target.value,
                              }))
                            }
                            disabled={isAuthenticated}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:bg-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Purpose */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Purpose of Advertisement
                    </label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      placeholder="Describe what you are advertising and your target audience..."
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 resize-none"
                    />
                    <p className="mt-1 text-right text-xs text-slate-400">
                      {purpose.length}/500
                    </p>
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Duration
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    >
                      {Object.entries(AD_DURATION_PRICING).map(([value, { label }]) => (
                        <option key={value} value={value}>
                          {label} — Rs {AD_DURATION_PRICING[value].price}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1.5 text-sm font-semibold text-orange-700">
                      Selected: {formatAdPrice(duration)}
                      {getAdPrice(duration) != null ? " (pay when submitting)" : ""}
                    </p>
                  </div>

                  {/* Ad Type */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Ad Type
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setAdType("image")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          adType === "image"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <ImageIcon size={16} />
                        Image
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdType("video")}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                          adType === "video"
                            ? "border-orange-500 bg-orange-50 text-orange-700"
                            : "border-slate-200 text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        <Video size={16} />
                        Video
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={payAfterWork}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setPayAfterWork(checked);
                        if (checked) {
                          setPaymentMethod("");
                          if (receiptPreview) URL.revokeObjectURL(receiptPreview);
                          setPaymentReceipt(null);
                          setReceiptPreview(null);
                          if (receiptInputRef.current) receiptInputRef.current.value = "";
                        }
                        setError("");
                      }}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm text-amber-950">
                      <span className="font-semibold block">
                        Payment after work is completed
                      </span>
                      <span className="text-xs text-amber-800/90 mt-0.5 block">
                        Pay when the service is done — payment fields below are not required.
                      </span>
                    </span>
                  </label>

                  {/* Payment method */}
                  <div
                    className={
                      payAfterWork ? "opacity-50 pointer-events-none select-none" : ""
                    }
                  >
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Payment method {!payAfterWork && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                      required={!payAfterWork}
                      disabled={payAfterWork}
                    >
                      <option value="">Select payment method</option>
                      <option value={PAYMENT_METHOD_VALUES.EASYPAISA}>
                        {PAYMENT_METHOD_LABELS[PAYMENT_METHOD_VALUES.EASYPAISA]}
                      </option>
                      <option value={PAYMENT_METHOD_VALUES.JAZZCASH}>
                        {PAYMENT_METHOD_LABELS[PAYMENT_METHOD_VALUES.JAZZCASH]}
                      </option>
                      <option value={PAYMENT_METHOD_VALUES.HAND_TO_HAND}>
                        {PAYMENT_METHOD_LABELS[PAYMENT_METHOD_VALUES.HAND_TO_HAND]}
                      </option>
                    </select>
                  </div>

                  {!payAfterWork &&
                    paymentMethod === PAYMENT_METHOD_VALUES.HAND_TO_HAND && (
                    <div className="rounded-xl border border-violet-200 bg-violet-50/80 px-4 py-3 flex gap-3">
                      <Banknote className="shrink-0 text-violet-700 mt-0.5" size={20} />
                      <div className="text-sm text-violet-900">
                        <p className="font-semibold">Hand to hand payment</p>
                        <p className="mt-1 text-xs text-violet-800/90">
                          Pay in cash in person. No receipt upload required.
                        </p>
                      </div>
                    </div>
                  )}

                  {!payAfterWork && paymentMethod === PAYMENT_METHOD_VALUES.EASYPAISA && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 flex gap-3">
                      <Smartphone className="shrink-0 text-emerald-700 mt-0.5" size={20} />
                      <div className="text-sm text-emerald-900">
                        <p className="font-semibold">Pay via EasyPaisa</p>
                        <p className="mt-1 text-emerald-800">
                          Send payment to:{" "}
                          <span className="font-mono font-bold">{getEasypaisaMsisdn()}</span>
                        </p>
                        <p className="mt-1 text-xs text-emerald-700/90">
                          Upload your payment receipt below.
                        </p>
                      </div>
                    </div>
                  )}

                  {!payAfterWork && paymentMethod === PAYMENT_METHOD_VALUES.JAZZCASH && (
                    <div className="rounded-xl border border-sky-200 bg-sky-50/80 px-4 py-3 flex gap-3">
                      <Smartphone className="shrink-0 text-sky-700 mt-0.5" size={20} />
                      <div className="text-sm text-sky-900">
                        <p className="font-semibold">Pay via JazzCash</p>
                        <p className="mt-1 text-sky-800">
                          Send payment to:{" "}
                          <span className="font-mono font-bold">{getJazzcashMsisdn()}</span>
                        </p>
                        <p className="mt-1 text-xs text-sky-700/90">
                          Upload your payment receipt below.
                        </p>
                      </div>
                    </div>
                  )}

                  <div
                    className={
                      payAfterWork ? "opacity-50 pointer-events-none select-none" : ""
                    }
                  >
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Payment reference (optional)
                    </label>
                    <input
                      type="text"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="Transaction ID or reference number"
                      maxLength={100}
                      disabled={payAfterWork}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>

                  {/* Payment receipt */}
                  <div
                    className={
                      payAfterWork ||
                      paymentMethod === PAYMENT_METHOD_VALUES.HAND_TO_HAND
                        ? "opacity-50 pointer-events-none select-none"
                        : ""
                    }
                  >
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Payment receipt{" "}
                      {requiresPaymentReceipt(paymentMethod, payAfterWork) && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    <input
                      ref={receiptInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptChange}
                      className="sr-only"
                      aria-hidden
                      disabled={
                        payAfterWork ||
                        paymentMethod === PAYMENT_METHOD_VALUES.HAND_TO_HAND
                      }
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => receiptInputRef.current?.click()}
                        disabled={
                          payAfterWork ||
                          paymentMethod === PAYMENT_METHOD_VALUES.HAND_TO_HAND
                        }
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800 hover:bg-orange-100 disabled:opacity-60"
                      >
                        <Upload size={18} />
                        {paymentReceipt ? "Change receipt" : "Upload receipt"}
                      </button>
                      {paymentReceipt && (
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                          {paymentReceipt.name}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">JPG or PNG, up to 5MB</p>
                    {receiptPreview && (
                      <div className="relative inline-block mt-3">
                        <img
                          src={receiptPreview}
                          alt="Receipt preview"
                          className="w-28 h-28 object-cover rounded-lg border-2 border-orange-300"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (receiptPreview) URL.revokeObjectURL(receiptPreview);
                            setPaymentReceipt(null);
                            setReceiptPreview(null);
                            if (receiptInputRef.current) receiptInputRef.current.value = "";
                          }}
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600"
                          title="Remove receipt"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                      Upload Ad Files (Max 3)
                    </label>
                    <div
                      className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
                        files.length > 0
                          ? "border-green-300 bg-green-50"
                          : "border-slate-300 bg-slate-50 hover:border-orange-400"
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept={
                          adType === "image"
                            ? "image/jpeg,image/png,image/gif,image/webp"
                            : "video/mp4,video/webm,video/quicktime"
                        }
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      {files.length > 0 ? (
                        <div className="flex flex-col items-center w-full">
                          <CheckCircle
                            size={32}
                            className="text-green-500 mb-2"
                          />
                          <p className="text-sm font-medium text-green-700">
                            {files.length} file{files.length > 1 ? "s" : ""}{" "}
                            selected
                          </p>
                          <div className="grid grid-cols-3 gap-2 mt-3 w-full">
                            {filePreviews.map((preview, idx) => (
                              <div key={idx} className="relative">
                                {preview ? (
                                  <img
                                    src={preview}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ) : (
                                  <div className="w-full h-20 bg-slate-900 rounded flex items-center justify-center">
                                    <Video size={16} className="text-white" />
                                  </div>
                                )}
                                <span className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-1 rounded">
                                  {idx + 1}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          {adType === "image" ? (
                            <ImageIcon
                              size={32}
                              className="text-slate-400 mb-2"
                            />
                          ) : (
                            <Video size={32} className="text-slate-400 mb-2" />
                          )}
                          <p className="text-sm font-medium text-slate-600">
                            {adType === "image"
                              ? "Click to upload images"
                              : "Click to upload videos"}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            Max 3 files, 30MB each
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                      <AlertTriangle
                        size={16}
                        className="mt-0.5 flex-shrink-0"
                      />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Megaphone size={18} />
                        Submit Advertisement
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
