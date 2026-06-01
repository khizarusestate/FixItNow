import { Clock, Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { openLegalModal } from "../utils/openLegal.js";

const FOOTER_LINKS = [
  { label: "Book a service", href: "#booking" },
  { label: "Advertise", href: "#advertise" },
  { label: "Reviews", href: "#reviews" },
  { label: "Privacy & Terms", action: "legal" },
];

export default function Contact() {
  const year = new Date().getFullYear();

  return (
    <>
      <section
        id="contact"
        className="scroll-mt-20 bg-white px-5 py-20 text-slate-900 sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="reveal">
            <div className="text-center mb-12">
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl mb-4 text-blue-900">
                Get in Touch
              </h2>
              <p className="mt-4 text-sm text-slate-600 max-w-md mx-auto">
                Questions about bookings, workers, or ads? Reach us anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              <a
                href="tel:+923256776142"
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-orange-400 hover:bg-orange-50"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-600 group-hover:bg-orange-500/30">
                    <Phone size={18} />
                  </div>
                  <span className="text-xs font-semibold text-blue-900">Call</span>
                </div>
              </a>

              <a
                href="mailto:khizarusestate@gmail.com"
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-orange-400 hover:bg-orange-50"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-600 group-hover:bg-orange-500/30">
                    <Mail size={18} />
                  </div>
                  <span className="text-xs font-semibold text-blue-900">Email</span>
                </div>
              </a>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-600">
                    <Clock size={18} />
                  </div>
                  <span className="text-xs font-semibold text-blue-900">24/7</span>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Gujranwala+Punjab+Pakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-orange-400 hover:bg-orange-50"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-600 group-hover:bg-orange-500/30">
                    <MapPin size={18} />
                  </div>
                  <span className="text-xs font-semibold text-blue-900">Map</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white text-slate-900">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="flex flex-col items-center gap-6 text-center">
            <img
              src="/Assets/Logo.png"
              alt="Fix It Now"
              className="h-11 w-auto rounded-lg"
            />
            <p className="max-w-sm text-sm leading-relaxed text-slate-600">
              Book trusted workers for repairs, cleaning, and more — or list your
              skills as a pro.
            </p>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 border-t border-slate-200 pt-6">
            <p className="text-xs text-slate-500">
              © {year} FixItNow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
