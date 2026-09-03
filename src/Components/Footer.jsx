import { useEffect, useState } from "react";
import { MapPin, Mail, Phone, LockKeyhole, CreditCard, X, Copy, Check } from "lucide-react";

export default function Footer() {
  const [paymentModal, setPaymentModal] = useState(null);
  const [copied, setCopied] = useState(false);

  const paymentMethods = {
    jazzcash: {
      title: "JazzCash",
      icon: "/Assets/JazzCash.png",
      details: [
        ["Account Number", "03012220324"],
        ["Title", "Tahir Ayyub"],
      ],
    },
    easypaisa: {
      title: "Easypaisa",
      icon: "/Assets/EasyPaisa.png",
      details: [
        ["Account Number", "03012220324"],
        ["Title", "Tahir Ayyub"],
      ],
    },
    bank: {
      title: "Visa / Bank Transfer",
      details: [
        ["Account holder", "Tahir Ayyub"],
        ["Bank", "Allied Bank"],
        ["Account title", "Fix It Now"],
        ["Account #", "10420010075628250017"],
      ],
    },
  };

  const openPayment = (key) => {
    setCopied(false);
    setPaymentModal(paymentMethods[key]);
  };

  const closePayment = () => {
    setPaymentModal(null);
    setCopied(false);
  };

  const copyAccount = async () => {
    const account = paymentModal?.details?.find(([label]) => label === "Account Number" || label === "Account #")?.[1];
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard may be unavailable in some browsers/contexts.
    }
  };

  useEffect(() => {
    if (!paymentModal) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") closePayment();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paymentModal]);

  return (
    <>
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <h3 className="text-xl font-bold">FixItNow</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Reliable home services, trusted workers, and simple booking.
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Contact</h4>
              <div className="mt-4 space-y-3 text-sm text-slate-400">
                <p className="flex items-center gap-2"><MapPin size={16} /> Gujranwala, Pakistan</p>
                <p className="flex items-center gap-2"><Mail size={16} /> support@fixitnow.pk</p>
                <p className="flex items-center gap-2"><Phone size={16} /> Contact Support</p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold">Security</h4>
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-400">
                <LockKeyhole size={16} /> Secure payments & protected accounts
              </p>
            </div>

            <div>
              <h4 className="font-semibold">Payment Methods</h4>
              <p className="mt-2 text-xs text-slate-500">Click a payment method to view account details.</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => openPayment("jazzcash")}
                  className="group flex h-12 min-w-[92px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 transition hover:border-orange-400/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  aria-label="View JazzCash payment details"
                >
                  <img src={paymentMethods.jazzcash.icon} alt="JazzCash" className="max-h-7 max-w-[76px] object-contain" />
                </button>
                <button
                  type="button"
                  onClick={() => openPayment("easypaisa")}
                  className="group flex h-12 min-w-[92px] items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 transition hover:border-green-400/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-green-400"
                  aria-label="View Easypaisa payment details"
                >
                  <img src={paymentMethods.easypaisa.icon} alt="Easypaisa" className="max-h-7 max-w-[76px] object-contain" />
                </button>
                <button
                  type="button"
                  onClick={() => openPayment("bank")}
                  className="group flex h-12 min-w-[92px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 transition hover:border-blue-400/60 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="View Visa and bank transfer payment details"
                >
                  <span className="flex h-7 items-center rounded-md border border-white/10 bg-white px-2.5">
                    <span className="text-xs font-bold italic tracking-wide text-[#1434CB]">VISA</span>
                  </span>
                  <span className="text-xs font-semibold text-white">Card</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} FixItNow. All rights reserved.
          </div>
        </div>
      </footer>

      {paymentModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePayment();
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <CreditCard className="text-orange-500" size={21} />
                <h3 className="text-lg font-bold text-slate-900">{paymentModal.title}</h3>
              </div>
              <button
                type="button"
                onClick={closePayment}
                className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close payment details"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {paymentModal.details.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="break-all text-right text-sm font-semibold text-slate-900">{value}</span>
                </div>
              ))}

              <button
                type="button"
                onClick={copyAccount}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? "Account number copied" : "Copy account number"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
