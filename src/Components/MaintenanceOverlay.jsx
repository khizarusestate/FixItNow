/**
 * Maintenance overlay — blurs the live site, locks scroll, shows admin message.
 */

import { Sparkles, Wrench } from "lucide-react";

export default function MaintenanceOverlay({ message }) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label="Maintenance notice"
    >
      <div className="absolute inset-0 bg-slate-900/25 backdrop-blur-md" />

      <div className="relative w-full max-w-lg animate-fadeIn">
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/95 shadow-2xl shadow-orange-500/10 backdrop-blur-xl">
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 py-5 text-center text-white">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <Wrench className="h-7 w-7" aria-hidden />
            </div>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              We&apos;ll Be Right Back
            </h2>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-orange-50">
              <Sparkles className="h-4 w-4" aria-hidden />
              FixItNow is under maintenance
            </p>
          </div>

          <div className="px-6 py-7 text-center">
            <p className="text-base leading-relaxed text-slate-700 whitespace-pre-wrap">
              {message?.trim() ||
                "App is in maintenance. Please try again later."}
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Thank you for your patience.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
