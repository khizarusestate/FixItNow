import {
  MapPin,
  Mail,
  Phone,
  LockKeyhole,
  CreditCard,
} from "lucide-react";
import { Link } from "react-scroll";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaGithub,
  FaYoutube,
} from "react-icons/fa";

const Footer = () => {
  return (
    <footer id="contact" className="mt-10 overflow-hidden rounded-t-2xl bg-[#0B1F3A] text-white">
      <div className="px-6 py-10 md:px-12 lg:px-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-3">
              <div className="inline-flex rounded-lg bg-white px-3 py-2">
                <img src="/Assets/Logo.png" alt="FixItNow" className="h-10 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Fix It Now</span>
            </div>
            <p className="max-w-xs text-sm leading-7 text-slate-300">
              Find trusted professionals for your home services.
              Book reliable workers quickly and easily with FixItNow.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-slate-300">
              <li><Link to="home" smooth duration={500} offset={-80} className="cursor-pointer transition hover:text-[#F4C542]">Home</Link></li>
              <li><Link to="about" smooth duration={500} offset={-80} className="cursor-pointer transition hover:text-[#F4C542]">About Us</Link></li>
              <li><Link to="services" smooth duration={500} offset={-80} className="cursor-pointer transition hover:text-[#F4C542]">Services</Link></li>
              <li><Link to="contact" smooth duration={500} offset={-80} className="cursor-pointer transition hover:text-[#F4C542]">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Contact</h3>
            <ul className="space-y-4 text-sm text-slate-300">
              <li className="flex items-center gap-3"><MapPin size={18} className="shrink-0 text-[#F4C542]" /><span>Serving All Over Pakistan</span></li>
              <li className="flex items-center gap-3"><Mail size={18} className="shrink-0 text-[#F4C542]" /><a href="mailto:supportfixitnow@gmail.com" className="transition hover:text-[#F4C542]">support@fixitnow.pk</a></li>
              <li className="flex items-center gap-3"><Phone size={18} className="shrink-0 text-[#F4C542]" /><a href="tel:03012220345" className="transition hover:text-[#F4C542]">0301 2220345</a></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-white">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              <a href="#" aria-label="Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"><FaInstagram size={18} /></a>
              <a href="#" aria-label="Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"><FaFacebookF size={17} /></a>
              <a href="#" aria-label="LinkedIn" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"><FaLinkedinIn size={18} /></a>
              <a href="#" aria-label="GitHub" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"><FaGithub size={19} /></a>
              <a href="#" aria-label="YouTube" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#F4C542]/30 bg-white/5 text-[#F4C542] transition hover:-translate-y-1 hover:bg-[#F4C542] hover:text-[#0B1F3A]"><FaYoutube size={19} /></a>
            </div>
            <a href="https://fixitnow.cloud" target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#F4C542]/50 bg-[#F4C542] px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#FFD65A] hover:shadow-md"><LockKeyhole size={17} strokeWidth={2.2} />Login as Admin</a>

            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2 text-sm text-slate-300"><CreditCard size={17} className="text-[#F4C542]" /><span>Payment Methods</span></div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex h-7 items-center rounded-md border border-white/10 bg-white px-2"><img src="/Assets/JazzCash.png" alt="JazzCash" className="max-h-5 w-auto object-contain" /></span>
                    <span className="font-semibold text-white">JazzCash</span>
                  </div>
                  <p><span className="text-slate-400">Account Number:</span> 03012220324</p>
                  <p><span className="text-slate-400">Title:</span> Tahir Ayyub</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex h-7 items-center rounded-md border border-white/10 bg-white px-2"><img src="/Assets/EasyPaisa.png" alt="Easypaisa" className="max-h-5 w-auto object-contain" /></span>
                    <span className="font-semibold text-white">Easypaisa</span>
                  </div>
                  <p><span className="text-slate-400">Account Number:</span> 03012220324</p>
                  <p><span className="text-slate-400">Title:</span> Tahir Ayyub</p>
                </div>

                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex h-7 items-center rounded-md border border-white/10 bg-white px-2.5"><span className="text-xs font-bold italic tracking-wide text-[#1434CB]">VISA</span></span>
                    <span className="font-semibold text-white">Visa Card</span>
                  </div>
                  <p className="text-slate-400">Visa payment option</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 bg-[#08182E] px-6 py-4"><div className="flex items-center justify-center text-center"><p className="text-sm text-slate-300">© {new Date().getFullYear()} FixItNow. All rights reserved.</p></div></div>
    </footer>
  );
};

export default Footer;
