import { useState } from "react";
import { X, CheckCircle, MapPin, User, Phone, Mail } from "lucide-react";

export default function TourPracticeBookingModal({ service, onClose, onComplete }) {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onComplete();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Practice mode
            </p>
            <h2 className="text-xl font-bold text-slate-900">
              {service?.title || "Sample service"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-600 rounded-lg bg-orange-50 border border-orange-100 px-3 py-2">
            This is a demo form. No data is saved.
          </p>
          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1 mb-1">
              <User size={14} /> Full name
            </span>
            <input
              readOnly
              defaultValue="Alex Sample"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1 mb-1">
              <Mail size={14} /> Email
            </span>
            <input
              readOnly
              defaultValue="alex@example.com"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1 mb-1">
              <Phone size={14} /> Phone
            </span>
            <input
              readOnly
              defaultValue="0300 1234567"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700"
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            <span className="flex items-center gap-1 mb-1">
              <MapPin size={14} /> Location
            </span>
            <input
              readOnly
              defaultValue="Sample Street, Lahore"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 bg-slate-50 text-slate-700"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? (
              "Submitting..."
            ) : (
              <>
                <CheckCircle size={18} />
                Submit practice booking
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
