import { ArrowDown, Wrench, LayoutDashboard, ClipboardList, Bell, X } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Home() {
  const { openModal } = useModal();
  const { user, newJobNotification, openWorkerDashboard } = useAuth();
  const isWorker = user?.type === 'worker';
  const isCustomer = user?.type === 'customer';
  
  // Notification state for new jobs
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
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

  // Surface job alerts from AuthContext (single socket connection)
  useEffect(() => {
    if (!isWorker || !newJobNotification) return;
    setJobCount((prev) => prev + 1);
    const title =
      newJobNotification.booking?.serviceTitle ||
      newJobNotification.message ||
      'New job available';
    setNotificationMessage(`New job: ${title}`);
    setShowNotification(true);
    const timer = setTimeout(() => setShowNotification(false), 8000);
    return () => clearTimeout(timer);
  }, [isWorker, newJobNotification]);

  return (
    <section
      id="home"
      className="relative min-h-screen overflow-hidden bg-cover bg-center text-white"
      style={{ backgroundImage: "url('/Assets/Home.png')" }}
    >
      {/* Worker Notification */}
      {isWorker && showNotification && (
        <button
          type="button"
          onClick={() => {
            setShowNotification(false);
            openWorkerDashboard?.();
          }}
          className="fixed top-4 right-4 z-50 bg-orange-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-pulse hover:bg-orange-600"
        >
          <Bell size={20} className="animate-bounce" />
          <span className="font-bold">{notificationMessage}</span>
          <span className="text-xs underline">Open dashboard</span>
        </button>
      )}
      
      <div className="absolute inset-0 bg-slate-950/65" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/15" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-2xl text-center mt-16">
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {isWorker ? 'Welcome back, Professional' : 'Reliable help for everyday home problems'}
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-200 max-w-lg mx-auto">
            {isWorker 
              ? 'Manage your jobs, update your profile, and connect with customers.' 
              : 'Verified workers, fast requests — one platform for all your home services.'}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            {!isWorker && !isCustomer && (
              <>
                <button
                  onClick={scrollToBooking}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-orange-600 hover:shadow-orange-500/30"
                >
                  Book a Service
                  <ArrowDown size={16} />
                </button>
                <button
                  onClick={openWorkerSignup}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
                >
                  <Wrench size={16} />
                  Join as Worker
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
                  View Bookings
                </button>
                <button
                  onClick={scrollToBooking}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
                >
                  <ArrowDown size={16} />
                  Book a Service
                </button>
              </>
            )}
            {isWorker && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-worker-dashboard'))}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/60 bg-white/10 px-6 py-3 text-sm font-bold text-white backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-slate-900"
              >
                <LayoutDashboard size={16} />
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
