"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ChevronDown, FileText, UserPlus } from "lucide-react";
import NewPrescriptionSheet from "./NewPrescriptionSheet";
import AddPatientSheet from "./AddPatientSheet";

export default function Header() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isPrescriptionSheetOpen, setIsPrescriptionSheetOpen] = useState(false);
    const [isPatientSheetOpen, setIsPatientSheetOpen] = useState(false);

    return (
        <>
            <header className="h-16 backdrop-blur-md bg-white/80 border-b border-gray-200/80 flex items-center justify-between px-8 fixed top-0 right-0 z-30 w-[calc(100%-16rem)] transition-all">
                {/* ── Left Side ── */}
                <p className="text-sm text-gray-500">Provider Workspace</p>

                {/* ── Right Side ── */}
                <div className="flex items-center gap-4">
                    {/* New Action Button + Dropdown */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => setIsDropdownOpen((o) => !o)}
                            className="bg-[#4F46E5] text-white hover:bg-[#4338CA] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all duration-200 cursor-pointer"
                        >
                            New
                            <ChevronDown
                                size={15}
                                className={`transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {isDropdownOpen && (
                                <>
                                    {/* Click-away overlay */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsDropdownOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                                    >
                                        {/* New Prescription */}
                                        <button
                                            onClick={() => {
                                                setIsPrescriptionSheetOpen(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <FileText size={15} className="text-gray-400" />
                                            New Prescription
                                        </button>

                                        {/* Add Patient */}
                                        <button
                                            onClick={() => {
                                                setIsPatientSheetOpen(true);
                                                setIsDropdownOpen(false);
                                            }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                        >
                                            <UserPlus size={15} className="text-gray-400" />
                                            Add Patient
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Notification Bell */}
                    <button
                        type="button"
                        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                        </span>
                    </button>
                </div>
            </header>

            {/* ── Slide-Overs ── */}
            <NewPrescriptionSheet
                isOpen={isPrescriptionSheetOpen}
                onClose={() => setIsPrescriptionSheetOpen(false)}
            />
            <AddPatientSheet
                isOpen={isPatientSheetOpen}
                onClose={() => setIsPatientSheetOpen(false)}
            />
        </>
    );
}
