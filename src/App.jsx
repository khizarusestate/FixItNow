import { lazy, Suspense } from "react";
import { AuthProvider } from "./context/AuthContext";
import { GuideProvider } from "./context/GuideContext";
import { ModalProvider } from "./context/ModalContext";
import ErrorBoundary from "./Components/ErrorBoundary";
import Header from "./Components/Header";
import Home from "./Components/Home";
import Contact from "./Components/Contact";
import LegalSection from "./Components/LegalSection";

const BookingSection = lazy(() => import("./Components/BookingSection"));
const ApprovedAds = lazy(() => import("./Components/ApprovedAds"));
const AdvertiseSection = lazy(() => import("./Components/AdvertiseSection"));
const ReviewsSection = lazy(() => import("./Components/ReviewsSection"));
const About = lazy(() => import("./Components/About"));
const Login = lazy(() => import("./Components/Login"));
const Signup = lazy(() => import("./Components/Signup"));
const ForgotPassword = lazy(() => import("./Components/ForgotPassword"));
const CompleteProfile = lazy(() => import("./Components/CompleteProfile"));
const WorkerModal = lazy(() => import("./Components/WorkerModal"));

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
      <AuthProvider>
        <GuideProvider>
        <ModalProvider>
          <div className="relative">
            <Header />
            <main className="bg-slate-50 text-slate-900">
              <Home />
              <Suspense fallback={<SectionFallback />}>
                <BookingSection />
                <ApprovedAds />
                <AdvertiseSection />
                <ReviewsSection />
              </Suspense>
              <LegalSection />
              <Contact />
            </main>
            <Suspense fallback={null}>
              <About />
              <Login />
              <Signup />
              <ForgotPassword />
              <WorkerModal />
              <CompleteProfile />
            </Suspense>
          </div>
        </ModalProvider>
        </GuideProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
