import { useModal } from "../context/ModalContext";
import { CheckCircle, Mail, Clock, ArrowRight } from "lucide-react";
import { useI18n } from "../context/I18nContext.jsx";

export default function WorkerApprovalPending() {
    const { t } = useI18n();
    const { activeModal, modalPayload, closeModal, switchModal } = useModal();

    if (activeModal !== "workerApprovalPending") return null;

    const email = modalPayload?.email || "";

    return (
        <div className="fixed inset-0 z-[75] flex items-center justify-center px-4 animate-fadeIn">
            <button
                onClick={closeModal}
                className="absolute inset-0 bg-blue-900/40 backdrop-blur-sm"
                aria-label="Close"
            />
            <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl animate-slideUp">
                <div className="px-6 py-8">
                    <div className="flex justify-center mb-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                            <CheckCircle className="h-8 w-8 text-emerald-600" />
                        </div>
                    </div>

                    <h2 className="text-center text-2xl font-bold text-slate-900 mb-2">
                        Email Verified! ✓
                    </h2>

                    <p className="text-center text-slate-600 mb-6">
                        Your email has been verified successfully. Your account is now pending admin approval.
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 space-y-3">
                        <div className="flex gap-3">
                            <Mail className="text-blue-600 shrink-0 mt-1" size={20} />
                            <div>
                                <p className="font-semibold text-blue-900 text-sm">Check Your Email</p>
                                <p className="text-xs text-blue-700">
                                    We've sent a confirmation email to <span className="font-medium">{email}</span>
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Clock className="text-blue-600 shrink-0 mt-1" size={20} />
                            <div>
                                <p className="font-semibold text-blue-900 text-sm">Admin Review in Progress</p>
                                <p className="text-xs text-blue-700">
                                    Our team will review your information and verify your credentials. This typically takes 24-48 hours.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-amber-900">
                            <span className="font-semibold">When approved:</span> You'll receive an email notification and can login to start taking jobs.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            closeModal();
                            switchModal("login");
                        }}
                        className="w-full rounded-lg bg-blue-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors flex items-center justify-center gap-2"
                    >
                        Go to Login <ArrowRight size={16} />
                    </button>

                    <button
                        onClick={closeModal}
                        className="w-full mt-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
