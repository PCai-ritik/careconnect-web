"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    CalendarCheck,
    Users,
    User,
    Clock,
    IndianRupee,
    Video,
} from "lucide-react";
import PatientProfileSheet from "@/components/dashboard/PatientProfileSheet";

/* ── Animation Variants ──────────────────────────────────────────────── */

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

/* ── Avatar Color Palette ─────────────────────────────────────────── */

const avatarColors = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
    "bg-amber-50 text-amber-600",
];

/* ── Mock Data ───────────────────────────────────────────────────────── */

const stats = [
    { label: "Today's Patients", value: "8", icon: CalendarCheck },
    { label: "Total Patients", value: "1,240", icon: Users },
    { label: "Avg. Consult Time", value: "15 min", icon: Clock },
    { label: "Monthly Revenue", value: "₹ 45,000", icon: IndianRupee, badge: "↑ 12%" },
];

// Schedule rows have IDs so "Join Call" can route to /consultation/[id]
const scheduleRows = [
    { id: "dappt-001", name: "Sarah Jenkins", condition: "Hypertension", time: "10:00 AM — Video Consultation" },
    { id: "dappt-002", name: "Ravi Kumar", condition: "Diabetes", time: "11:30 AM — Follow-up" },
    { id: "dappt-003", name: "Ananya Gupta", condition: "Asthma", time: "1:00 PM — New Patient" },
    { id: "dappt-004", name: "James Wilson", condition: "Arthritis", time: "2:30 PM — Video Consultation" },
    { id: "dappt-005", name: "Meera Iyer", condition: "Migraine", time: "4:00 PM — Follow-up" },
];

const recentPatients = [
    { id: "pt-001", name: "Sarah Jenkins", condition: "Hypertension", date: "Mar 24" },
    { id: "pt-002", name: "Ravi Kumar", condition: "Diabetes", date: "Mar 23" },
    { id: "pt-003", name: "Ananya Gupta", condition: "Asthma", date: "Mar 22" },
    { id: "pt-004", name: "Meera Iyer", condition: "Migraine", date: "Mar 21" },
    { id: "pt-005", name: "Daniel Thomas", condition: "Arthritis", date: "Mar 20" },
];

type SheetPatient = { id: string; name: string; condition: string };

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardHomePage() {
    const [selectedPatient, setSelectedPatient] = useState<SheetPatient | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const openSheet = (patient: SheetPatient) => {
        setSelectedPatient(patient);
        setIsSheetOpen(true);
    };

    return (
        <>
            <div className="max-w-7xl mx-auto font-spline pb-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* ── Page Greeting ── */}
                    <motion.div variants={itemVariants}>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            Good morning, Dr. Mehta
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Here is what&apos;s happening at your clinic today.
                        </p>
                    </motion.div>

                    {/* ── Top Stats Row ── */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {stats.map((stat) => {
                            const Icon = stat.icon;
                            return (
                                <div
                                    key={stat.label}
                                    className="bg-white rounded-xl border border-gray-200 p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-xl hover:border-gray-300 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                        <Icon size={18} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-2 tracking-tight">
                                        {stat.value}
                                        {stat.badge && (
                                            <span className="ml-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                                                {stat.badge}
                                            </span>
                                        )}
                                    </h3>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* ── Next Appointment Hero Banner ── */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-[#4F46E5]/5 to-transparent rounded-xl border-l-4 border-l-[#4F46E5] border-y border-r border-[#4F46E5]/20 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between"
                    >
                        {/* Left Side — clickable patient */}
                        <button
                            onClick={() => openSheet({ id: "dappt-001", name: "Sarah Jenkins", condition: "Hypertension" })}
                            className="flex items-center gap-4 text-left group cursor-pointer"
                        >
                            <span className="text-xs font-bold tracking-wider text-[#4F46E5] uppercase mb-1 block self-start pt-1">
                                Next Appointment • In 15 Mins
                            </span>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${avatarColors[0]}`}>
                                <User size={20} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[#4F46E5] transition-colors">
                                    Sarah Jenkins
                                </h4>
                                <p className="text-sm text-gray-500">10:00 AM • Video Consultation</p>
                            </div>
                        </button>

                        {/* Right Side — Start Call routes to consultation room */}
                        <Link
                            href="/consultation/dappt-001"
                            className="bg-[#4F46E5] hover:bg-[#4338CA] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
                        >
                            <Video size={18} />
                            Start Call
                        </Link>
                    </motion.div>

                    {/* ── Split Layout: Schedule + Recent Patients ── */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Today's Schedule (Col-Span-2) ── */}
                        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-900">Today&apos;s Schedule</h2>
                                <Link href="/dashboard/schedule" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer">
                                    View All
                                </Link>
                            </div>

                            {scheduleRows.map((row, index) => (
                                <div
                                    key={row.id}
                                    className="px-6 py-4 border-b border-dashed border-gray-200 last:border-0 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                                >
                                    {/* Left — clickable patient info */}
                                    <button
                                        onClick={() => openSheet({ id: row.id, name: row.name, condition: row.condition })}
                                        className="flex items-center gap-3 text-left cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarColors[index % avatarColors.length]}`}>
                                            <User size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 hover:text-[#4F46E5] transition-colors">{row.name}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{row.time}</p>
                                        </div>
                                    </button>

                                    {/* Right — Join Call routes to consultation */}
                                    <Link
                                        href={`/consultation/${row.id}`}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-[#4F46E5] text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-1.5"
                                    >
                                        <Video size={12} />
                                        Join Call
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {/* ── Recent Patients (Col-Span-1) ── */}
                        <div className="col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-900">Recent Patients</h2>
                                <Link href="/dashboard/patients" className="text-sm font-medium text-[#4F46E5] hover:text-[#4338CA] cursor-pointer">
                                    View All
                                </Link>
                            </div>

                            {recentPatients.map((patient, index) => (
                                <button
                                    key={patient.id}
                                    onClick={() => openSheet(patient)}
                                    className="w-full px-5 py-4 border-b border-dashed border-gray-200 last:border-0 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                >
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                                        <User size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                        <span className="text-xs text-[#4F46E5] bg-[#4F46E5]/10 w-fit px-2 py-0.5 rounded-md mt-1 inline-block">
                                            {patient.condition}
                                        </span>
                                    </div>
                                    <span className="ml-auto text-xs text-gray-400 shrink-0">{patient.date}</span>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Patient Profile Slide-Over ── */}
            <PatientProfileSheet
                patient={selectedPatient}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
            />
        </>
    );
}
