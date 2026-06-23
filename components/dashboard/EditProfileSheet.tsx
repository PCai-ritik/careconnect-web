"use client";

import { useState, useEffect } from "react";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Stethoscope, Mail, Phone, MapPin, CheckCircle, FileText, CreditCard } from "lucide-react";
import { getDoctorProfile, updateDoctorProfile, type DoctorProfile } from "@/lib/dashboard";

interface EditProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

interface FormFields {
    fullName: string;
    specialization: string;
    email: string;
    phone: string;
    licenseNumber: string;
    bio: string;
    clinicName: string;
    clinicAddress: string;
    videoConsultationFee: string;
    inPersonConsultationFee: string;
}

const emptyForm: FormFields = {
    fullName: "",
    specialization: "",
    email: "",
    phone: "",
    licenseNumber: "",
    bio: "",
    clinicName: "",
    clinicAddress: "",
    videoConsultationFee: "",
    inPersonConsultationFee: "",
};

export default function EditProfileSheet({ isOpen, onClose, onSaved }: EditProfileSheetProps) {
    const [formData, setFormData] = useState<FormFields>(emptyForm);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useLockBodyScroll(isOpen);

    // Fetch current profile when sheet opens
    useEffect(() => {
        if (!isOpen) return;
        setShowSuccess(false);
        setIsLoading(true);
        getDoctorProfile()
            .then((p) => {
                setFormData({
                    fullName: p.full_name || "",
                    specialization: p.specialization || "",
                    email: "", // email lives on User, not Doctor — read-only
                    phone: p.phone_number || "",
                    licenseNumber: p.license_number || "",
                    bio: p.bio || "",
                    clinicName: p.clinic_name || "",
                    clinicAddress: p.clinic_address || "",
                    videoConsultationFee: p.video_consultation_fee ? String(p.video_consultation_fee) : "",
                    inPersonConsultationFee: p.in_person_consultation_fee ? String(p.in_person_consultation_fee) : "",
                });
            })
            .catch(() => { })
            .finally(() => setIsLoading(false));
    }, [isOpen]);

    const handleChange = (field: keyof FormFields, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateDoctorProfile({
                full_name: formData.fullName || undefined,
                specialization: formData.specialization || undefined,
                phone_number: formData.phone || undefined,
                license_number: formData.licenseNumber || undefined,
                bio: formData.bio || undefined,
                clinic_name: formData.clinicName || undefined,
                clinic_address: formData.clinicAddress || undefined,
                video_consultation_fee: formData.videoConsultationFee ? parseFloat(formData.videoConsultationFee) : undefined,
                in_person_consultation_fee: formData.inPersonConsultationFee ? parseFloat(formData.inPersonConsultationFee) : undefined,
            });
            setShowSuccess(true);
            onSaved?.();
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1800);
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const fields = [
        { key: "fullName" as const, label: "Full Name", icon: User, type: "text", placeholder: "Dr. First Last" },
        { key: "specialization" as const, label: "Specialization", icon: Stethoscope, type: "text", placeholder: "e.g. Cardiologist" },
        { key: "phone" as const, label: "Phone / WhatsApp", icon: Phone, type: "tel", placeholder: "+91 XXXXX XXXXX" },
        { key: "licenseNumber" as const, label: "License / Registration No.", icon: FileText, type: "text", placeholder: "e.g. NMC-78291" },
        { key: "clinicName" as const, label: "Clinic / Hospital Name", icon: Stethoscope, type: "text", placeholder: "e.g. Apollo Clinic" },
        { key: "clinicAddress" as const, label: "Clinic / Hospital Address", icon: MapPin, type: "text", placeholder: "e.g. 123 Main St, City" },
        { key: "videoConsultationFee" as const, label: "Video Consultation Fee (₹)", icon: CreditCard, type: "number", placeholder: "e.g. 800" },
        { key: "inPersonConsultationFee" as const, label: "In-Person Consultation Fee (₹)", icon: CreditCard, type: "number", placeholder: "e.g. 1000" },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="eps-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="eps-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* Success overlay */}
                        <AnimatePresence>
                            {showSuccess && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-white z-20 flex flex-col items-center justify-center gap-4 pointer-events-auto"
                                >
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", damping: 15 }}
                                    >
                                        <CheckCircle size={56} className="text-emerald-500" />
                                    </motion.div>
                                    <p className="text-lg font-semibold text-gray-900">Profile Updated!</p>
                                    <p className="text-sm text-gray-400">Your changes have been saved.</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center shrink-0">
                                    <User size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Edit Profile</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Update your personal & practice details</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className={`flex-1 overflow-y-auto p-6 space-y-5 ${showSuccess ? "pointer-events-none overflow-hidden" : ""}`}>
                            {isLoading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-[var(--brand-primary)] rounded-full" />
                                </div>
                            ) : (
                                <>
                                    {fields.map(({ key, label, icon: Icon, type, placeholder }) => (
                                        <div key={key}>
                                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                                {label}
                                            </label>
                                            <div className="relative">
                                                <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                <input
                                                    type={type}
                                                    value={formData[key]}
                                                    onChange={(e) => handleChange(key, e.target.value)}
                                                    placeholder={placeholder}
                                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all bg-white"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Bio textarea */}
                                    <div>
                                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                                            Bio / About
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={formData.bio}
                                            onChange={(e) => handleChange("bio", e.target.value)}
                                            placeholder="A short bio about your practice..."
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all bg-white resize-none"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 bg-white flex gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || isLoading}
                                className="flex-1 py-2.5 rounded-xl bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-70 shadow-sm"
                            >
                                {isSaving ? "Saving…" : "Save Changes"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
