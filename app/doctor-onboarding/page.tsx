"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Activity, ChevronDown, Upload, CheckCircle,
    Shield, Calendar, CreditCard, Check, ArrowLeft, ArrowRight,
    Clock, Globe, Award, Smartphone, Square, CheckSquare,
    User, FileText, Loader2,
} from "lucide-react";

/* ─────────────────────── Constants ─────────────────────── */

const SPECIALIZATIONS = [
    "General Practice", "Internal Medicine", "Cardiology", "Dermatology",
    "Endocrinology", "Gastroenterology", "Neurology", "Obstetrics & Gynecology",
    "Oncology", "Ophthalmology", "Orthopedics", "Pediatrics", "Psychiatry",
    "Pulmonology", "Radiology", "Rheumatology", "Surgery", "Urology",
    "Anesthesiology", "Emergency Medicine", "Family Medicine", "Nephrology",
    "Pathology", "ENT (Otolaryngology)", "Ayurveda", "Homeopathy",
];

const EXPERIENCE_OPTIONS = ["0-2 years", "3-5 years", "6-10 years", "11-20 years", "20+ years"];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const TIME_OPTIONS = [
    "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
    "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
    "18:00", "19:00", "20:00", "21:00", "22:00",
];

const DURATION_OPTIONS = ["15 min", "30 min", "45 min", "60 min"];

const TIMEZONE_OPTIONS = [
    "Asia/Kolkata (IST, UTC+5:30)",
    "Asia/Dubai (GST, UTC+4)",
    "Asia/Singapore (SGT, UTC+8)",
    "Europe/London (GMT/BST)",
    "America/New_York (EST, UTC-5)",
    "America/Los_Angeles (PST, UTC-8)",
];

const CURRENCY_OPTIONS = [
    { code: "INR", label: "₹ INR – Indian Rupee" },
    { code: "USD", label: "$ USD – US Dollar" },
    { code: "EUR", label: "€ EUR – Euro" },
    { code: "GBP", label: "£ GBP – British Pound" },
];

const PAYMENT_METHODS = [
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "card", label: "Credit / Debit", icon: CreditCard },
    { id: "netbanking", label: "Net Banking", icon: Globe },
];

const STEPS = [
    { title: "Personal Profile", icon: User, description: "Professional verification & identity" },
    { title: "Credentials", icon: FileText, description: "Availability & schedule setup" },
    { title: "Practice Details", icon: CreditCard, description: "Payments, billing & consent" },
];

const STEP_CONTEXT = [
    "Your personal details are kept strictly secure and encrypted. We only use this information to verify your medical credentials.",
    "We verify credentials to maintain our platform's standard of care. Your schedule will be visible to patients booking consultations.",
    "This information will be visible to your future patients. Payment details are secured with bank-level encryption.",
];

/* ─────────────────────── Types ─────────────────────── */

interface DaySchedule {
    enabled: boolean;
    startTime: string;
    endTime: string;
}

interface FormData {
    specialization: string;
    experience: string;
    licenseNumber: string;
    licenseState: string;
    hospitalAffiliation: string;
    bio: string;
    documentUploaded: boolean;
    consultationDuration: string;
    timezone: string;
    schedule: Record<string, DaySchedule>;
    consultationFee: string;
    currency: string;
    bankName: string;
    accountNumber: string;
    routingNumber: string;
    acceptedPaymentMethods: string[];
    termsAccepted: boolean;
    hipaaAccepted: boolean;
    privacyAccepted: boolean;
}

const defaultSchedule: Record<string, DaySchedule> = DAYS.reduce((acc, day) => ({
    ...acc,
    [day]: {
        enabled: day !== "Saturday" && day !== "Sunday",
        startTime: "09:00",
        endTime: "17:00",
    },
}), {} as Record<string, DaySchedule>);

/* ─────────────────────── Input Style ─────────────────────── */

const inputClass =
    "w-full bg-white border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 text-[15px] shadow-sm transition-all focus:border-[#4F46E5] focus:ring-4 focus:ring-[#4F46E5]/10 hover:border-gray-300 outline-none";

/* ─────────────────────── Dropdown Component ─────────────────────── */

function Dropdown({ label, value, options, open, onToggle, onSelect, icon: Icon }: {
    label: string;
    value: string;
    options: string[];
    open: boolean;
    onToggle: () => void;
    onSelect: (v: string) => void;
    icon?: React.ComponentType<{ size: number; className?: string }>;
}) {
    return (
        <div className="relative">
            <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">{label}</label>
            <button
                type="button"
                onClick={onToggle}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 flex items-center gap-2.5 text-[15px] text-gray-900 cursor-pointer shadow-sm transition-all hover:border-gray-300"
            >
                {Icon && <Icon size={16} className="text-[#4F46E5]" />}
                <span className="flex-1 text-left truncate">{value || `Select ${label.toLowerCase().replace(' *', '')}`}</span>
                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
                    {options.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => onSelect(opt)}
                            className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${value === opt ? "bg-[#4F46E5]/10 text-[#4F46E5] font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────── Main Component ─────────────────────── */

export default function DoctorOnboardingPage() {
    const [step, setStep] = useState(1);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState<FormData>({
        specialization: "",
        experience: "",
        licenseNumber: "",
        licenseState: "",
        hospitalAffiliation: "",
        bio: "",
        documentUploaded: false,
        consultationDuration: "30 min",
        timezone: "Asia/Kolkata (IST, UTC+5:30)",
        schedule: { ...defaultSchedule },
        consultationFee: "",
        currency: "INR",
        bankName: "",
        accountNumber: "",
        routingNumber: "",
        acceptedPaymentMethods: ["upi"],
        termsAccepted: false,
        hipaaAccepted: false,
        privacyAccepted: false,
    });

    const [specSearch, setSpecSearch] = useState("");
    const [showSpecDropdown, setShowSpecDropdown] = useState(false);
    const [showExpDropdown, setShowExpDropdown] = useState(false);
    const [showDurationDropdown, setShowDurationDropdown] = useState(false);
    const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
    const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);

    /* ── Helpers ── */

    const update = <K extends keyof FormData>(key: K, value: FormData[K]) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    // Mock AI document analysis — auto-fills license fields after upload
    const handleDocumentPick = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadedFileName(file.name);
        setIsAnalyzing(true);
        update("documentUploaded", true);

        // Simulate AI analysis with a 2.5s delay
        setTimeout(() => {
            setFormData((prev) => ({
                ...prev,
                licenseNumber: "MD-8472910",
                licenseState: "California, USA",
                hospitalAffiliation: "Cedars-Sinai Medical Center",
            }));
            setIsAnalyzing(false);
        }, 2500);

        // Reset input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const filteredSpecs = SPECIALIZATIONS.filter((s) =>
        s.toLowerCase().includes(specSearch.toLowerCase())
    );

    const toggleDay = (day: string) => {
        setFormData((prev) => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                [day]: { ...prev.schedule[day], enabled: !prev.schedule[day].enabled },
            },
        }));
    };

    const cycleTime = (day: string, field: "startTime" | "endTime") => {
        setFormData((prev) => {
            const current = prev.schedule[day][field];
            const idx = TIME_OPTIONS.indexOf(current);
            const next = TIME_OPTIONS[(idx + 1) % TIME_OPTIONS.length];
            return {
                ...prev,
                schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], [field]: next } },
            };
        });
    };

    const togglePaymentMethod = (id: string) => {
        setFormData((prev) => ({
            ...prev,
            acceptedPaymentMethods: prev.acceptedPaymentMethods.includes(id)
                ? prev.acceptedPaymentMethods.filter((m) => m !== id)
                : [...prev.acceptedPaymentMethods, id],
        }));
    };

    const allConsentsAccepted = formData.termsAccepted && formData.hipaaAccepted && formData.privacyAccepted;

    const handleComplete = async () => {
        if (!allConsentsAccepted) return;
        setIsSubmitting(true);

        const payload = {
            verification: {
                specialization: formData.specialization,
                experience: formData.experience,
                licenseNumber: formData.licenseNumber,
                licenseState: formData.licenseState,
                hospitalAffiliation: formData.hospitalAffiliation,
                bio: formData.bio,
                documentUploaded: formData.documentUploaded,
            },
            availability: {
                schedule: formData.schedule,
                consultationDuration: formData.consultationDuration,
                timezone: formData.timezone,
            },
            payments: {
                consultationFee: formData.consultationFee,
                currency: formData.currency,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                routingNumber: formData.routingNumber,
                acceptedPaymentMethods: formData.acceptedPaymentMethods,
                termsAccepted: formData.termsAccepted,
                hipaaAccepted: formData.hipaaAccepted,
                privacyAccepted: formData.privacyAccepted,
            },
        };

        console.log("[Doctor Onboarding] Complete payload:", JSON.stringify(payload, null, 2));
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        setShowCompleteModal(true);
    };

    /* ── Render ── */

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-spline">

            {/* ── Completion Modal ── */}
            <AnimatePresence>
                {showCompleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white rounded-2xl p-8 max-w-sm w-full mx-4 text-center shadow-2xl"
                        >
                            <div className="w-16 h-16 rounded-full bg-[#4F46E5] flex items-center justify-center mx-auto mb-4">
                                <Check size={32} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome aboard!</h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Your doctor profile has been set up successfully. You can now sign in to start consulting.
                            </p>
                            <button
                                onClick={() => {
                                    setShowCompleteModal(false);
                                    window.location.href = "/dashboard";
                                }}
                                className="w-full bg-[#4F46E5] text-white rounded-xl px-4 py-3 text-sm font-medium cursor-pointer flex items-center justify-center gap-2 hover:bg-[#4338CA] transition-colors"
                            >
                                Go to Dashboard <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Split-Pane Card ── */}
            <div className="w-full max-w-5xl bg-white rounded-[24px] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden">

                {/* ════════════ LEFT PANE — Vertical Stepper ════════════ */}
                <div className="w-full md:w-[35%] bg-gray-50 border-r border-gray-100 p-10 flex flex-col">

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-10 h-10 rounded-xl bg-[#4F46E5] flex items-center justify-center">
                            <Activity size={22} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[15px] font-bold text-gray-900 leading-tight">CareConnect</p>
                            <p className="text-[11px] text-[#4F46E5] font-medium">Provider Onboarding</p>
                        </div>
                    </div>

                    {/* Vertical Stepper */}
                    <div className="flex-1">
                        <div className="relative flex flex-col gap-0">
                            {STEPS.map((s, i) => {
                                const stepNum = i + 1;
                                const isActive = step === stepNum;
                                const isCompleted = step > stepNum;
                                const Icon = s.icon;

                                return (
                                    <div key={s.title} className="relative flex gap-5">
                                        {/* Vertical line — starts below circle, ends above next */}
                                        {i < STEPS.length - 1 && (
                                            <div
                                                className={`absolute left-[17px] top-[48px] w-[2px] h-[calc(100%-56px)] rounded-full ${isCompleted ? "bg-[#4F46E5]" : "bg-gray-200"}`}
                                            />
                                        )}

                                        {/* Circle */}
                                        <div className="relative z-10 shrink-0">
                                            <div
                                                className={`w-[36px] h-[36px] rounded-full flex items-center justify-center transition-all ${isCompleted
                                                    ? "bg-[#4F46E5] text-white shadow-sm shadow-[#4F46E5]/25"
                                                    : isActive
                                                        ? "bg-[#4F46E5]/10 border-2 border-[#4F46E5] text-[#4F46E5]"
                                                        : "bg-white border-2 border-gray-200 text-gray-400"
                                                    }`}
                                            >
                                                {isCompleted ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <Icon size={16} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Label */}
                                        <div className="pb-14 pt-1">
                                            <p className={`text-[14px] font-semibold leading-tight ${isActive
                                                ? "text-gray-900"
                                                : isCompleted
                                                    ? "text-[#4F46E5]"
                                                    : "text-gray-400"
                                                }`}>
                                                {s.title}
                                            </p>
                                            <p className={`text-[12px] mt-1 ${isActive ? "text-gray-500" : "text-gray-400"}`}>
                                                {s.description}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Context Text */}
                    <div className="mt-auto pt-6 border-t border-gray-200/60">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.25 }}
                            >
                                <div className="flex items-start gap-2.5">
                                    <Shield size={14} className="text-[#4F46E5] mt-0.5 shrink-0" />
                                    <p className="text-[12px] text-gray-500 leading-relaxed">
                                        {STEP_CONTEXT[step - 1]}
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>

                {/* ════════════ RIGHT PANE — Form Area ════════════ */}
                <div className="w-full md:w-[65%] p-10 lg:p-16 flex flex-col relative">

                    {/* Step progress badge */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {step === 1 && "Professional Verification"}
                                {step === 2 && "Set Your Availability"}
                                {step === 3 && "Payments & Consent"}
                            </h1>
                            <p className="text-sm text-gray-400 mt-1">
                                {step === 1 && "Verify your medical credentials and identity"}
                                {step === 2 && "Configure your consultation schedule"}
                                {step === 3 && "Set your fees and accept agreements"}
                            </p>
                        </div>
                        <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                            {step} of 3
                        </span>
                    </div>

                    {/* Form Content */}
                    <div className="flex-1 overflow-y-auto">
                        <AnimatePresence mode="wait">

                            {/* ═══════════════ STEP 1: Personal Profile ═══════════════ */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-6"
                                >
                                    {/* Document Upload — triggers native file picker */}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleDocumentPick}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isAnalyzing}
                                        className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 transition-all ${isAnalyzing
                                            ? "border-[#4F46E5]/30 bg-[#4F46E5]/[0.03] cursor-wait"
                                            : formData.documentUploaded
                                                ? "border-green-300 bg-green-50/50 cursor-pointer"
                                                : "border-gray-200 bg-gray-50/50 hover:border-[#4F46E5]/30 hover:bg-[#4F46E5]/[0.02] cursor-pointer"
                                            }`}
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 size={24} className="text-[#4F46E5] animate-spin" />
                                                <span className="text-sm font-medium text-[#4F46E5]">Analyzing document...</span>
                                                <span className="text-[11px] text-gray-400">{uploadedFileName}</span>
                                            </>
                                        ) : formData.documentUploaded ? (
                                            <>
                                                <CheckCircle size={24} className="text-green-500" />
                                                <span className="text-sm font-medium text-green-700">Document uploaded</span>
                                                <span className="text-[11px] text-gray-400">{uploadedFileName} · Click to replace</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600">Upload medical license</span>
                                                <span className="text-[11px] text-gray-400">PDF, JPG, or PNG</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Specialization + Experience — side by side */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Specialization (searchable) */}
                                        <div className="relative">
                                            <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                                Specialization <span className="text-red-400">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Cardiology"
                                                    value={showSpecDropdown ? specSearch : formData.specialization}
                                                    onChange={(e) => {
                                                        setSpecSearch(e.target.value);
                                                        setShowSpecDropdown(true);
                                                        update("specialization", e.target.value);
                                                    }}
                                                    onFocus={() => {
                                                        setShowSpecDropdown(true);
                                                        setSpecSearch(formData.specialization);
                                                    }}
                                                    className={`${inputClass} pr-10`}
                                                />
                                                <button type="button" onClick={() => setShowSpecDropdown(!showSpecDropdown)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer">
                                                    <ChevronDown size={14} className={`transition-transform duration-200 ${showSpecDropdown ? "rotate-180" : ""}`} />
                                                </button>
                                            </div>
                                            {showSpecDropdown && filteredSpecs.length > 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-44 overflow-y-auto">
                                                    {filteredSpecs.map((spec) => (
                                                        <button key={spec} type="button"
                                                            onClick={() => { update("specialization", spec); setSpecSearch(""); setShowSpecDropdown(false); }}
                                                            className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${formData.specialization === spec ? "bg-[#4F46E5]/10 text-[#4F46E5] font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                                                            {spec}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Experience */}
                                        <Dropdown label="Experience *" value={formData.experience} options={EXPERIENCE_OPTIONS}
                                            open={showExpDropdown} onToggle={() => setShowExpDropdown(!showExpDropdown)}
                                            onSelect={(v) => { update("experience", v); setShowExpDropdown(false); }} icon={Award} />
                                    </div>

                                    {/* License Number + License State — side by side */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                                License Number <span className="text-red-400">*</span>
                                            </label>
                                            <input type="text" placeholder="e.g. MD-1234567" value={formData.licenseNumber}
                                                onChange={(e) => update("licenseNumber", e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                                Licensing State / Country <span className="text-red-400">*</span>
                                            </label>
                                            <input type="text" placeholder="e.g. Uttarakhand, India" value={formData.licenseState}
                                                onChange={(e) => update("licenseState", e.target.value)} className={inputClass} />
                                        </div>
                                    </div>

                                    {/* Hospital Affiliation */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                            Hospital / Clinic Affiliation
                                        </label>
                                        <input type="text" placeholder="e.g. Doon Medical College" value={formData.hospitalAffiliation}
                                            onChange={(e) => update("hospitalAffiliation", e.target.value)} className={inputClass} />
                                    </div>

                                    {/* Bio */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                            Professional Bio
                                        </label>
                                        <textarea
                                            placeholder="Board-certified with 10+ years of..."
                                            value={formData.bio}
                                            onChange={(e) => update("bio", e.target.value)}
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════════════ STEP 2: Credentials / Availability ═══════════════ */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-6"
                                >
                                    {/* Duration + Timezone — side by side */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Dropdown label="Consultation Duration" value={formData.consultationDuration} options={DURATION_OPTIONS}
                                            open={showDurationDropdown} onToggle={() => setShowDurationDropdown(!showDurationDropdown)}
                                            onSelect={(v) => { update("consultationDuration", v); setShowDurationDropdown(false); }} icon={Clock} />

                                        <Dropdown label="Timezone *" value={formData.timezone} options={TIMEZONE_OPTIONS}
                                            open={showTimezoneDropdown} onToggle={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                                            onSelect={(v) => { update("timezone", v); setShowTimezoneDropdown(false); }} icon={Globe} />
                                    </div>

                                    {/* Weekly Schedule */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-3 uppercase">
                                            Weekly Schedule
                                        </label>
                                        <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 space-y-1">
                                            {DAYS.map((day) => {
                                                const sched = formData.schedule[day];
                                                return (
                                                    <div key={day} className="flex items-center gap-3 py-1.5">
                                                        <button type="button" onClick={() => toggleDay(day)}
                                                            className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${sched.enabled ? "bg-[#4F46E5]" : "bg-gray-200"}`}>
                                                            {sched.enabled && <Check size={12} className="text-white" />}
                                                        </button>
                                                        <span className={`text-sm w-24 font-medium ${sched.enabled ? "text-gray-900" : "text-gray-400"}`}>{day}</span>
                                                        {sched.enabled && (
                                                            <div className="flex items-center gap-1.5 ml-auto">
                                                                <button type="button" onClick={() => cycleTime(day, "startTime")}
                                                                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200 shadow-sm">
                                                                    {sched.startTime}
                                                                </button>
                                                                <span className="text-xs text-gray-400">to</span>
                                                                <button type="button" onClick={() => cycleTime(day, "endTime")}
                                                                    className="px-3 py-1.5 bg-white rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200 shadow-sm">
                                                                    {sched.endTime}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ═══════════════ STEP 3: Practice Details / Payments ═══════════════ */}
                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -15 }}
                                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                    className="space-y-6"
                                >
                                    {/* Consultation Fee + Currency */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                            Base Consultation Fee <span className="text-red-400">*</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="relative">
                                                <button type="button" onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                                                    className="h-[50px] px-4 bg-gray-50 rounded-xl flex items-center gap-1.5 text-sm font-semibold text-[#4F46E5] cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200 shadow-sm">
                                                    {CURRENCY_OPTIONS.find((c) => c.code === formData.currency)?.label.charAt(0)} {formData.currency}
                                                    <ChevronDown size={12} className={`transition-transform duration-200 ${showCurrencyDropdown ? "rotate-180" : ""}`} />
                                                </button>
                                                {showCurrencyDropdown && (
                                                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 min-w-[200px]">
                                                        {CURRENCY_OPTIONS.map((opt) => (
                                                            <button key={opt.code} type="button"
                                                                onClick={() => { update("currency", opt.code); setShowCurrencyDropdown(false); }}
                                                                className={`w-full text-left px-4 py-2.5 text-sm cursor-pointer transition-colors ${formData.currency === opt.code ? "bg-[#4F46E5]/10 text-[#4F46E5] font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                                                                {opt.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <input type="number" placeholder="e.g. 800" value={formData.consultationFee}
                                                onChange={(e) => update("consultationFee", e.target.value)}
                                                className={`flex-1 ${inputClass}`} />
                                        </div>
                                    </div>

                                    {/* Bank Name + Account Number — side by side */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                                Bank Name <span className="text-red-400">*</span>
                                            </label>
                                            <input type="text" placeholder="e.g. State Bank of India" value={formData.bankName}
                                                onChange={(e) => update("bankName", e.target.value)} className={inputClass} />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                                Routing Number <span className="text-red-400">*</span>
                                            </label>
                                            <input type="text" placeholder="e.g. SBIN0001234" value={formData.routingNumber}
                                                onChange={(e) => update("routingNumber", e.target.value)} className={inputClass} />
                                        </div>
                                    </div>

                                    {/* Account Number — full width */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-2 uppercase">
                                            Account Number <span className="text-red-400">*</span>
                                        </label>
                                        <input type="password" placeholder="Enter account number" value={formData.accountNumber}
                                            onChange={(e) => update("accountNumber", e.target.value)} className={inputClass} />
                                    </div>

                                    {/* Accepted Payment Methods */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-3 uppercase">
                                            Accepted Payment Methods <span className="text-red-400">*</span>
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {PAYMENT_METHODS.map((method) => {
                                                const active = formData.acceptedPaymentMethods.includes(method.id);
                                                const Icon = method.icon;
                                                return (
                                                    <button key={method.id} type="button" onClick={() => togglePaymentMethod(method.id)}
                                                        className={`relative overflow-hidden flex flex-col items-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${active
                                                            ? "border-[#4F46E5] bg-[#4F46E5]/5 shadow-sm"
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                            }`}>
                                                        <Icon size={20} className={active ? "text-[#4F46E5]" : "text-gray-400"} />
                                                        <span className={`text-[12px] font-medium ${active ? "text-[#4F46E5]" : "text-gray-500"}`}>{method.label}</span>
                                                        {active && (
                                                            <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#4F46E5] flex items-center justify-center">
                                                                <Check size={9} className="text-white" />
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Consent Checkboxes */}
                                    <div>
                                        <label className="block text-[11px] font-semibold tracking-[1.5px] text-gray-400 mb-3 uppercase">
                                            Agreements & Consent <span className="text-red-400">*</span>
                                        </label>
                                        <div className="space-y-3 bg-gray-50/80 rounded-xl border border-gray-100 p-4">
                                            <button type="button" onClick={() => update("termsAccepted", !formData.termsAccepted)}
                                                className="flex items-start gap-3 w-full text-left cursor-pointer group">
                                                {formData.termsAccepted
                                                    ? <CheckSquare size={18} className="text-[#4F46E5] flex-shrink-0 mt-0.5" />
                                                    : <Square size={18} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />}
                                                <span className="text-[13px] text-gray-600 leading-relaxed">I agree to the Terms of Service and Provider Agreement</span>
                                            </button>
                                            <button type="button" onClick={() => update("hipaaAccepted", !formData.hipaaAccepted)}
                                                className="flex items-start gap-3 w-full text-left cursor-pointer group">
                                                {formData.hipaaAccepted
                                                    ? <CheckSquare size={18} className="text-[#4F46E5] flex-shrink-0 mt-0.5" />
                                                    : <Square size={18} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />}
                                                <span className="text-[13px] text-gray-600 leading-relaxed">I agree to comply with HIPAA regulations and maintain patient confidentiality</span>
                                            </button>
                                            <button type="button" onClick={() => update("privacyAccepted", !formData.privacyAccepted)}
                                                className="flex items-start gap-3 w-full text-left cursor-pointer group">
                                                {formData.privacyAccepted
                                                    ? <CheckSquare size={18} className="text-[#4F46E5] flex-shrink-0 mt-0.5" />
                                                    : <Square size={18} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />}
                                                <span className="text-[13px] text-gray-600 leading-relaxed">I have read and accept the Privacy Policy</span>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* ── Footer Actions ── */}
                    <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-50">
                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={() => window.location.href = "/login"}
                                className="flex items-center gap-1.5 text-gray-500 font-medium hover:text-gray-900 px-4 py-2 transition-colors cursor-pointer text-sm"
                            >
                                <ArrowLeft size={16} /> Back to login
                            </button>
                        ) : step > 1 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step - 1)}
                                className="flex items-center gap-1.5 text-gray-500 font-medium hover:text-gray-900 px-4 py-2 transition-colors cursor-pointer text-sm"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={() => setStep(step + 1)}
                                className="bg-[#4F46E5] text-white px-8 py-3 rounded-xl font-medium shadow-sm hover:bg-[#4338CA] hover:shadow transition-all active:scale-[0.98] cursor-pointer text-sm flex items-center gap-2"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleComplete}
                                disabled={!allConsentsAccepted || isSubmitting}
                                className={`px-8 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${allConsentsAccepted && !isSubmitting
                                    ? "bg-[#4F46E5] text-white shadow-sm hover:bg-[#4338CA] hover:shadow active:scale-[0.98] cursor-pointer"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Completing...
                                    </>
                                ) : (
                                    <>Complete Setup <Check size={16} /></>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
