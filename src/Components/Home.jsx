import { ArrowDown, Wrench, LayoutDashboard, ClipboardList } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../context/I18nContext.jsx';
import { useState, useEffect } from 'react';

export default function Home() {
  const { openModal } = useModal();
  const { user, newJobNotification } = useAuth();
  const { t } = useI18n();
  const isWorker = user?.type === 'worker';
  const isCustomer = user?.type === 'customer';
  
  const [jobCount, setJobCount] = useState(0);

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openBookings = () => {
    window.dispatchEvent(new CustomEvent('open-my-bookings'));
  };

  const openWorkerSignup = () => {
    // Open signup modal with worker tab selected
    openModal('signup');
    // Set worker tab active after modal opens
    setTimeout(() => {
      const workerTab = document.querySelector('[data-signup-type="worker"]');
      if (workerTab) {
        workerTab.click();
      }
    }, 100);
  };

  useEffect(() => {
    if (!isWorker || !newJobNotification) return;
    setJobCount((prev) => prev + 1);
  }, [isWorker, newJobNotification]);

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/Assets/Home.png')" }}
    >
      <div className="absolute inset-0 bg-slate-950/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/15" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-2xl text-center mt-16">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl font-display">
            {isWorker ? t('hero.titleWorker') : t('hero.title')}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-200 max-w-lg mx-auto">
            {isWorker ? t('hero.subtitleWorker') : t('hero.subtitle')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {!isWorker && !isCustomer && (
              <>
                <button
                  onClick={scrollToBooking}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-orange-600 hover:shadow-orange-500/50 hover:shadow-2xl"
                >
                  {t('hero.bookNow')}
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={openWorkerSignup}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-900 px-6 py-3 text-sm font-bold text-white backdrop-blur shadow-lg shadow-blue-900/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:bg-blue-800 hover:shadow-blue-900/50 hover:shadow-2xl"
                >
                  <Wrench size={16} />
                  {t('hero.joinWorker')}
                </button>
              </>
            )}
            {isCustomer && (
              <>
                <button
                  onClick={openBookings}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/30"
                >
                  <ClipboardList size={16} />
                  {t('hero.viewBookings')}
                </button>
                <button
                  onClick={scrollToBooking}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
                >
                  <ArrowDown size={16} />
                  {t('hero.bookNow')}
                </button>
              </>
            )}
            {isWorker && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-worker-dashboard'))}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
              >
                <LayoutDashboard size={16} />
                {t('hero.goDashboard')}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
