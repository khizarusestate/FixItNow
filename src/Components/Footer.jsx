import { useEffect, useState } from "react";
import { MapPin, Mail, Phone, LockKeyhole, CreditCard, X, Copy, Check } from "lucide-react";
import { Link } from "react-scroll";
import { FaInstagram, FaFacebookF, FaLinkedinIn, FaGithub, FaYoutube } from "react-icons/fa";

const paymentMethods = {
  jazzcash: { title: "JazzCash", details: [["Account Number", "03012220324"], ["Title", "Tahir Ayyub"]] },
  easypaisa: { title: "Easypaisa", details: [["Account Number", "03012220324"], ["Title", "Tahir Ayyub"]] },
  bank: { title: "Visa / Bank Transfer", details: [["Account holder", "Tahir Ayyub"], ["Bank", "Allied Bank"], ["Account title", "Fix It Now"], ["Account #", "10420010075628250017"]] },
};

const Footer = () => {
  const [paymentModal, setPaymentModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const openPayment = (key) => { setCopied(false); setPaymentModal(paymentMethods[key]); };
  const closePayment = () => { setPaymentModal(null); setCopied(false); };
  const copyAccount = async () => {
    const account = paymentModal?.details?.find(([label]) => label === "Account Number" || label === "Account #")?.[1];
    if (!account) return;
    try { await navigator.clipboard.writeText(account); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  };

  useEffect(() => {
    if (!paymentModal) return;
    const onKeyDown = (event) => { if (event.key === "Escape") closePayment(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentModal]);

  return (
    <>
      <footer className="mt-10 overflow-hidden rounded-t-2xl bg-[#0B1F3A] text-white">
        <div className="px-6 py-10 md:px-12 lg:px-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-3"><div className="inline-flex rounded-lg bg-white px-3 py-2"><img src="/Assets/Logo.png" alt="FixItNow" className="h-10 w-auto object-contain" /></div><span className="text-lg font-bold tracking-tight text-orange-400">Fix It Now</span></div>
              <p className="max-w-xs text-sm leading-7 text-slate-300">Find trusted professionals for your home services. Book reliable workers quickly and easily with FixItNow.</p>
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
                <li className="flex items-center gap-3"><Mail size={18} className="shrink-0 text-[#F4C542]" /><a href="mailto:supportfixitnow@gmail.com" className="transition hover:text-[#F4C542]">support@fixitnow.com</a></li>
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
                <div className="mb-2 flex items-center gap-2 text-sm text-slate-300"><CreditCard size={17} className="text-[#F4C542]" /><span>We Accept</span></div>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => openPayment("bank")} aria-label="View Visa and bank payment details" className="flex h-8 items-center rounded-md border border-white/10 bg-white px-2.5 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F4C542]"><span className="text-xs font-bold italic tracking-wide text-[#1434CB]">VISA</span></button>
                  <button type="button" onClick={() => openPayment("jazzcash")} aria-label="View JazzCash payment details" className="flex h-8 items-center rounded-md border border-white/10 bg-white px-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F4C542]"><img src="/Assets/JazzCash.png" alt="JazzCash" className="max-h-6 w-auto object-contain" /></button>
                  <button type="button" onClick={() => openPayment("easypaisa")} aria-label="View Easypaisa payment details" className="flex h-8 items-center rounded-md border border-white/10 bg-white px-2 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#F4C542]"><img src="/Assets/EasyPaisa.png" alt="Easypaisa" className="max-h-6 w-auto object-contain" /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 bg-[#08182E] px-6 py-4"><div className="flex items-center justify-center text-center"><p className="text-sm text-slate-300">© {new Date().getFullYear()} FixItNow. All rights reserved.</p></div></div>
      </footer>
      {paymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closePayment(); }}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div className="flex items-center gap-3"><CreditCard className="text-orange-500" size={21} /><h3 className="text-lg font-bold text-slate-900">{paymentModal.title}</h3></div><button type="button" onClick={closePayment} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Close payment details"><X size={19} /></button></div>
            <div className="space-y-3 p-5">
              {paymentModal.details.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3"><span className="text-sm text-slate-500">{label}</span><span className="break-all text-right text-sm font-semibold text-slate-900">{value}</span></div>)}
              <button type="button" onClick={copyAccount} className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">{copied ? <Check size={17} /> : <Copy size={17} />}{copied ? "Account number copied" : "Copy account number"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
