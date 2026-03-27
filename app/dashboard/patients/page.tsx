"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, User, ChevronRight, UserPlus } from "lucide-react";

/* ── Avatar Color Palette ────────────────────────────────────────────── */

const avatarColors = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
    "bg-amber-50 text-amber-600",
];

/* ── Mock Data (sourced from mobile app mock-data.ts) ────────────────── */

const patients = [
    { id: "pt-001", name: "Sarah Johnson", age: 34, gender: "Female", condition: "Hypertension", lastVisit: "2 days ago" },
    { id: "pt-002", name: "Michael Brown", age: 52, gender: "Male", condition: "Type 2 Diabetes", lastVisit: "5 days ago" },
    { id: "pt-003", name: "Emily Davis", age: 28, gender: "Female", condition: "Anxiety Disorder", lastVisit: "1 week ago" },
    { id: "pt-004", name: "James Wilson", age: 45, gender: "Male", condition: "Chronic Back Pain", lastVisit: "Mar 10, 2026" },
    { id: "pt-005", name: "Emma Smith", age: 31, gender: "Female", condition: "Migraine", lastVisit: "Mar 8, 2026" },
    { id: "pt-006", name: "David Lee", age: 60, gender: "Male", condition: "High Cholesterol", lastVisit: "Mar 5, 2026" },
    { id: "pt-007", name: "Olivia Martinez", age: 22, gender: "Female", condition: "Seasonal Allergies", lastVisit: "Feb 28, 2026" },
    { id: "pt-008", name: "Robert Taylor", age: 41, gender: "Male", condition: "Asthma", lastVisit: "Feb 20, 2026" },
    { id: "pt-009", name: "Sophia Anderson", age: 38, gender: "Female", condition: "Thyroid Disorder", lastVisit: "Feb 15, 2026" },
    { id: "pt-010", name: "Daniel Thomas", age: 55, gender: "Male", condition: "Arthritis", lastVisit: "Feb 10, 2026" },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function PatientsPage() {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPatients = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto font-spline pb-12">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, staggerChildren: 0.08 }}
                className="space-y-6"
            >
                {/* ── Page Header + Controls ── */}
                <motion.div transition={{ duration: 0.35 }}>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Patients
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage your patient directory and medical records.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                        <div className="relative w-full sm:w-72">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            />
                            <input
                                type="text"
                                placeholder="Search by name or condition..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all bg-white shadow-sm"
                            />
                        </div>

                        <button className="bg-[#4F46E5] hover:bg-[#4338CA] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer">
                            <UserPlus size={16} />
                            Add Patient
                        </button>
                    </div>
                </motion.div>

                {/* ── The Table Card ── */}
                <motion.div
                    transition={{ duration: 0.35 }}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]"
                >
                    {/* Table Header */}
                    <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div>Patient</div>
                        <div className="text-center">Demographics</div>
                        <div className="text-center">Condition</div>
                        <div className="text-center">Last Visit</div>
                        <div className="text-right">Profile</div>
                    </div>

                    {/* Data Rows */}
                    {filteredPatients.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Search size={40} className="mb-3 opacity-50" />
                            <p className="text-sm font-semibold">No patients found</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        filteredPatients.map((patient, index) => (
                            <div
                                key={patient.id}
                                className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                {/* Col 1 — Patient (Left) */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatarColors[index % avatarColors.length]
                                            }`}
                                    >
                                        <User size={18} />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {patient.name}
                                    </p>
                                </div>

                                {/* Col 2 — Demographics (Center) */}
                                <div className="text-sm text-gray-600 text-center">
                                    Age: {patient.age} • {patient.gender}
                                </div>

                                {/* Col 3 — Condition (Center) */}
                                <div className="flex justify-center">
                                    <span className="text-xs text-[#4F46E5] bg-[#4F46E5]/10 px-2.5 py-0.5 rounded-md font-medium">
                                        {patient.condition}
                                    </span>
                                </div>

                                {/* Col 4 — Last Visit (Center) */}
                                <div className="text-sm text-gray-500 text-center">
                                    {patient.lastVisit}
                                </div>

                                {/* Col 5 — Profile Chevron (Right) */}
                                <div className="flex justify-end text-gray-400 group-hover:text-[#4F46E5] transition-colors">
                                    <ChevronRight size={20} />
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
