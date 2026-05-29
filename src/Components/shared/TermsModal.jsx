import { X, Shield, FileText, ScrollText } from "lucide-react";

/**
 * TermsModal — shown when user clicks "terms and conditions" in any form.
 * Usage:
 *   const [showTerms, setShowTerms] = useState(false);
 *   <TermsModal isOpen={showTerms} onClose={() => setShowTerms(false)} />
 *   <button onClick={() => setShowTerms(true)}>terms and conditions</button>
 */
export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      {/* Backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
        aria-label="Close"
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[88vh] flex flex-col bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 animate-[fadeScale_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <ScrollText className="text-orange-500" size={20} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-orange-500">
                Legal
              </p>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                Terms & Conditions
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5 space-y-6 flex-1">
          {/* Privacy Policy */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                <Shield className="text-blue-500" size={15} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Privacy Policy
              </h3>
            </div>
            <div className="space-y-2.5 text-sm text-slate-600 leading-relaxed pl-9">
              <p>
                We collect your name, contact details, location, and payment
                proof solely to process bookings and assign verified workers to
                your service requests.
              </p>
              <p>
                <strong className="text-slate-800">We never sell your data</strong>{" "}
                to third parties. Your information is stored securely and used
                only for service delivery and support.
              </p>
              <p>
                You may request account deletion or a data export at any time by
                contacting our support team.
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Last updated: May 2026
              </p>
            </div>
          </section>

          <div className="border-t border-slate-100" />

          {/* Terms of Service */}
          <section>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
                <FileText className="text-orange-500" size={15} />
              </div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Terms of Service
              </h3>
            </div>
            <div className="space-y-2.5 text-sm text-slate-600 leading-relaxed pl-9">
              <p>
                By using Fix It Now, you agree to provide accurate personal
                details and genuine payment proof when booking a service.
              </p>
              <p>
                Bookings are confirmed only after admin review. You may cancel
                a booking while it is in <em>pending</em> status.
              </p>
              <p>
                Workers are expected to act professionally and complete jobs as
                described. Failure to do so may result in account suspension.
              </p>
              <p>
                Accounts found to be engaging in abuse, fraud, or non-payment
                may be permanently suspended without notice.
              </p>
              <p>
                Fix It Now reserves the right to update these terms. Continued
                use of the platform constitutes acceptance of any changes.
              </p>
              <p className="text-xs text-slate-400 pt-1">
                Last updated: May 2026
              </p>
            </div>
          </section>

          {/* Ads-specific */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
            <p className="text-xs font-semibold text-slate-700 mb-1">
              Advertisement submissions
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              All advertisements are subject to admin approval. Ads that contain
              misleading content, prohibited items, or violate community
              standards will be rejected. Payment is required before submission
              and is non-refundable once an ad is approved.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-6 py-3 text-sm font-bold text-white transition-colors shadow-sm shadow-orange-200"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * TermsCheckbox — drop-in checkbox row that opens TermsModal on link click.
 * Props:
 *   checked: bool
 *   onChange: (bool) => void
 *   onOpenTerms: () => void
 *   className: optional extra className for wrapper
 */
export function TermsCheckbox({ checked, onChange, onOpenTerms, className = "" }) {
  return (
    <label
      className={`flex items-start gap-2.5 cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
      />
      <span className="text-xs text-slate-600 leading-snug select-none">
        I agree to the{" "}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenTerms();
          }}
          className="font-semibold text-orange-600 underline hover:text-orange-700"
        >
          Terms &amp; Conditions
        </button>
      </span>
    </label>
  );
}
