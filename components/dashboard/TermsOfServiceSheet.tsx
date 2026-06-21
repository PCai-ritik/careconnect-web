"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Shield, Scale, Database, Globe, AlertTriangle } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

/* ── Component ──────────────────────────────────────────────────────── */

export default function TermsOfServiceSheet({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const branding = useBranding();
    useLockBodyScroll(isOpen);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[rgba(var(--brand-primary-rgb),0.05)] to-transparent shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center">
                                    <FileText size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Terms of Service</h2>
                                    <p className="text-xs text-gray-500">Last updated: May 1, 2026</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">

                            {/* Introduction */}
                            <section>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Welcome to {branding.name}. By accessing or using our platform, you agree to be bound by these Terms of Service.
                                    {branding.name} is a telemedicine platform designed to facilitate secure video consultations, patient management,
                                    and clinical workflows for licensed healthcare providers.
                                </p>
                            </section>

                            {/* Section 1 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Scale size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">1. Acceptance of Terms</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                    <p>
                                        By creating an account and using {branding.name} (&quot;the Service&quot;), you acknowledge that you have read,
                                        understood, and agree to be bound by these Terms. If you do not agree, you must not use the Service.
                                    </p>
                                    <p>
                                        You represent that you are a licensed medical professional authorized to practice in your jurisdiction,
                                        and that all information you provide during registration is accurate and complete.
                                    </p>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Shield size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">2. Privacy & Data Protection</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                    <p>
                                        {branding.name} is committed to protecting patient data. All clinical information is encrypted at rest
                                        (AES-256) and in transit (TLS 1.3). Our infrastructure implements row-level security to ensure
                                        strict data isolation between healthcare providers.
                                    </p>
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                        <h4 className="text-xs font-semibold text-blue-800 mb-2 uppercase tracking-wider">Data We Collect</h4>
                                        <ul className="text-xs text-blue-700 space-y-1.5">
                                            <li className="flex items-start gap-2">
                                                <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                                Provider profile information (name, credentials, specialization)
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                                Patient demographic and clinical data (entered by providers)
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                                Appointment and consultation metadata (scheduling, duration)
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                                                Authentication logs and session activity
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Database size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">3. Data Handling & Retention</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                    <p>
                                        Patient medical records are retained in accordance with applicable healthcare regulations.
                                        You may request data export or deletion through the Help Center, subject to legal retention requirements.
                                    </p>
                                    <p>
                                        {branding.name} does not sell, share, or monetize patient data. Access to patient records is restricted
                                        to the treating physician and authorized caregivers linked through the platform.
                                    </p>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Globe size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">4. Telemedicine Compliance</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                    <p>
                                        You are responsible for ensuring that your use of telemedicine services through {branding.name}
                                        complies with the laws and regulations of your jurisdiction. {branding.name} provides the technology
                                        platform; the clinical responsibility remains with you as the licensed provider.
                                    </p>
                                    <p>
                                        Video consultations conducted through {branding.name} use enterprise-grade WebRTC technology (LiveKit)
                                        with end-to-end encryption. You are responsible for ensuring a private environment during consultations.
                                    </p>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <FileText size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">5. Acceptable Use</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                    <p>You agree to:</p>
                                    <ul className="space-y-2 ml-1">
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                                            Use the platform only for legitimate healthcare purposes
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                                            Maintain the confidentiality of your account credentials
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                                            Provide accurate patient information and clinical documentation
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                                            Not attempt to access data belonging to other providers
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 shrink-0" />
                                            Comply with all applicable medical regulations and standards of care
                                        </li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <AlertTriangle size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">6. Limitation of Liability</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                                    <p>
                                        {branding.name} provides a technology platform and is not a healthcare provider. We are not
                                        responsible for clinical decisions, diagnoses, or treatment plans made using our platform.
                                        The treating physician bears full clinical responsibility.
                                    </p>
                                    <p>
                                        To the maximum extent permitted by law, {branding.name} shall not be liable for any indirect,
                                        incidental, or consequential damages arising from your use of the Service, including but not
                                        limited to service interruptions, data transmission delays, or third-party integrations.
                                    </p>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section>
                                <div className="flex items-center gap-2 mb-3">
                                    <Scale size={16} className="text-[var(--brand-primary)]" />
                                    <h3 className="text-sm font-semibold text-gray-900">7. Changes to Terms</h3>
                                </div>
                                <div className="text-sm text-gray-600 leading-relaxed">
                                    <p>
                                        {branding.name} reserves the right to modify these Terms at any time. We will provide notice of
                                        material changes through the platform. Your continued use of the Service after such modifications
                                        constitutes acceptance of the updated Terms.
                                    </p>
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 shrink-0">
                            <p className="text-xs text-gray-500 text-center">
                                Questions about these terms?{" "}
                                <a href="mailto:legal@example.com" className="text-[var(--brand-primary)] font-medium hover:underline">
                                    Contact Legal
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
