"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Stethoscope, Mail, Phone, MapPin, CheckCircle } from "lucide-react";

interface EditProfileSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileSheet({ isOpen, onClose }: EditProfileSheetProps) {
    const [formData, setFormData] = useState({
        fullName: "Dr. Rohan Mehta",
        specialization: "Cardiologist",
        email: "rohan.mehta@careconnect.in",
        phone: "+91 98765 43210",
        clinicAddress: "42 MG Road, Bengaluru, Karnataka 560001",
    });
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            setShowSuccess(true);
            setTimeout(() => {
                setShowSuccess(false);
                onClose();
            }, 1800);
        }, 800);
    };

    const fields = [
        { key: "fullName", label: "Full Name", icon: User, type: "text", placeholder: "Dr. First Last" },
        { key: "specialization", label: "Specialization", icon: Stethoscope, type: "text", placeholder: "e.g. Cardiologist" },
        { key: "email", label: "Email", icon: Mail, type: "email", placeholder: "you@example.com" },
        { key: "phone", label: "Phone", icon: Phone, type: "tel", placeholder: "+91 XXXXX XXXXX" },
        { key: "clinicAddress", label: "Clinic Address", icon: MapPin, type: "text", placeholder: "Street, City, State" },
    ] as const;

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
                                <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center shrink-0">
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
                                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all bg-white"
                                        />
                                    </div>
                                </div>
                            ))}
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
                                disabled={isSaving}
                                className="flex-1 py-2.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium transition-colors cursor-pointer disabled:opacity-70 shadow-sm"
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
