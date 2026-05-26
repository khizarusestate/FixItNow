import { Shield, FileText } from "lucide-react";

export default function LegalSection() {
  return (
    <section
      id="legal"
      className="scroll-mt-20 bg-slate-100 px-5 py-12 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-slate-900 mb-8">
          Legal
        </h2>

        <div className="space-y-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="text-orange-500" size={22} />
              <h3 className="text-lg font-bold text-slate-900">Privacy Policy</h3>
            </div>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                We collect name, contact, location, and payment proof to process
                bookings and assign workers. We do not sell your data.
              </p>
              <p>You may request account deletion via support.</p>
              <p className="text-xs text-slate-400">Updated May 2026</p>
            </div>
          </article>

          <article
            id="terms-of-service"
            className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-3">
              <FileText className="text-orange-500" size={22} />
              <h3 className="text-lg font-bold text-slate-900">Terms of Service</h3>
            </div>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                Provide accurate details and genuine payment proof when required.
                Bookings are confirmed after admin review.
              </p>
              <p>
                Cancel while pending. Workers must act professionally. Accounts may
                be suspended for abuse or non-payment.
              </p>
              <p className="text-xs text-slate-400">Updated May 2026</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
