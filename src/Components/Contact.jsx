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
        className="scroll-mt-20 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-5 py-20 text-white sm:px-8 lg:px-10"
      >
        <div className="mx-auto max-w-7xl">
          <div className="reveal">
            <div className="text-center mb-12">
              <p className="text-lg font-black uppercase tracking-[0.2em] text-orange-400 mb-3">
                Contact
              </p>
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl mb-4">
                Get in Touch
              </h2>
              <p className="mt-4 text-sm text-slate-400 max-w-md mx-auto">
                Questions about bookings, workers, or ads? Reach us anytime.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto">
              <a
                href="tel:+923256776142"
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-400/40 hover:bg-white/10"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 group-hover:bg-orange-500/30">
                    <Phone size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Call</span>
                </div>
              </a>

              <a
                href="mailto:khizarusestate@gmail.com"
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-400/40 hover:bg-white/10"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 group-hover:bg-orange-500/30">
                    <Mail size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Email</span>
                </div>
              </a>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300">
                    <Clock size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">24/7</span>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Gujranwala+Punjab+Pakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:border-orange-400/40 hover:bg-white/10"
              >
                <div className="flex flex-col items-center text-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20 text-orange-300 group-hover:bg-orange-500/30">
                    <MapPin size={18} />
                  </div>
                  <span className="text-xs font-semibold text-slate-200">Map</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-10">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/Assets/Logo.png"
                  alt="Fix It Now"
                  className="h-11 w-auto rounded-lg"
                />
                <div>
                  <p className="font-display text-lg font-bold text-white">
                    FixItNow
                  </p>
                  <p className="text-xs text-slate-500">Home services, simplified</p>
                </div>
              </div>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
                Book trusted workers for repairs, cleaning, and more — or list your
                skills as a pro.
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Quick links
              </p>
              <ul className="mt-4 space-y-2.5">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.label}>
                    {link.action === "legal" ? (
                      <button
                        type="button"
                        onClick={openLegalModal}
                        className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={14}
                          className="opacity-0 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0"
                        />
                      </button>
                    ) : (
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight
                          size={14}
                          className="opacity-0 -translate-y-0.5 transition-all group-hover:opacity-100 group-hover:translate-y-0"
                        />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-orange-400">
                Contact
              </p>
              <ul className="mt-4 space-y-3 text-sm text-slate-400">
                <li>
                  <a
                    href="tel:+923256776142"
                    className="hover:text-orange-300 transition-colors"
                  >
                    +92 325 6776142
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:khizarusestate@gmail.com"
                    className="hover:text-orange-300 transition-colors break-all"
                  >
                    khizarusestate@gmail.com
                  </a>
                </li>
                <li className="text-slate-500">Gujranwala, Punjab, Pakistan</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 sm:flex-row">
            <p className="text-xs text-slate-500">
              © {year} FixItNow. All rights reserved.
            </p>
            <p className="text-xs text-slate-600">
              Built for customers &amp; workers across Pakistan
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
