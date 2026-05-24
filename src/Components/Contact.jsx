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
                Contact Us
              </p>
              <h2 className="font-display text-4xl font-bold leading-tight sm:text-5xl mb-4">
                Get in Touch
              </h2>
              <p className="max-w-2xl mx-auto text-base leading-8 text-slate-300">
                Have questions or need assistance? We're here to help. Reach out to us through any of the channels below.
              </p>
              <p className="mt-4 text-sm text-slate-400">
                <a href="#legal" className="text-orange-400 hover:underline">
                  Privacy Policy &amp; Terms of Service
                </a>
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Phone Card */}
              <a href="tel:+923256776142" className="group">
                <div className="h-full rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-600/5 p-8 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-orange-500/40 hover:shadow-orange-500/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                      <Phone size={28} className="text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-orange-300">Phone</h3>
                    </div>
                  </div>
                </div>
              </a>

              {/* Email Card */}
              <a href="mailto:khizarusestate@gmail.com" className="group">
                <div className="h-full rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-8 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-blue-500/40 hover:shadow-blue-500/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                      <Mail size={28} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-300">Email</h3>
                    </div>
                  </div>
                </div>
              </a>

              {/* Business Hours Card */}
              <div className="group">
                <div className="h-full rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 p-8 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-green-500/40 hover:shadow-green-500/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                      <Clock size={28} className="text-green-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-300">24/7</h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Card */}
              <a href="https://maps.google.com/?q=Gujranwala+Punjab+Pakistan" target="_blank" rel="noopener noreferrer" className="group">
                <div className="h-full rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-600/5 p-8 backdrop-blur transition-all duration-300 hover:scale-105 hover:border-purple-500/40 hover:shadow-purple-500/20">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                      <MapPin size={28} className="text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-300">Location</h3>
                    </div>
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
              <div>
                <p className="font-semibold text-slate-900">FixItNow</p>
                <p className="text-sm text-slate-600">Your trusted home services partner</p>
              </div>
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
