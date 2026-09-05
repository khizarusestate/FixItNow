import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { OAuthConfigProvider } from "./context/OAuthConfigContext.jsx";
import { LegalProvider } from "./context/LegalContext.jsx";
import { I18nProvider } from "./context/I18nContext.jsx";
import { MaintenanceModeProvider } from "./context/MaintenanceContext.jsx";
import { GuideProvider } from "./context/GuideContext";
import { ModalProvider } from "./context/ModalContext";
import ErrorBoundary from "./Components/ErrorBoundary";
import Header from "./Components/Header";
import Home from "./Components/Home";
import WorkerLiveLocationPublisher from "./Components/shared/WorkerLiveLocationPublisher.jsx";
import AIChat from "./Components/AIChat";
import Messenger from "./Components/Messenger.jsx";
import SupportMessenger from "./Components/SupportMessenger.jsx";
const BookingSection = lazy(() => import("./Components/BookingSection"));
const ApprovedAds = lazy(() => import("./Components/ApprovedAds"));
const AdvertiseSection = lazy(() => import("./Components/AdvertiseSection"));
const ReviewsSection = lazy(() => import("./Components/ReviewsSection"));
const About = lazy(() => import("./Components/About"));
const Login = lazy(() => import("./Components/Login"));
const Signup = lazy(() => import("./Components/Signup"));
const ForgotPassword = lazy(() => import("./Components/ForgotPassword"));
const CompleteProfile = lazy(() => import("./Components/CompleteProfile"));
import Footer from "./Components/Footer";
const VerifyEmail = lazy(() => import("./Components/VerifyEmail"));
const WorkerApprovalPending = lazy(() => import("./Components/WorkerApprovalPending"));

function SectionFallback() {
  return (
    <div className="flex min-h-[12rem] items-center justify-center bg-slate-50 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MaintenanceModeProvider>
        <I18nProvider>
          <OAuthConfigProvider>
            <AuthProvider>
              <WorkerLiveLocationPublisher />
              <GuideProvider>
                <ModalProvider>
                  <LegalProvider>
                    <div className="relative" data-fixitnow-app="ready">
                      <Header />
                      <main className="bg-slate-50 text-slate-900 animate-fadeIn">
                        <Home />
                        <Suspense fallback={<SectionFallback />}>
                          <BookingSection />
                          <ApprovedAds />
                          <AdvertiseSection />
                          <ReviewsSection />
                        </Suspense>
                      </main>
                      <Suspense fallback={null}>
                        <About />
                        <Login />
                        <Signup />
                        <VerifyEmail />
                        <WorkerApprovalPending />
                        <Footer />
                      </Suspense>
                    </div>
                    <Messenger />
                    <SupportMessenger />
                    <AIChat />
                  </LegalProvider>
                </ModalProvider>
              </GuideProvider>
            </AuthProvider>
          </OAuthConfigProvider>
        </I18nProvider>
      </MaintenanceModeProvider>
    </ErrorBoundary>
  );
}
