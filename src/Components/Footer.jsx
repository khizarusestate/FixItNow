import { Link } from "react-scroll";

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

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-slate-200">
              <li>
                <Link
                  to="home"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="cursor-pointer transition hover:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="about"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="cursor-pointer transition hover:text-white"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  to="services"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="cursor-pointer transition hover:text-white"
                >
                  Services
                </Link>
              </li>

              <li>
                <Link
                  to="contact"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="cursor-pointer transition hover:text-white"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide">
              Contact
            </h3>

            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <span>📍</span>
                <span>Gujranwala, Pakistan</span>
              </li>

              <li className="flex items-center gap-3">
                <span>✉️</span>
                <a
                  href="mailto:supportfixitnow@gmail.com"
                  className="transition hover:text-white"
                >
                  supportfixitnow@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <span>📞</span>
                <a
                  href="tel:03256776142"
                  className="transition hover:text-white"
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

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold transition hover:scale-110"
              >
                f
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-400 font-bold transition hover:scale-110"
              >
                𝕏
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-500 font-bold transition hover:scale-110"
              >
                ◎
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-700 font-bold transition hover:scale-110"
              >
                in
              </a>

              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 font-bold transition hover:scale-110"
              >
                Git
              </a>
            </div>

            {/* Admin Login */}
            <a
              href="https://fixitnow.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-white/60 bg-slate-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              <span>🔐</span>
              Login as Admin
            </a>
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

export default Footer;
