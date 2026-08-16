import {
  MapPin,
  Mail,
  Phone,
  LockKeyhole,
  Globe2,
  Camera,
  BriefcaseBusiness,
  Code2,
} from "lucide-react";
import { Link } from "react-scroll";

const Footer = () => {
  return (
    <footer className="mt-10 overflow-hidden rounded-t-2xl bg-[#0B1F3A] text-white">
      {/* Main Footer */}
      <div className="px-6 py-10 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">

          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              FixItNow
            </h3>

            <p className="max-w-xs text-sm leading-7 text-slate-300">
              Find trusted professionals for your home services.
              Book reliable workers quickly and easily with FixItNow.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              Quick Links
            </h3>

            <ul className="space-y-3 text-sm text-slate-300">
              <li>
                <Link
                  to="home"
                  smooth={true}
                  duration={500}
                  offset={-80}
                  className="cursor-pointer transition hover:text-[#F4C542]"
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
                  className="cursor-pointer transition hover:text-[#F4C542]"
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
                  className="cursor-pointer transition hover:text-[#F4C542]"
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
                  className="cursor-pointer transition hover:text-[#F4C542]"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              Contact
            </h3>

            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <MapPin
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-[#F4C542]"
                />
                <span>Gujranwala, Pakistan</span>
              </li>

              <li className="flex items-center gap-3">
                <Mail
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-[#F4C542]"
                />
                <a
                  href="mailto:supportfixitnow@gmail.com"
                  className="transition hover:text-[#F4C542]"
                >
                  supportfixitnow@gmail.com
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Phone
                  size={18}
                  strokeWidth={2}
                  className="shrink-0 text-[#F4C542]"
                />
                <a
                  href="tel:03256776142"
                  className="transition hover:text-[#F4C542]"
                >
                  0325 6776142
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">
              Follow Us
            </h3>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"
              >
                <Globe2 size={19} />
              </a>

              <a
                href="#"
                aria-label="X"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"
              >
                <Share2Icon />
              </a>

              <a
                href="#"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"
              >
                <Camera size={19} />
              </a>

              <a
                href="#"
                aria-label="LinkedIn"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"
              >
                <BriefcaseBusiness size={19} />
              </a>

              <a
                href="#"
                aria-label="GitHub"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"
              >
                <Code2 size={19} />
              </a>
            </div>

            {/* Admin Login */}
            <a
              href="https://fixitnow.cloud"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#F4C542]/50 bg-[#F4C542] px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#FFD65A] hover:shadow-md"
            >
              <LockKeyhole size={17} strokeWidth={2.2} />
              Login as Admin
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 bg-[#08182E] px-6 py-4 text-center">
        <p className="text-sm text-slate-300">
          © {new Date().getFullYear()} FixItNow. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

function Share2Icon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8a3 3 0 1 0-2.83-4A3 3 0 0 0 18 8Z" />
      <path d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  );
}                  Home
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
