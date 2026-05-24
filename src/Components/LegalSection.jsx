import { Shield, FileText } from "lucide-react";

export default function LegalSection() {
  return (
    <section
      id="legal"
      className="scroll-mt-20 bg-slate-100 px-5 py-16 sm:px-8 lg:px-10"
    >
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-sm font-bold uppercase tracking-widest text-orange-600 mb-2">
          Legal
        </p>
        <h2 className="text-center text-3xl font-bold text-slate-900 mb-10">
          Policies &amp; Terms
        </h2>

        <div className="space-y-8">
          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="text-orange-500" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Privacy Policy</h3>
            </div>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-3">
              <p>
                Fix It Now collects information you provide when booking services,
                creating an account, or contacting us — including name, phone, email,
                address, and payment receipts you upload.
              </p>
              <p>
                We use this data to process bookings, assign workers, send status
                updates, and improve our platform. We do not sell your personal data
                to third parties.
              </p>
              <p>
                Payment receipts and location data are stored securely on our servers.
                You may request account deletion by contacting support.
              </p>
              <p className="text-xs text-slate-500">Last updated: May 2026</p>
            </div>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="text-orange-500" size={24} />
              <h3 className="text-xl font-bold text-slate-900">Terms of Service</h3>
            </div>
            <div className="prose prose-slate max-w-none text-sm text-slate-600 space-y-3">
              <p>
                By using Fix It Now you agree to book services in good faith, provide
                accurate contact and location details, and upload genuine payment
                proof when required.
              </p>
              <p>
                Bookings are confirmed after admin review. Service quality is between
                you and the assigned worker; the platform facilitates matching and
                communication.
              </p>
              <p>
                Cancellations are allowed while a booking is still pending. Refunds for
                completed payments follow our support review process.
              </p>
              <p>
                Workers must maintain professional conduct and accurate profiles.
                Accounts may be suspended or removed for fraud or abuse.
              </p>
              <p className="text-xs text-slate-500">Last updated: May 2026</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
