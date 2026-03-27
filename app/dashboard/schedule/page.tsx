"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Video, Check, Clock, User, FileText } from "lucide-react";

/* ── Avatar Color Palette ────────────────────────────────────────────── */

const avatarColors = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
    "bg-amber-50 text-amber-600",
];

/* ── Mock Data (sourced from mobile app mock-data.ts) ────────────────── */

const allAppointments = [
    {
        id: "dappt-001",
        name: "Ananya Gupta",
        type: "Video Consultation",
        date: "Today",
        time: "9:00 AM",
        status: "upcoming" as const,
    },
    {
        id: "dappt-002",
        name: "Rahul Verma",
        type: "Follow-up",
        date: "Today",
        time: "10:30 AM",
        status: "upcoming" as const,
    },
    {
        id: "dappt-003",
        name: "Meera Iyer",
        type: "New Patient",
        date: "Today",
        time: "11:45 AM",
        status: "upcoming" as const,
    },
    {
        id: "dappt-004",
        name: "Siddharth Rao",
        type: "Video Consultation",
        date: "Today",
        time: "2:00 PM",
        status: "upcoming" as const,
    },
    {
        id: "dappt-005",
        name: "Sarah Johnson",
        type: "Video Consultation",
        date: "Tomorrow",
        time: "9:30 AM",
        status: "upcoming" as const,
    },
    {
        id: "dappt-006",
        name: "Michael Brown",
        type: "Follow-up",
        date: "Mar 25, 2026",
        time: "11:00 AM",
        status: "upcoming" as const,
    },
    {
        id: "dappt-007",
        name: "Emily Davis",
        type: "Video Consultation",
        date: "Mar 20, 2026",
        time: "3:00 PM",
        status: "completed" as const,
    },
    {
        id: "dappt-008",
        name: "Ananya Gupta",
        type: "Follow-up",
        date: "Mar 18, 2026",
        time: "10:00 AM",
        status: "completed" as const,
    },
    {
        id: "dappt-009",
        name: "James Wilson",
        type: "In-Person",
        date: "Mar 15, 2026",
        time: "1:00 PM",
        status: "completed" as const,
    },
];

const pendingRequests = [
    {
        id: "dappt-010",
        name: "Priya Sharma",
        type: "New Patient",
        date: "Mar 26, 2026",
        time: "10:00 AM",
        reason:
            "Persistent headaches and dizziness for the past two weeks. Would like a general consultation.",
    },
    {
        id: "dappt-011",
        name: "David Lee",
        type: "Video Consultation",
        date: "Mar 27, 2026",
        time: "2:30 PM",
        reason:
            "Follow-up on recent blood work results. Need to discuss cholesterol levels.",
    },
    {
        id: "dappt-012",
        name: "Aisha Patel",
        type: "New Patient",
        date: "Mar 28, 2026",
        time: "11:00 AM",
        reason:
            "Seasonal allergies getting worse. Looking for long-term management plan.",
    },
];

/* ── Tabs Config ─────────────────────────────────────────────────────── */

const tabs = [
    { id: "all" as const, label: "All Appointments" },
    {
        id: "pending" as const,
        label: `Pending Requests (${pendingRequests.length})`,
    },
];

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function SchedulePage() {
    const [activeTab, setActiveTab] = useState<"all" | "pending">("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredAppointments = allAppointments.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredPending = pendingRequests.filter((r) =>
        r.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto font-spline pb-12">
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, staggerChildren: 0.08 }}
                className="space-y-6"
            >
                {/* ── Page Header ── */}
                <motion.div transition={{ duration: 0.35 }}>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                        Appointments
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your upcoming consultations and patient requests.
                    </p>
                </motion.div>

                {/* ── Controls Row ── */}
                <motion.div transition={{ duration: 0.35 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                    {/* Animated Tabs */}
                    <div className="flex space-x-1 border-b border-gray-200 w-full sm:w-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`relative px-4 py-2 text-sm font-medium transition-colors cursor-pointer ${activeTab === tab.id
                                    ? "text-[#4F46E5]"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabIndicator"
                                        className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-[#4F46E5]"
                                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search patients..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all bg-white shadow-sm"
                        />
                    </div>
                </motion.div>

                {/* ── Data List Container ── */}
                <motion.div transition={{ duration: 0.35 }} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                    {/* Column Headers */}
                    <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div>Patient</div>
                        <div className="text-center">Date & Time</div>
                        <div className="text-center">Status</div>
                        <div className="text-right">Action</div>
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "all" ? (
                            <motion.div
                                key="all"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {filteredAppointments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <Search size={40} className="mb-3 opacity-50" />
                                        <p className="text-sm font-medium">No appointments found</p>
                                    </div>
                                ) : (
                                    filteredAppointments.map((appt, index) => (
                                        <div
                                            key={appt.id}
                                            className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                                        >
                                            {/* Col 1 — Patient + Type */}
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatarColors[index % avatarColors.length]}`}
                                                >
                                                    <User size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                                        {appt.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                        <Video size={11} className="shrink-0" />
                                                        {appt.type}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Col 2 — Date & Time */}
                                            <p className="text-sm text-gray-700 text-center">
                                                {appt.date} • {appt.time}
                                            </p>

                                            {/* Col 3 — Status */}
                                            <div className="flex justify-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${appt.status === "upcoming"
                                                        ? "bg-green-50 text-green-700 border border-green-200"
                                                        : "bg-gray-50 text-gray-500 border border-gray-200"
                                                        }`}
                                                >
                                                    {appt.status === "upcoming" ? "Upcoming" : "Completed"}
                                                </span>
                                            </div>

                                            {/* Col 4 — Action */}
                                            <div className="flex justify-end">
                                                {appt.status === "upcoming" ? (
                                                    <button className="bg-white border border-gray-200 hover:border-[#4F46E5] hover:text-[#4F46E5] text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer">
                                                        <Video size={14} />
                                                        Join Call
                                                    </button>
                                                ) : (
                                                    <button className="bg-white border border-gray-200 hover:border-gray-300 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer">
                                                        <FileText size={14} />
                                                        Summary
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="pending"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {filteredPending.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <Clock size={40} className="mb-3 opacity-50" />
                                        <p className="text-sm font-medium">No pending requests</p>
                                    </div>
                                ) : (
                                    filteredPending.map((req, index) => (
                                        <div
                                            key={req.id}
                                            className="px-6 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors group"
                                        >
                                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                                                {/* Col 1 — Patient + Type */}
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatarColors[index % avatarColors.length]}`}
                                                    >
                                                        <User size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {req.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Video size={11} className="shrink-0" />
                                                            {req.type}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Col 2 — Date & Time */}
                                                <p className="text-sm text-gray-700 text-center">
                                                    {req.date} • {req.time}
                                                </p>

                                                {/* Col 3 — Status */}
                                                <div className="flex justify-center">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                        Pending
                                                    </span>
                                                </div>

                                                {/* Col 4 — Actions */}
                                                <div className="flex items-center justify-end gap-2">
                                                    <button className="text-gray-500 hover:text-red-600 px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer">
                                                        Decline
                                                    </button>
                                                    <button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer">
                                                        <Check size={14} />
                                                        Accept
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Reason box — spans full width below the grid */}
                                            <div className="mt-3 bg-amber-50/50 border border-amber-100 rounded-md p-3 text-xs text-amber-900 sm:ml-13">
                                                <span className="font-semibold">Reason: </span>
                                                {req.reason}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </motion.div>
        </div>
    );
}
