"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, HelpCircle, ChevronDown, Search, Video, FileText, Users, CreditCard, Shield, Headphones } from "lucide-react";
import { useBranding } from "@/hooks/useBranding";

/* ── FAQ Data ──────────────────────────────────────────────────────── */

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQCategory {
    title: string;
    icon: React.ElementType;
    items: FAQItem[];
}

const getFaqCategories = (brandName: string): FAQCategory[] => [
    {
        title: "Appointments & Scheduling",
        icon: Video,
        items: [
            {
                question: "How do I schedule a new appointment?",
                answer: "Navigate to the Schedule page from the sidebar and click the time slot you'd like to book. You can also create appointments directly from a patient's profile by opening the Patient Profile sheet and selecting the appropriate time.",
            },
            {
                question: "Can I reschedule or cancel an appointment?",
                answer: "Yes. Open the appointment from your Schedule page and change its status. Rescheduled appointments can be reassigned to a new time slot. The patient and caregiver will be notified automatically via their connected app.",
            },
            {
                question: "What happens if a patient doesn't show up?",
                answer: "You can mark the appointment as 'No Show' from the schedule page. This updates the appointment status and preserves the record for billing and analytics purposes.",
            },
        ],
    },
    {
        title: "Video Consultations",
        icon: Video,
        items: [
            {
                question: "How do I start a video call?",
                answer: "Click 'Start Call' from either the dashboard hero banner or the Schedule page. This creates a secure video room and generates a shareable link for the patient. The patient can join via the WhatsApp link you share.",
            },
            {
                question: "What technology is used for video calls?",
                answer: `${brandName} uses LiveKit — an enterprise-grade, open-source WebRTC platform. All calls are encrypted end-to-end and routed through secure servers.`,
            },
            {
                question: "Can the patient join without downloading an app?",
                answer: "Yes! Patients receive a one-tap WhatsApp link that opens directly in their browser. No app download, login, or account creation is needed.",
            },
            {
                question: "What happens if the call disconnects?",
                answer: "Both participants can rejoin using the same link. The session remains active until the doctor explicitly ends the consultation. Call duration is automatically tracked.",
            },
        ],
    },
    {
        title: "Prescriptions & Records",
        icon: FileText,
        items: [
            {
                question: "How do I create a prescription?",
                answer: "Click the 'New' button in the header and select 'New Prescription'. You can add multiple medications, set dosage, frequency, and duration. Prescriptions are automatically linked to the patient's medical record.",
            },
            {
                question: "Can I view a patient's medical history?",
                answer: "Yes. Click on any patient from the Patients page or the Recent Patients list to open their profile sheet. This shows all past consultations, prescriptions, vitals, and medical records.",
            },
            {
                question: "Are prescriptions shareable with patients?",
                answer: `Prescriptions are stored securely in the patient's digital record and accessible to caregivers through the ${brandName} mobile app. PDF export functionality is planned for a future release.`,
            },
        ],
    },
    {
        title: "Patient Management",
        icon: Users,
        items: [
            {
                question: "How do I add a new patient?",
                answer: "Click the 'New' button in the header and select 'Add Patient'. Fill in the patient's details including name, contact information, and any existing medical conditions. The patient will be linked to your practice automatically.",
            },
            {
                question: "Can multiple doctors treat the same patient?",
                answer: "Each patient is linked to a specific doctor in the system. If a referral is needed, the patient can be registered by the receiving doctor or their caregiver can book an appointment with the new doctor.",
            },
            {
                question: "What patient information is stored?",
                answer: `${brandName} stores essential clinical data: demographics, contact info, medical history, allergies, existing conditions, emergency contacts, vitals, consultation records, and prescriptions. All data is encrypted at rest and in transit.`,
            },
        ],
    },
    {
        title: "Billing & Earnings",
        icon: CreditCard,
        items: [
            {
                question: "How are consultation fees tracked?",
                answer: `Your consultation fee is set during onboarding and can be updated from Settings. Each completed appointment generates a transaction record visible on your Earnings page.`,
            },
            {
                question: "When do I receive payouts?",
                answer: `Payouts are processed based on your arrangement with ${brandName}. You can view your earnings, pending amounts, and payout history from the Earnings page in the sidebar.`,
            },
        ],
    },
    {
        title: "Privacy & Security",
        icon: Shield,
        items: [
            {
                question: "Is patient data secure?",
                answer: `Yes. ${brandName} implements end-to-end encryption for all patient data, both at rest and in transit. Our platform follows HIPAA compliance guidelines and uses row-level security policies to ensure data isolation between practices.`,
            },
            {
                question: "Who can access my patients' data?",
                answer: "Only you and authorized caregivers linked to your patients can access their data. Each doctor's patient list is isolated — other doctors in the same hospital cannot see your patients.",
            },
            {
                question: "Can I export or delete patient data?",
                answer: "Data export and deletion requests can be submitted through the Help Center. We comply with applicable data protection regulations and process all requests within the legally mandated timeframe.",
            },
        ],
    },
    {
        title: "Technical Support",
        icon: Headphones,
        items: [
            {
                question: "The dashboard is not loading. What should I do?",
                answer: "Try refreshing the page (Ctrl+R / Cmd+R). If the issue persists, clear your browser cache and cookies, then log in again. Ensure you're using a modern browser (Chrome, Firefox, Safari, or Edge).",
            },
            {
                question: "I can't start a video call.",
                answer: "Ensure your browser has camera and microphone permissions enabled for this site. Check that no other application is using your camera. If the issue persists, try using a different browser.",
            },
            {
                question: "How do I contact support?",
                answer: "For urgent issues, reach out to our support team at support@careconnect.health. For feature requests and non-urgent queries, use the feedback form in the app settings.",
            },
        ],
    },
];

/* ── Component ──────────────────────────────────────────────────────── */

export default function HelpCenterSheet({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const branding = useBranding();
    const faqCategories = getFaqCategories(branding.name);

    const toggleItem = (key: string) => {
        setExpandedItems(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    // Filter FAQ items based on search
    const filteredCategories = searchQuery.trim()
        ? faqCategories.map(cat => ({
            ...cat,
            items: cat.items.filter(
                item =>
                    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.answer.toLowerCase().includes(searchQuery.toLowerCase())
            ),
        })).filter(cat => cat.items.length > 0)
        : faqCategories;

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
                                    <HelpCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Help Center</h2>
                                    <p className="text-xs text-gray-500">Frequently asked questions</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-6 py-4 border-b border-gray-100 shrink-0">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search questions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                />
                            </div>
                        </div>

                        {/* FAQ Content */}
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
                            {filteredCategories.length > 0 ? (
                                filteredCategories.map((category) => {
                                    const CategoryIcon = category.icon;
                                    return (
                                        <div key={category.title} className="space-y-2">
                                            {/* Category Header */}
                                            <div className="flex items-center gap-2 mb-3">
                                                <CategoryIcon size={16} className="text-[var(--brand-primary)]" />
                                                <h3 className="text-sm font-semibold text-gray-900">{category.title}</h3>
                                            </div>

                                            {/* FAQ Items */}
                                            <div className="space-y-1.5">
                                                {category.items.map((item, idx) => {
                                                    const key = `${category.title}-${idx}`;
                                                    const isExpanded = expandedItems.has(key);
                                                    return (
                                                        <div
                                                            key={key}
                                                            className="border border-gray-200 rounded-xl overflow-hidden"
                                                        >
                                                            <button
                                                                onClick={() => toggleItem(key)}
                                                                className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors cursor-pointer"
                                                            >
                                                                <span className="text-sm font-medium text-gray-800 pr-3">{item.question}</span>
                                                                <ChevronDown
                                                                    size={16}
                                                                    className={`text-gray-400 shrink-0 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                                                />
                                                            </button>
                                                            <AnimatePresence>
                                                                {isExpanded && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                    >
                                                                        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                                                                            {item.answer}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Search size={32} className="text-gray-300 mb-3" />
                                    <p className="text-sm text-gray-500">No results found for &quot;{searchQuery}&quot;</p>
                                    <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 shrink-0">
                            <p className="text-xs text-gray-500 text-center">
                                Can&apos;t find what you&apos;re looking for?{" "}
                                <a href="mailto:support@example.com" className="text-[var(--brand-primary)] font-medium hover:underline">
                                    Contact Support
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
