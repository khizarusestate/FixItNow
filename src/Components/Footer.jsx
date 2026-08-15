import { Home, Info, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openLegal = () => {
    window.dispatchEvent(new Event("fixitnow-open-legal"));
  };

  return (
    <footer className="mt-auto border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/Assets/Logo.png"
              alt="FixItNow"
              className="h-11 w-auto"
            />

            <div>
              <p className="text-sm font-bold text-blue-900">
                FixItNow
              </p>
              <p className="max-w-xs text-xs text-slate-500">
                Reliable help for your everyday home services.
              </p>
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
