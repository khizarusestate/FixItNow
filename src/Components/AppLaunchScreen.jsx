import { useEffect, useState } from "react";

export default function AppLaunchScreen() {
  const [leaving, setLeaving] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let observer;

    const checkReady = () => {
      // AuthProvider renders the real app only after its session/bootstrap work finishes.
      const appReady = Boolean(document.querySelector('[data-fixitnow-app="ready"]'));
      if (appReady && !cancelled) {
        setReady(true);
        window.setTimeout(() => setLeaving(true), 80);
      }
    };

    observer = new MutationObserver(checkReady);
    observer.observe(document.body, { childList: true, subtree: true });
    checkReady();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  if (leaving) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] flex min-h-[100dvh] items-center justify-center overflow-hidden bg-slate-950 px-6 text-white transition-opacity duration-500 ${ready ? "opacity-0" : "opacity-100"}`}
      role="status"
      aria-live="polite"
      aria-label="Starting FixItNow"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="launch-orb launch-orb-one" />
        <div className="launch-orb launch-orb-two" />
        <div className="launch-grid" />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center text-center">
        <div className="relative mb-7 flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 rounded-[2rem] border border-orange-400/20 launch-ring launch-ring-one" />
          <div className="absolute inset-3 rounded-[1.5rem] border border-white/10 launch-ring launch-ring-two" />
          <div className="absolute inset-5 rounded-[1.25rem] bg-orange-500/10 blur-xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-white shadow-[0_18px_60px_rgba(249,115,22,0.18)] launch-logo">
            <img src="/Assets/Logo.png" alt="FixItNow" className="max-h-14 w-auto object-contain" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">FixItNow</h1>
        <p className="mt-2 text-sm font-medium tracking-wide text-slate-400 sm:text-base">
          Your home. Your services. Fixed.
        </p>

        <div className="mt-9 w-full max-w-xs">
          <div className="mb-3 flex items-center justify-center gap-2 text-xs font-medium text-slate-400">
            <span className="inline-flex h-2 w-2 rounded-full bg-orange-400 launch-dot" />
            <span>Preparing your experience…</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 launch-progress" />
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <span className="launch-step active" />
            <span className="launch-step active delay-1" />
            <span className="launch-step delay-2" />
          </div>
        </div>
      </div>

      <style>{`
        .launch-orb { position:absolute; border-radius:9999px; filter:blur(70px); opacity:.18; animation:launchFloat 7s ease-in-out infinite; }
        .launch-orb-one { width:280px; height:280px; top:12%; left:-110px; background:rgb(249 115 22); }
        .launch-orb-two { width:240px; height:240px; right:-100px; bottom:8%; background:rgb(59 130 246); animation-delay:-3s; }
        .launch-grid { position:absolute; inset:0; opacity:.07; background-image:linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px); background-size:44px 44px; mask-image:radial-gradient(circle at center,black 0%,transparent 72%); }
        .launch-ring { animation:launchSpin 8s linear infinite; }
        .launch-ring-two { animation-direction:reverse; animation-duration:6s; }
        .launch-logo { animation:launchLogo 2.2s ease-in-out infinite; }
        .launch-dot { animation:launchDot 1.1s ease-in-out infinite; }
        .launch-progress { animation:launchProgress 1.7s ease-in-out infinite; transform-origin:left; }
        .launch-step { display:block; width:6px; height:6px; border-radius:9999px; background:rgba(255,255,255,.2); animation:launchStep 1.3s ease-in-out infinite; }
        .launch-step.active { background:rgb(251 146 60); }
        .delay-1 { animation-delay:.2s; } .delay-2 { animation-delay:.4s; }
        @keyframes launchSpin { to { transform:rotate(360deg); } }
        @keyframes launchLogo { 0%,100% { transform:translateY(0) scale(1); } 50% { transform:translateY(-3px) scale(1.025); } }
        @keyframes launchDot { 0%,100% { opacity:.45; transform:scale(.8); } 50% { opacity:1; transform:scale(1.15); } }
        @keyframes launchProgress { 0% { transform:translateX(-75%); } 50% { transform:translateX(15%); } 100% { transform:translateX(90%); } }
        @keyframes launchStep { 0%,100% { opacity:.35; transform:scale(.85); } 50% { opacity:1; transform:scale(1.2); } }
        @keyframes launchFloat { 0%,100% { transform:translate3d(0,0,0); } 50% { transform:translate3d(20px,-16px,0); } }
        @media (prefers-reduced-motion:reduce) { .launch-ring,.launch-logo,.launch-dot,.launch-progress,.launch-step,.launch-orb { animation:none; } }
      `}</style>
    </div>
  );
}
