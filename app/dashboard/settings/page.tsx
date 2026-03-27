"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User, Edit2, Lock, HelpCircle, FileText, LogOut, ChevronRight,
} from "lucide-react";
import EditProfileSheet from "@/components/dashboard/EditProfileSheet";
import LogoutModal from "@/components/dashboard/LogoutModal";

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
                                        <h2 className="text-xl font-bold text-gray-900">Dr. Rohan Mehta</h2>
                                        <p className="text-sm text-gray-500 mt-1">Cardiologist • Reg No: NMC-78291</p>
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
                                    <label className="text-xs font-medium text-gray-500 block mb-2">WhatsApp Number</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        +1 234 567 8900
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Consultation Fee</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        ₹ 500
                                    </div>
                                </div>
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
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <HelpCircle size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Help Center</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#4F46E5] transition-colors" />
                            </div>
                            <div className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Terms of Service</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#4F46E5] transition-colors" />
                            </div>
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
            <EditProfileSheet isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
        </>
    );
}
