const Footer = () => {
  return (
    <footer className="mt-10 overflow-hidden rounded-t-2xl bg-slate-500 text-white">

      {/* Main Footer */}
      <div className="px-6 py-10 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              FixItNow
            </h3>

            <p className="max-w-xs text-sm leading-7 text-slate-200">
              Find trusted professionals for your home services.
              Book reliable workers quickly and easily with FixItNow.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Services
            </h3>

            <ul className="space-y-3 text-sm text-slate-200">
              <li className="cursor-pointer hover:text-white">Plumbing</li>
              <li className="cursor-pointer hover:text-white">Electrician</li>
              <li className="cursor-pointer hover:text-white">AC Repair</li>
              <li className="cursor-pointer hover:text-white">Home Cleaning</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Contact
            </h3>

            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <span className="text-lg">📍</span>
                <span>Gujranwala, Pakistan</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="text-lg">✉️</span>
                <a
                  href="mailto:supportfixitnow@gmail.com"
                  className="hover:text-white"
                >
                  supportfixitnow@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <span className="text-lg">📞</span>
                <a
                  href="tel:03256776142"
                  className="hover:text-white"
                >
                  0325 6776142
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Follow Us
            </h3>

            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold transition hover:scale-110"
              >
                f
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 text-sm font-bold transition hover:scale-110"
              >
                𝕏
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 text-sm font-bold transition hover:scale-110"
              >
                ◎
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 text-sm font-bold transition hover:scale-110"
              >
                in
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold transition hover:scale-110"
              >
                Git
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-400/50 bg-slate-600 px-6 py-4 text-center">
        <p className="text-sm text-slate-200">
          © {new Date().getFullYear()} FixItNow. All rights reserved.
        </p>
      </div>

    </footer>
  );
};

export default Footer;  </div>

  {/* Contact Information */}
  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
    <a
      href="tel:03256776142"
      className="transition-colors hover:text-orange-600"
    >
      📞 0325 6776142
    </a>

    <a
      href="mailto:supportfixitnow@gmail.com"
      className="transition-colors hover:text-orange-600"
    >
      ✉ supportfixitnow@gmail.com
    </a>
  </div>
</div>
          {/* Links */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button
              type="button"
              onClick={() => scrollToSection("home")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-orange-600"
            >
              <Home size={14} />
              Home
            </button>

            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("fixitnow-open-modal", {
                    detail: { modal: "about" },
                  })
                )
              }
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-orange-600"
            >
              <Info size={14} />
              About
            </button>

            <button
              type="button"
              onClick={() => scrollToSection("contact")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-orange-600"
            >
              <Mail size={14} />
              Contact
            </button>

            <button
              type="button"
              onClick={openLegal}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-orange-600"
            >
              <ShieldCheck size={14} />
              Privacy & Terms
            </button>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} FixItNow. All rights reserved.
          </p>

          <p>
            Trusted home services, made simple.
          </p>
        </div>
      </div>
    </footer>
  );
}
