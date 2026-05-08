"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    User, Edit2, Lock, HelpCircle, FileText, LogOut, ChevronRight, Calendar,
} from "lucide-react";
import EditProfileSheet from "@/components/dashboard/EditProfileSheet";
import LogoutModal from "@/components/dashboard/LogoutModal";
import HelpCenterSheet from "@/components/dashboard/HelpCenterSheet";
import TermsOfServiceSheet from "@/components/dashboard/TermsOfServiceSheet";
import ScheduleEditorSheet from "@/components/dashboard/ScheduleEditorSheet";
import { getDoctorProfile, type DoctorProfile } from "@/lib/dashboard";

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isTosOpen, setIsTosOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const loadProfile = useCallback(() => {
        getDoctorProfile()
            .then(setProfile)
            .catch(() => { });
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile, refreshKey]);

    const displayName = profile?.full_name || "Doctor";
    const specialization = profile?.specialization || "—";
    const licenseNumber = profile?.license_number || null;
    const phone = profile?.phone_number || "—";
    const fee = profile?.consultation_fee
        ? `${profile.currency === 'INR' ? '₹' : '$'} ${profile.consultation_fee}`
        : "—";
    const hospital = profile?.hospital_affiliation || "—";

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-7xl mx-auto space-y-6 font-spline pb-12"
            >
                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                        Profile &amp; Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your personal information, practice details, and security preferences.
                    </p>
                </div>

                {/* ── Split Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ════ LEFT COLUMN (Col-Span-2) ════ */}
                    <div className="col-span-2 space-y-6">
                        {/* Card 1: Personal Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900">
                                Personal Information
                            </div>
                            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                {/* Identity */}
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Dr. {displayName}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {specialization}
                                            {licenseNumber && ` • Reg No: ${licenseNumber}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Edit Profile — opens EditProfileSheet */}
                                <button
                                    onClick={() => setIsEditOpen(true)}
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                                >
                                    <Edit2 size={14} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Card 2: Practice Details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900">
                                Practice Details
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Phone / WhatsApp</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {phone}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Consultation Fee</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {fee}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Hospital / Clinic</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {hospital}
                                    </div>
                                </div>
                                {licenseNumber && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-2">License Number</label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                            {licenseNumber}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 2b: Weekly Schedule */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">Weekly Schedule</span>
                                <button
                                    onClick={() => setIsScheduleOpen(true)}
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                >
                                    <Calendar size={12} />
                                    Edit Schedule
                                </button>
                            </div>
                            <div className="p-6">
                                {profile?.availability_slots && profile.availability_slots.filter(s => s.is_enabled).length > 0 ? (
                                    <div className="space-y-2">
                                        {profile.availability_slots
                                            .filter((s) => s.is_enabled)
                                            .map((slot) => (
                                                <div
                                                    key={slot.day_of_week}
                                                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
                                                >
                                                    <span className="text-sm font-medium text-gray-900">
                                                        {slot.day_of_week}
                                                    </span>
                                                    <span className="text-sm text-gray-500 font-mono">
                                                        {slot.start_time} — {slot.end_time}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        No availability set. Click &quot;Edit Schedule&quot; to configure.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ════ RIGHT COLUMN (Col-Span-1) ════ */}
                    <div className="col-span-1 space-y-6">
                        {/* Card 3: Privacy & Security */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900">
                                Privacy &amp; Security
                            </div>
                            <div className="p-5 bg-gray-50 text-xs text-gray-500 flex gap-3 leading-relaxed">
                                <Lock size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                All patient data is end-to-end encrypted and our platform is fully HIPAA compliant.
                            </div>
                        </div>

                        {/* Card 4: Support & Legal */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsHelpOpen(true)}
                                className="w-full px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <HelpCircle size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Help Center</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsTosOpen(true)}
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Terms of Service</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                            </button>
                        </div>

                        {/* Log Out — opens LogoutModal */}
                        <button
                            onClick={() => setIsLogoutOpen(true)}
                            className="w-full py-3.5 px-4 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Sheets & Modals ── */}
            <EditProfileSheet
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSaved={() => setRefreshKey((k) => k + 1)}
            />
            <ScheduleEditorSheet
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onSaved={() => setRefreshKey((k) => k + 1)}
            />
            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
            <HelpCenterSheet isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
            <TermsOfServiceSheet isOpen={isTosOpen} onClose={() => setIsTosOpen(false)} />
        </>
    );
}

