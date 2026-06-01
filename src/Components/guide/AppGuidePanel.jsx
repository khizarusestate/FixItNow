import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Menu,
  ClipboardList,
  Star,
  Sparkles,
  Hammer,
  Home,
  HelpCircle,
  CheckCircle,
  Clock,
  ArrowDown,
} from "lucide-react";
import { lockPageScroll, unlockPageScroll } from "../../guide/scrollLock";

const PAGES = [
  {
    id: "book",
    title: "Book a service",
    subtitle: "Pick a category, choose a service, and submit your request in minutes.",
    icon: CalendarCheck,
    accent: "from-orange-500 to-amber-500",
  },
  {
    id: "menu",
    title: "Open the menu (mobile)",
    subtitle: "On your phone, tap the menu icon to reach Help, My Bookings, and more.",
    icon: Menu,
    accent: "from-slate-700 to-slate-900",
  },
  {
    id: "bookings",
    title: "My Bookings",
    subtitle: "Track every request — pending, approved, in progress, and completed.",
    icon: ClipboardList,
    accent: "from-blue-500 to-indigo-600",
  },
  {
    id: "complete",
    title: "Complete & rate",
    subtitle: "When work is done, rate your worker and tap Mark as Done to finish.",
    icon: Star,
    accent: "from-emerald-500 to-teal-600",
  },
];

function HighlightRing({ children, label }) {
  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div className="absolute -inset-1.5 rounded-xl bg-orange-400/30 animate-pulse ring-2 ring-orange-500 ring-offset-2" />
      {children}
      {label ? (
        <span className="relative z-10 text-[10px] font-bold uppercase tracking-wide text-orange-600">
          {label}
        </span>
      ) : null}
    </div>
  );
}

function PageBook() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-3 shadow-inner">
        <p className="text-[10px] font-bold uppercase text-orange-600 mb-2">
          Booking section
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Sparkles, label: "Cleaning", color: "from-emerald-400 to-teal-500" },
            { icon: Hammer, label: "Repair", color: "from-orange-400 to-amber-500" },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="rounded-lg border border-orange-100 bg-white p-2 shadow-sm"
            >
              <div
                className={`mb-1.5 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color} text-white`}
              >
                <Icon size={16} />
              </div>
              <p className="text-xs font-bold text-blue-900">{label}</p>
            </div>
          ))}
        </div>
        <HighlightRing label="Tap category">
          <button
            type="button"
            className="mt-3 w-full rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white shadow-md"
          >
            Select service → Book
          </button>
        </HighlightRing>
      </div>
      <p className="text-xs text-slate-500 flex items-center gap-1">
        <ArrowDown size={12} className="text-orange-500" />
        Scroll to <strong className="text-blue-900">Book a Service</strong> on the home page
      </p>
    </div>
  );
}

function PageMenu() {
  return (
    <div className="mx-auto max-w-[220px]">
      <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-3 py-2.5">
          <img src="/Assets/Logo.png" alt="" className="h-7 w-auto opacity-80" />
          <div className="flex items-center gap-1">
            <HighlightRing>
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-blue-900">
                <Menu size={20} />
              </span>
            </HighlightRing>
          </div>
        </div>
        <div className="p-2 space-y-1 bg-slate-50 animate-slideDown">
          {[
            { icon: Home, label: "Home" },
            { icon: HelpCircle, label: "Help" },
            { icon: ClipboardList, label: "My Bookings", highlight: true },
          ].map(({ icon: Icon, label, highlight }) => (
            <div
              key={label}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium ${
                highlight
                  ? "border-2 border-orange-400 bg-orange-50 text-orange-800 shadow-sm"
                  : "border border-slate-200 bg-white text-blue-900"
              }`}
            >
              <Icon size={14} className={highlight ? "text-orange-600" : ""} />
              {label}
              {highlight ? (
                <span className="ml-auto text-[9px] font-bold uppercase text-orange-600">
                  Here
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-slate-500">
        On desktop, <strong>My Bookings</strong> is directly in the header.
      </p>
    </div>
  );
}

function PageBookings() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex items-center justify-end gap-2 mb-2 px-1">
          <span className="text-[10px] text-slate-400">Header</span>
          <HighlightRing label="My Bookings">
            <span className="relative z-10 inline-flex items-center gap-1 rounded-lg border-2 border-slate-200 px-2.5 py-1.5 text-xs font-medium text-blue-900">
              <ClipboardList size={12} />
              My Bookings
            </span>
          </HighlightRing>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">Home Cleaning</p>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
              <Clock size={10} /> Pending
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Waiting for admin approval</p>
        </div>
        <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-blue-900">Plumbing fix</p>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
              In progress
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageComplete() {
  return (
    <div className="rounded-xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4">
      <p className="text-sm font-bold text-blue-900">Home Cleaning</p>
      <p className="text-xs text-slate-500 mt-0.5">Worker finished on site</p>
      <div className="mt-3 rounded-lg border border-emerald-200 bg-white p-3">
        <p className="text-[10px] font-bold uppercase text-slate-600 mb-2">
          Rate this service
        </p>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={22}
              className={n <= 4 ? "fill-amber-400 text-amber-400" : "text-slate-200"}
            />
          ))}
        </div>
        <HighlightRing>
          <button
            type="button"
            className="relative z-10 w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 py-2.5 text-xs font-bold text-white shadow-md"
          >
            ✓ Mark as Done
          </button>
        </HighlightRing>
      </div>
      <p className="mt-2 text-xs text-slate-600 flex items-start gap-1.5">
        <CheckCircle size={14} className="shrink-0 text-emerald-600 mt-0.5" />
        Both you and the worker confirm — then the job is fully complete.
      </p>
    </div>
  );
}

const PAGE_VISUALS = {
  book: PageBook,
  menu: PageMenu,
  bookings: PageBookings,
  complete: PageComplete,
};

export default function AppGuidePanel({ isOpen, onClose }) {
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (isOpen) {
      lockPageScroll();
      setPage(0);
      setDirection(1);
    } else {
      unlockPageScroll();
    }
    return () => unlockPageScroll();
  }, [isOpen]);

  if (!isOpen) return null;

  const meta = PAGES[page];
  const Visual = PAGE_VISUALS[meta.id];
  const Icon = meta.icon;
  const isFirst = page === 0;
  const isLast = page === PAGES.length - 1;

  const go = (next) => {
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  return (
    <div
      className="fixed inset-0 z-[250] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-guide-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close guide"
      />

      <div className="relative flex w-full max-w-md max-h-[min(92vh,640px)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-orange-500/10 animate-scaleIn">
        <div className={`h-1.5 shrink-0 bg-gradient-to-r ${meta.accent}`} />

        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 pt-4 pb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.accent} text-white shadow-lg`}
            >
              <Icon size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-orange-500">
                Quick guide · {page + 1}/{PAGES.length}
              </p>
              <h2 id="app-guide-title" className="text-lg font-bold text-blue-900 leading-tight">
                {meta.title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-5 text-sm text-slate-600 leading-relaxed">{meta.subtitle}</p>

        <div className="flex-1 overflow-y-auto px-5 py-4 min-h-[200px]">
          <div
            key={page}
            className={
              direction >= 0 ? "animate-guideSlideNext" : "animate-guideSlidePrev"
            }
          >
            <Visual />
          </div>
        </div>

        <div className="flex justify-center gap-1.5 pb-2">
          {PAGES.map((_, i) => (
            <button
              key={PAGES[i].id}
              type="button"
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === page ? "w-6 bg-orange-500" : "w-2 bg-slate-200 hover:bg-slate-300"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-4 py-3">
          <button
            type="button"
            onClick={() => go(page - 1)}
            disabled={isFirst}
            className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-blue-900 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-all"
          >
            <ChevronLeft size={18} />
            Previous
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Get started
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(page + 1)}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-orange-700 transition-all"
            >
              Next
              <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
