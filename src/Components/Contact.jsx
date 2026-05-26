import { Clock, Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
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
              <p className="mt-4 text-sm text-slate-400">
                <a href="#legal" className="text-orange-400 hover:underline">
                  Privacy &amp; Terms
                </a>
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <a href="tel:+923256776142" className="group">
                <div className="h-full rounded-xl border border-orange-500/25 bg-orange-500/10 p-3 sm:p-4 transition-all duration-300 hover:border-orange-400/60 hover:bg-orange-500/15">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                      <Phone size={18} className="text-orange-300 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-orange-200">Phone</h3>
                  </div>
                </div>
              </a>

              <a href="mailto:khizarusestate@gmail.com" className="group">
                <div className="h-full rounded-xl border border-blue-500/25 bg-blue-500/10 p-3 sm:p-4 transition-all duration-300 hover:border-blue-400/60 hover:bg-blue-500/15">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <Mail size={18} className="text-blue-300 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-blue-200">Email</h3>
                  </div>
                </div>
              </a>

              <div className="group">
                <div className="h-full rounded-xl border border-green-500/25 bg-green-500/10 p-3 sm:p-4 transition-all duration-300 hover:border-green-400/60 hover:bg-green-500/15">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                      <Clock size={18} className="text-green-300 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-green-200">24/7</h3>
                  </div>
                </div>
              </div>

              <a
                href="https://maps.google.com/?q=Gujranwala+Punjab+Pakistan"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <div className="h-full rounded-xl border border-purple-500/25 bg-purple-500/10 p-3 sm:p-4 transition-all duration-300 hover:border-purple-400/60 hover:bg-purple-500/15">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                      <MapPin size={18} className="text-purple-300 sm:h-5 sm:w-5" />
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-purple-200">Location</h3>
                  </div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white px-5 py-8 sm:px-8 lg:px-10 border-t border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img src="/Assets/Logo.png" alt="Fix It Now" className="h-12 w-auto" />
              <p className="font-semibold text-slate-900">FixItNow</p>
            </div>
            <p className="text-sm text-slate-500">
              Copyright 2026 FixItNow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
