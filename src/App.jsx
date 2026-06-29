import { lazy, Suspense, useEffect } from "react";
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
import Contact from "./Components/Contact";
import socketClient from "./utils/socketClient";
import { useAuth } from "./context/AuthContext";

const BookingSection = lazy(() => import("./Components/BookingSection"));
const ApprovedAds = lazy(() => import("./Components/ApprovedAds"));
const AdvertiseSection = lazy(() => import("./Components/AdvertiseSection"));
const ReviewsSection = lazy(() => import("./Components/ReviewsSection"));
const About = lazy(() => import("./Components/About"));
const Login = lazy(() => import("./Components/Login"));
const Signup = lazy(() => import("./Components/Signup"));
const ForgotPassword = lazy(() => import("./Components/ForgotPassword"));
const CompleteProfile = lazy(() => import("./Components/CompleteProfile"));
const VerifyEmail = lazy(() => import("./Components/VerifyEmail"));
const WorkerModal = lazy(() => import("./Components/WorkerModal"));
const WorkerProfessionalSignup = lazy(
  () => import("./Components/WorkerProfessionalSignup"),
);

function SectionFallback() {
  return (
    <div className="flex min-h-[12rem] items-center justify-center bg-slate-50 py-16">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
    </div>
  );
}

// Component to initialize socket when user is logged in
function SocketInitializer({ children }) {
  const { currentUser } = useAuth?.() || {};

  useEffect(() => {
    if (currentUser?.id) {
      // Connect socket
      socketClient.connect(currentUser.id);

      // Listen for notifications
      socketClient.on('notification', (notification) => {
        console.log('📲 Notification received:', notification);
        // TODO: Show toast or notification in your UI
        // Example: toast.success(notification.message);
      });

      // Cleanup on logout
      return () => {
        socketClient.disconnect();
      };
    }
  }, [currentUser?.id]);

  return children;
}

export default function App() {
  return (
    <ErrorBoundary>
      <MaintenanceModeProvider>
        <I18nProvider>
        <OAuthConfigProvider>
          <AuthProvider>
            <GuideProvider>
              <ModalProvider>
                <LegalProvider>
                  <SocketInitializer>
                    <div className="relative">
                      <Header />
                      <main className="bg-slate-50 text-slate-900 animate-fadeIn">
                        <Home />
                        <Suspense fallback={<SectionFallback />}>
                          <BookingSection />
                          <ApprovedAds />
                          <AdvertiseSection />
                          <ReviewsSection />
                        </Suspense>
                        <Contact />
                      </main>
                      <Suspense fallback={null}>
                        <About />
                        <Login />
                        <Signup />
                        <ForgotPassword />
                        <VerifyEmail />
                        <WorkerModal />
                        <WorkerProfessionalSignup />
                        <CompleteProfile />
                      </Suspense>
                    </div>
                  </SocketInitializer>
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
