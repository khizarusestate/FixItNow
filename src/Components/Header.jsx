import { useState, useEffect } from 'react';
import { Menu, X, UserPlus, LogIn, User, ClipboardList, Home, Info, Mail, HelpCircle } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useAuth } from '../context/AuthContext';
import { setUserData } from '../utils/jwt.js';
import ProfileAvatar from './shared/ProfileAvatar.jsx';
import MyBookings from './MyBookings';
import WorkerDashboard from './WorkerDashboard';
import ProfileModal from './ProfileModal';
import NotificationBell from './NotificationBell';
import { useGuide } from '../context/GuideContext';
import { useI18n } from '../context/I18nContext.jsx';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t, locale, setLocale } = useI18n();
  const [bookingsOpen, setBookingsOpen] = useState(false);
  const [workerDashOpen, setWorkerDashOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { openModal } = useModal();
  const { openGuide } = useGuide();
  const auth = useAuth();
  const { isAuthenticated, user, logout, setUser, badgeCount, markUpdatesSeen } = auth || {};
  const displayBadge = badgeCount > 0 ? (badgeCount > 9 ? '9+' : badgeCount) : null;

  useEffect(() => {
    const workerHandler = () => setWorkerDashOpen(true);
    const bookingsHandler = () => setBookingsOpen(true);
    const profileHandler = () => setProfileOpen(true);

    window.addEventListener('open-worker-dashboard', workerHandler);
    window.addEventListener('open-my-bookings', bookingsHandler);
    window.addEventListener('open-profile-modal', profileHandler);
    return () => {
      window.removeEventListener('open-worker-dashboard', workerHandler);
      window.removeEventListener('open-my-bookings', bookingsHandler);
      window.removeEventListener('open-profile-modal', profileHandler);
    };
  }, []);

  const close = () => setMenuOpen(false);
  const openHelp = () => {
    openGuide();
    close();
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center w-24">
            <img src="/Assets/Logo.png" alt="Fix It Now" className="h-14 w-auto" />
          </div>

          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <button onClick={() => scrollToSection('home')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 whitespace-nowrap">
              <Home size={16} /> <span className="truncate">{t('nav.home')}</span>
            </button>
            <button onClick={() => openModal('about')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 whitespace-nowrap">
              <Info size={16} /> <span className="truncate">{t('nav.about')}</span>
            </button>
            <button onClick={() => scrollToSection('contact')} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 whitespace-nowrap">
              <Mail size={16} /> <span className="truncate">{t('nav.contact')}</span>
            </button>
          </nav>

          <nav className="hidden lg:flex items-center gap-2 justify-end">
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 focus:border-orange-400 focus:outline-none"
              aria-label="Language"
            >
              <option value="en">{t('lang.en')}</option>
              <option value="ur">{t('lang.ur')}</option>
            </select>
            <button
              type="button"
              onClick={openHelp}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 border border-slate-200 hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700 transition-all whitespace-nowrap"
              aria-label="Help"
            >
              <HelpCircle size={16} />
              <span className="truncate">{t('nav.help')}</span>
            </button>
            {isAuthenticated ? (
              <>
                <NotificationBell />
                {user?.type === 'worker' ? (
                  <button
                    onClick={() => {
                      markUpdatesSeen?.();
                      setWorkerDashOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border-2 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:shadow-md whitespace-nowrap relative"
                  >
                    <ClipboardList size={14} /> <span className="truncate">{t('nav.dashboard')}</span>
                    {displayBadge && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {displayBadge}
                      </span>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      markUpdatesSeen?.();
                      setBookingsOpen(true);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border-2 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-300 hover:shadow-md whitespace-nowrap relative"
                  >
                    <ClipboardList size={14} /> <span className="truncate">{t('nav.bookings')}</span>
                    {displayBadge && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {displayBadge}
                      </span>
                    )}
                  </button>
                )}
                <button
                  onClick={() => setProfileOpen(true)}
                  className="flex flex-col items-center gap-0.5 p-1 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <ProfileAvatar
                    src={user?.profilePicture}
                    name={user?.fullName || user?.name}
                    className="w-10 h-10"
                  />
                  <span className="text-[10px] text-slate-600 font-medium truncate max-w-[60px]">{user?.fullName?.split(' ')[0] || 'Profile'}</span>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => openModal('signup')} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                  <UserPlus size={14} /> <span className="truncate">{t('nav.signup')}</span>
                </button>
                <button onClick={() => openModal('login')} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap">
                  <LogIn size={14} /> <span className="truncate">{t('nav.login')}</span>
                </button>
              </>
            )}
          </nav>

          <div className="flex lg:hidden items-center gap-1">
            <button
              type="button"
              onClick={openHelp}
              className="p-2 rounded-lg text-slate-700 hover:bg-orange-50"
              aria-label="Help"
            >
              <HelpCircle size={22} />
            </button>
            {isAuthenticated && <NotificationBell />}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-slate-700" aria-label="Toggle menu">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="lg:hidden py-4 border-t border-slate-200 flex flex-col gap-2">
            <button onClick={() => { scrollToSection('home'); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-orange-50">
              <Home size={16} /> Home
            </button>
            <button onClick={() => { openModal('about'); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-orange-50">
              <Info size={16} /> About Us
            </button>
            <button onClick={() => { scrollToSection('contact'); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-orange-50">
              <Mail size={16} /> Contact
            </button>
            <button type="button" onClick={openHelp} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-orange-50">
              <HelpCircle size={16} /> Help
            </button>
            {isAuthenticated ? (
              <>
                {user?.type === 'worker' ? (
                  <button onClick={() => { setWorkerDashOpen(true); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-orange-50 relative">
                    <ClipboardList size={16} /> Dashboard
                    {user?.jobCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {user.jobCount > 9 ? '9+' : user.jobCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <button type="button" onClick={() => { setBookingsOpen(true); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium border border-slate-200 text-slate-700 hover:bg-orange-50">
                    <ClipboardList size={16} /> My Bookings
                  </button>
                )}
                <button onClick={() => { setProfileOpen(true); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  <ProfileAvatar
                    src={user?.profilePicture}
                    name={user?.fullName || user?.name}
                    className="w-10 h-10"
                  />
                  <div className="text-left">
                    <p className="font-semibold">{user?.fullName || 'Profile'}</p>
                    <p className="text-xs text-slate-500">View Profile</p>
                  </div>
                </button>
              </>
            ) : (
              <>
                <button onClick={() => { openModal('signup'); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-orange-500 text-white">
                  <UserPlus size={16} /> Sign Up
                </button>
                <button onClick={() => { openModal('login'); close(); }} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-slate-900 text-white">
                  <LogIn size={16} /> Login
                </button>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
    <MyBookings isOpen={bookingsOpen} onClose={() => setBookingsOpen(false)} />
    <WorkerDashboard isOpen={workerDashOpen} onClose={() => setWorkerDashOpen(false)} />
    <ProfileModal
      isOpen={profileOpen}
      onClose={() => setProfileOpen(false)}
      userData={user}
      onProfileUpdate={(updatedData) => {
        setUser(updatedData);
        if (updatedData?.type) {
          setUserData(updatedData, updatedData.type);
        }
      }}
      onLogout={() => {
        logout();
        setProfileOpen(false);
      }}
    />
    </>
  );
}
