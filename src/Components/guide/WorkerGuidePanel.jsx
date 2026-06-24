import { useEffect, useState } from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  MapPin,
  CheckCircle,
  Bell,
} from "lucide-react";
import { lockPageScroll, unlockPageScroll } from "../../guide/scrollLock";
import { useI18n } from "../../context/I18nContext.jsx";

const PAGE_DEFS = [
  {
    id: "dashboard",
    titleKey: "guide.worker.dashboard.title",
    subtitleKey: "guide.worker.dashboard.subtitle",
    icon: Briefcase,
    accent: "from-slate-800 to-slate-950",
  },
  {
    id: "claim",
    titleKey: "guide.worker.claim.title",
    subtitleKey: "guide.worker.claim.subtitle",
    icon: MapPin,
    accent: "from-orange-500 to-amber-500",
  },
  {
    id: "done",
    titleKey: "guide.worker.done.title",
    subtitleKey: "guide.worker.done.subtitle",
    icon: CheckCircle,
    accent: "from-blue-500 to-indigo-600",
  },
  {
    id: "alerts",
    titleKey: "guide.worker.alerts.title",
    subtitleKey: "guide.worker.alerts.subtitle",
    icon: Bell,
    accent: "from-emerald-500 to-teal-600",
  },
];

export default function WorkerGuidePanel({ isOpen, onClose }) {
  const { t } = useI18n();
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const PAGES = PAGE_DEFS.map((p) => ({
    ...p,
    title: t(p.titleKey),
    subtitle: t(p.subtitleKey),
  }));

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
  const Icon = meta.icon;
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
      aria-labelledby="worker-guide-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-md"
        onClick={onClose}
        aria-label="Close guide"
      />

      <div className="relative flex w-full max-w-md max-h-[min(88vh,560px)] flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl shadow-slate-500/10 animate-scaleIn">
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
                Worker guide · {page + 1}/{PAGES.length}
              </p>
              <h2
                id="worker-guide-title"
                className="text-lg font-bold text-slate-900 leading-tight"
              >
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

        <div className="flex-1 overflow-y-auto px-5 py-6 min-h-[120px]">
          <div
            key={page}
            className={
              direction >= 0 ? "animate-guideSlideNext" : "animate-guideSlidePrev"
            }
          >
            <div className="rounded-xl border border-slate-100 bg-gradient-to-br from-slate-50 to-white p-4 text-sm text-slate-600">
              Tip: Complete your profile with your work location so matching jobs appear
              near you.
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-1.5 pb-2">
          {PAGES.map((_, i) => (
            <button
              key={PAGES[i].id}
              type="button"
              onClick={() => go(i)}
              className={`h-2 rounded-full transition-all ${
                i === page ? "w-6 bg-orange-500" : "w-2 bg-slate-200"
              }`}
              aria-label={`Go to step ${i + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={() => (page > 0 ? go(page - 1) : null)}
            disabled={page === 0}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 disabled:opacity-40"
          >
            <ChevronLeft size={16} />
            {t("common.back")}
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              {t("guide.getStarted")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => go(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
            >
              {t("guide.next")}
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
