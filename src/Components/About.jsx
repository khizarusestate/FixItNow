import { Users, Wrench, ShieldCheck, Clock, Award, Target, X } from 'lucide-react';
import { useModal } from '../context/ModalContext';
import { useI18n } from '../context/I18nContext.jsx';

export default function About() {
  const { t } = useI18n();
  const { activeModal, closeModal, openModal } = useModal();

  if (activeModal !== 'about') return null;

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto">
      <div className="fixed inset-0 bg-blue-900/50 backdrop-blur-sm" onClick={closeModal} />
      <div className="relative min-h-screen bg-white scrollbar-thin scrollbar-thumb-orange-400 scrollbar-track-slate-200">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-300/20 rounded-full blur-3xl" />
        </div>

        <button onClick={closeModal} className="fixed top-4 right-4 z-50 rounded-full bg-orange-100 p-3 text-orange-600 hover:bg-orange-200 transition-all hover:scale-110">
          <X size={22} />
        </button>

        <div className="relative z-10 px-5 py-12 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-10">
              <img src="/Assets/Logo.png" alt="Fix It Now" className="h-16 w-auto mx-auto mb-4" />
              <p className="text-sm font-bold uppercase tracking-widest text-orange-500">{t('about.title')}</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">{t('about.title')}</h2>
              <p className="mt-3 max-w-xl mx-auto text-base text-slate-600">{t('about.subtitle')}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
              {[
                { icon: Users, value: '5000+', label: 'Happy Customers' },
                { icon: Wrench, value: '200+', label: 'Verified Workers' },
                { icon: ShieldCheck, value: '100%', label: 'Verified Services' },
                { icon: Clock, value: '24/7', label: 'Support Available' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="group rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 text-center transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-200/50">
                  <Icon className="mx-auto h-9 w-9 text-orange-500 mb-3 transition-transform group-hover:rotate-12" />
                  <div className="text-2xl font-bold text-orange-600 mb-1">{value}</div>
                  <div className="text-sm text-slate-600">{label}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-8 lg:grid-cols-2 mb-12">
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-7">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Our Story</h3>
                <p className="text-slate-700 leading-6">FixItNow started with a simple mission: make home services reliable and accessible. We saw people struggling to find trustworthy providers and built a solution. Today we serve thousands across multiple cities.</p>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-7">
                <h3 className="text-xl font-bold text-orange-600 mb-3">Our Mission</h3>
                <p className="text-slate-700 leading-6 mb-4">Revolutionize home services with quality, reliability, and complete transparency.</p>
                <div className="space-y-2">
                  {[
                    { icon: Target, text: 'Quality service guaranteed' },
                    { icon: ShieldCheck, text: 'Verified professionals only' },
                    { icon: Clock, text: 'Fast response times' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-3 p-2.5 rounded-lg bg-white/60">
                      <Icon className="h-4 w-4 text-orange-500 shrink-0" />
                      <span className="text-sm text-slate-700">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-3 mb-12">
              {[
                { icon: Award, title: 'Excellence', desc: 'Highest standards in service quality and customer satisfaction.' },
                { icon: ShieldCheck, title: 'Trust', desc: 'Every worker verified and tracked for complete peace of mind.' },
                { icon: Clock, title: 'Efficiency', desc: 'Quick booking, fast responses, and timely service delivery.' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="group rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 p-6 transition-all hover:scale-105 hover:shadow-lg hover:shadow-orange-200/50">
                  <Icon className="h-9 w-9 text-orange-500 mb-3 transition-transform group-hover:rotate-12" />
                  <h4 className="text-base font-semibold text-orange-600 mb-1">{title}</h4>
                  <p className="text-sm text-slate-700">{desc}</p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Ready for Quality Service?</h3>
              <p className="text-slate-600 mb-5 text-sm">Join thousands who trust FixItNow for their home service needs.</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    closeModal();
                    requestAnimationFrame(() => {
                      document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 transition-colors">
                  Book a Service
                </button>
                <button onClick={() => openModal('signup')}
                  className="rounded-lg border-2 border-orange-300 bg-orange-50 px-6 py-3 text-sm font-bold text-orange-600 hover:bg-orange-100 transition-colors">
                  Join as Worker
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
