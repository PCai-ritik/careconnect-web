"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, AlertCircle, CheckCircle, Shield } from "lucide-react";

/* ── Constants (mirrors mobile) ─────────────────────────────────────── */

const GENDERS = ["Male", "Female", "Other"] as const;
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;

function formatAadhar(value: string): string {
    const digits = value.replace(/\D/g, "").slice(0, 12);
    const parts: string[] = [];
    for (let i = 0; i < digits.length; i += 4) parts.push(digits.slice(i, i + 4));
    return parts.join(" ");
}

/* ── Types ───────────────────────────────────────────────────────────── */

interface FormData {
    fullName: string;
    phone: string;
    dob: string;
    gender: string;
    aadhar: string;
    bloodGroup: string;
    address: string;
    emergencyName: string;
    emergencyPhone: string;
    allergies: string;
    conditions: string;
}

const emptyForm: FormData = {
    fullName: "", phone: "", dob: "", gender: "",
    aadhar: "", bloodGroup: "", address: "",
    emergencyName: "", emergencyPhone: "",
    allergies: "", conditions: "",
};

/* ── Shared styles ───────────────────────────────────────────────────── */

const inputCls =
    "bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#4F46E5] focus:ring-2 focus:ring-[#4F46E5]/20 rounded-xl px-4 py-3 text-sm transition-all w-full outline-none text-gray-900 placeholder-gray-400";
const textareaCls = inputCls + " resize-none";

/* ── Helper: Field Label ─────────────────────────────────────────────── */

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {children}
            {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}

/* ── Main Component ──────────────────────────────────────────────────── */

export default function AddPatientSheet({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const isFormValid =
        formData.fullName.trim() !== "" &&
        formData.phone.trim() !== "" &&
        formData.dob.trim() !== "";

    const set = (key: keyof FormData, value: string) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const toggleChip = (key: "gender" | "bloodGroup", value: string) =>
        set(key, formData[key] === value ? "" : value);

    const handleSubmit = () => {
        if (!isFormValid) return;
        setShowSuccessModal(true);
    };

    const handleDone = () => {
        setFormData(emptyForm);
        setShowSuccessModal(false);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="ap-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* ── Panel ── */}
                    <motion.div
                        key="ap-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* ── Panel Header ── */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-[#4F46E5] flex items-center justify-center">
                                    <UserPlus size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">Register New Patient</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">Enter the patient&apos;s details to create their profile.</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Scrollable Form Body ── */}
                        {/* Conditionally remove overflow-y-auto to lock scrolling when modal is open */}
                        <div className={`flex-1 p-6 space-y-8 relative ${showSuccessModal ? 'overflow-hidden pointer-events-none' : 'overflow-y-auto'}`}>

                            {/* ── Section 1: Personal Information ── */}
                            <section className={showSuccessModal ? 'opacity-50 blur-sm transition-all' : 'transition-all'}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <UserPlus size={16} className="text-[#4F46E5]" />
                                    Personal Information
                                </h3>
                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div>
                                        <Label required>Full Name</Label>
                                        <input className={inputCls} placeholder="Enter full name"
                                            value={formData.fullName}
                                            onChange={(e) => set("fullName", e.target.value)} />
                                    </div>

                                    {/* Phone + DOB */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label required>Phone Number</Label>
                                            <input className={inputCls} placeholder="+91 98765 43210"
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => set("phone", e.target.value)} />
                                        </div>
                                        <div>
                                            <Label required>Date of Birth</Label>
                                            <input
                                                className={inputCls}
                                                type="date"
                                                value={formData.dob}
                                                onChange={(e) => set("dob", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Gender chips */}
                                    <div>
                                        <Label>Gender</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {GENDERS.map((g) => (
                                                <button
                                                    key={g}
                                                    type="button"
                                                    onClick={() => toggleChip("gender", g)}
                                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all cursor-pointer ${formData.gender === g
                                                        ? "bg-[#4F46E5]/10 border-[#4F46E5] text-[#4F46E5]"
                                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                                                        }`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Aadhar */}
                                    <div>
                                        <Label>Aadhar Card Number</Label>
                                        <input className={inputCls} placeholder="XXXX XXXX XXXX"
                                            maxLength={14}
                                            value={formData.aadhar}
                                            onChange={(e) => set("aadhar", formatAadhar(e.target.value))} />
                                    </div>

                                    {/* Blood Group chips */}
                                    <div>
                                        <Label>Blood Group</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {BLOOD_GROUPS.map((bg) => (
                                                <button
                                                    key={bg}
                                                    type="button"
                                                    onClick={() => toggleChip("bloodGroup", bg)}
                                                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all cursor-pointer ${formData.bloodGroup === bg
                                                        ? "bg-[#4F46E5]/10 border-[#4F46E5] text-[#4F46E5]"
                                                        : "bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300"
                                                        }`}
                                                >
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <Label>Full Address</Label>
                                        <textarea className={textareaCls} rows={2} placeholder="Enter full address"
                                            value={formData.address}
                                            onChange={(e) => set("address", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            {/* ── Section 2: Emergency Contact ── */}
                            <section className={showSuccessModal ? 'opacity-50 blur-sm transition-all' : 'transition-all'}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-6 flex items-center gap-2">
                                    <Shield size={16} className="text-gray-400" />
                                    Emergency Contact
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Contact Name</Label>
                                        <input className={inputCls} placeholder="Emergency contact name"
                                            value={formData.emergencyName}
                                            onChange={(e) => set("emergencyName", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Contact Phone</Label>
                                        <input className={inputCls} placeholder="+91 98765 43210"
                                            type="tel"
                                            value={formData.emergencyPhone}
                                            onChange={(e) => set("emergencyPhone", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            {/* ── Section 3: Medical History ── */}
                            <section className={showSuccessModal ? 'opacity-50 blur-sm transition-all' : 'transition-all'}>
                                <h3 className="text-sm font-semibold text-gray-900 mb-4 mt-6 flex items-center gap-2">
                                    <AlertCircle size={16} className="text-red-400" />
                                    Medical History
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label>Known Allergies</Label>
                                        <textarea className={textareaCls} rows={2}
                                            placeholder="List any known allergies (medications, food, etc.)"
                                            value={formData.allergies}
                                            onChange={(e) => set("allergies", e.target.value)} />
                                    </div>
                                    <div>
                                        <Label>Existing Medical Conditions</Label>
                                        <textarea className={textareaCls} rows={2}
                                            placeholder="List any existing medical conditions"
                                            value={formData.conditions}
                                            onChange={(e) => set("conditions", e.target.value)} />
                                    </div>
                                </div>
                            </section>

                            {/* ── Success Overlay ── */}
                            <AnimatePresence>
                                {showSuccessModal && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 bg-white/40 backdrop-blur-md flex items-center justify-center p-6 pointer-events-auto"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.95, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            className="bg-white border border-gray-200 shadow-2xl rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center"
                                        >
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Patient Registered</h3>
                                            <p className="text-sm text-gray-500 mt-2 mb-6">
                                                <span className="font-medium text-gray-800">{formData.fullName}</span> has been
                                                successfully added to your directory.
                                            </p>
                                            <button
                                                onClick={handleDone}
                                                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-xl font-medium transition-all cursor-pointer shadow-md"
                                            >
                                                Done
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Panel Footer ── */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid}
                                className={`px-6 py-2.5 rounded-xl text-sm font-medium text-white shadow-sm transition-all flex items-center gap-2 ${isFormValid
                                    ? "bg-[#4F46E5] hover:bg-[#4338CA] cursor-pointer"
                                    : "bg-[#4F46E5]/50 cursor-not-allowed"
                                    }`}
                            >
                                <UserPlus size={15} />
                                Register Patient
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}