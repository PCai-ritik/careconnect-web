"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    CalendarCheck,
    Users,
    User,
    Clock,
    IndianRupee,
    Video,
    Loader2,
    Share2,
    CalendarOff,
    FileText,
} from "lucide-react";
import PatientProfileSheet from "@/components/dashboard/PatientProfileSheet";
import NewPrescriptionSheet from "@/components/dashboard/NewPrescriptionSheet";
import PostCallSummarySheet from "@/components/dashboard/PostCallSummarySheet";
import type { PrescriptionPatient } from "@/components/dashboard/NewPrescriptionSheet";
import { getAppointments, getPatients, getDashboardStats, startVideoSession, getJoinToken, type AppointmentResponse, type PatientResponse } from "@/lib/dashboard";
import { getMe, type MeResponse } from "@/lib/auth";
import { useBranding } from "@/hooks/useBranding";

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

// ─── Helpers ────────────────────────────────────────────────────────────

function formatAppointmentTime(iso: string, type: string): string {
    const d = new Date(iso);
    return `${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} — ${type.replace('_', ' ')}`;
}

function isToday(iso: string): boolean {
    const d = new Date(iso);
    const now = new Date();
    return d.toDateString() === now.toDateString();
}

/** Compute a human-readable "time until" label from an ISO date */
function getTimeUntilLabel(iso: string): string {
    const now = new Date();
    const target = new Date(iso);
    const diffMs = target.getTime() - now.getTime();

    if (diffMs <= 0) return "Now";

    const diffMin = Math.round(diffMs / 60000);
    if (diffMin < 1) return "Now";
    if (diffMin === 1) return "In 1 min";
    if (diffMin < 60) return `In ${diffMin} min`;

    const diffHrs = Math.floor(diffMin / 60);
    const remainMin = diffMin % 60;
    if (diffHrs === 1 && remainMin === 0) return "In 1 hr";
    if (diffHrs === 1) return `In 1 hr ${remainMin} min`;
    if (remainMin === 0) return `In ${diffHrs} hrs`;
    return `In ${diffHrs} hrs ${remainMin} min`;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

type DisplayPatient = { id: string; name: string; condition: string; date: string };

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function DashboardHomePage() {
    const branding = useBranding();
    const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [prescriptionPatient, setPrescriptionPatient] = useState<PrescriptionPatient | null>(null);
    const [profileRefreshKey, setProfileRefreshKey] = useState(0);
    const [summaryModalId, setSummaryModalId] = useState<string | null>(null);

    // Real data state
    const [doctorName, setDoctorName] = useState("Doctor");
    const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [avgConsultMinutes, setAvgConsultMinutes] = useState(0);

    useEffect(() => {
        async function loadData() {
            try {
                const [appts, pts] = await Promise.all([
                    getAppointments(),
                    getPatients(),
                ]);
                setAppointments(appts);
                setPatients(pts);
            } catch {
                // Data stays empty — UI handles empty states
            } finally {
                setLoading(false);
            }

            // Dashboard stats — separate so failure doesn't affect main data
            try {
                const stats = await getDashboardStats();
                setAvgConsultMinutes(stats.avg_consult_minutes);
            } catch {
                // Keep default 0
            }

            // Doctor name — separate so failure doesn't trigger mock fallback
            try {
                const me = await getMe();
                if (me?.full_name) {
                    setDoctorName(me.full_name.split(' ')[0] || me.full_name);
                }
            } catch {
                // Keep default "Doctor"
            }
        }
        loadData();
    }, []);

    // Derive data
    const todayAppointments = appointments.filter(a => isToday(a.scheduled_time));
    const totalPatients = patients.length;

    const patientMap = new Map(patients.map(p => [p.id, p.full_name]));
    const scheduleRows = todayAppointments.slice(0, 5).map(a => ({
        id: a.id,
        name: patientMap.get(a.patient_id) ?? 'Unknown Patient',
        condition: a.reason || a.appointment_type.replace('_', ' '),
        time: formatAppointmentTime(a.scheduled_time, a.appointment_type),
        rawStatus: a.status,
        duration: a.duration_minutes || 30,
        scheduledTime: a.scheduled_time,
    }));

    const recentSummaries = appointments
        .filter(a => a.status === 'COMPLETED')
        .sort((a, b) => new Date(b.scheduled_time).getTime() - new Date(a.scheduled_time).getTime())
        .slice(0, 3)
        .map(a => ({
            id: a.id,
            name: patientMap.get(a.patient_id) ?? 'Unknown Patient',
            date: new Date(a.scheduled_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            time: formatAppointmentTime(a.scheduled_time, a.appointment_type),
        }));

    const recentPatients: DisplayPatient[] = patients.slice(0, 5).map(p => ({
        id: p.id,
        name: p.full_name,
        condition: p.existing_conditions?.[0] || '—',
        date: new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));

    // Next upcoming appointment — find the soonest future appointment (any day)
    const nextUpcoming = useMemo(() => {
        const now = new Date();
        const futureAppts = appointments
            .filter(a => new Date(a.scheduled_time) > now && a.status !== 'COMPLETED' && a.status !== 'CANCELLED')
            .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());
        return futureAppts[0] ?? null;
    }, [appointments]);

    const nextAppointmentDisplay = nextUpcoming ? {
        id: nextUpcoming.id,
        name: patientMap.get(nextUpcoming.patient_id) ?? 'Unknown Patient',
        time: formatAppointmentTime(nextUpcoming.scheduled_time, nextUpcoming.appointment_type),
        timeUntil: getTimeUntilLabel(nextUpcoming.scheduled_time),
    } : null;

    const stats = [
        { label: "Today's Patients", value: String(todayAppointments.length), icon: CalendarCheck },
        { label: "Total Patients", value: totalPatients.toLocaleString(), icon: Users },
        { label: "Avg. Consult Time", value: avgConsultMinutes > 0 ? `${avgConsultMinutes} min` : "—", icon: Clock },
        { label: "Monthly Revenue", value: "—", icon: IndianRupee },
    ];

    const openSheet = (patientId: string) => {
        const raw = patients.find(p => p.id === patientId);
        if (raw) {
            setSelectedPatient(raw);
            setIsSheetOpen(true);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto  pb-12">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="space-y-6"
                >
                    {/* ── Page Greeting ── */}
                    <motion.div variants={itemVariants}>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                            {getGreeting()}, Dr. {doctorName}
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
                                    </h3>
                                </div>
                            );
                        })}
                    </motion.div>

                    {/* ── Next Appointment Hero Banner ── */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-gradient-to-r from-[rgba(var(--brand-primary-rgb),0.05)] to-transparent rounded-xl border-l-4 border-l-[var(--brand-primary)] border-y border-r border-[rgba(var(--brand-primary-rgb),0.2)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between"
                    >
                        {nextAppointmentDisplay ? (
                            <>
                                {/* Left Side — clickable patient */}
                                <Link
                                    href={`/consultation/${nextAppointmentDisplay.id}`}
                                    className="flex items-center gap-4 text-left group cursor-pointer"
                                >
                                    <div>
                                        <span className="text-xs font-bold tracking-wider text-[var(--brand-primary)] uppercase mb-1 block">
                                            Next Appointment • {nextAppointmentDisplay.timeUntil}
                                        </span>
                                    </div>
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">
                                            {nextAppointmentDisplay.name}
                                        </h4>
                                        <p className="text-sm text-gray-500">{nextAppointmentDisplay.time}</p>
                                    </div>
                                </Link>

                                {/* Right Side — Start Call + Share */}
                                <div className="flex items-center gap-2">
                                    <ShareButton appointmentId={nextAppointmentDisplay.id} patientName={nextAppointmentDisplay.name} brandName={branding.name} />
                                    <Link
                                        href={`/consultation/${nextAppointmentDisplay.id}`}
                                        className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-sm active:scale-[0.98] cursor-pointer"
                                    >
                                        <Video size={18} />
                                        Start Call
                                    </Link>
                                </div>
                            </>
                        ) : (
                            /* Empty state — no upcoming appointments */
                            <div className="flex items-center gap-4 w-full">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                    <CalendarOff size={20} className="text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-900">No Upcoming Appointments</h4>
                                    <p className="text-sm text-gray-500">You&apos;re all caught up! New appointments will appear here.</p>
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ── Split Layout: Schedule + Recent Patients ── */}
                    <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {/* ── Today's Schedule (Col-Span-2) ── */}
                        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-900">Today&apos;s Schedule</h2>
                                <Link href="/dashboard/schedule" className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] cursor-pointer">
                                    View All
                                </Link>
                            </div>

                            {scheduleRows.length > 0 ? (
                                scheduleRows.map((row, index) => (
                                    <div
                                        key={row.id}
                                        className="px-6 py-4 border-b border-dashed border-gray-200 last:border-0 flex items-center justify-between hover:bg-gray-50 transition-colors group"
                                    >
                                        {/* Left — clickable patient info */}
                                        <Link
                                            href={`/consultation/${row.id}`}
                                            className="flex items-center gap-3 text-left cursor-pointer"
                                        >
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 hover:text-[var(--brand-primary)] transition-colors">{row.name}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">{row.time}</p>
                                            </div>
                                        </Link>

                                        {/* Right — Join Call + Share or Processing */}
                                        <div className="flex items-center gap-2">
                                            {(() => {
                                                const isProcessing = row.rawStatus === 'IN_PROGRESS' && (new Date(row.scheduledTime).getTime() + row.duration * 60000) < Date.now();
                                                
                                                if (isProcessing) {
                                                    return (
                                                        <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-default">
                                                            <Loader2 size={14} className="animate-spin" />
                                                            Processing Summary...
                                                        </div>
                                                    );
                                                }

                                                if (row.rawStatus === 'COMPLETED' || row.rawStatus === 'CANCELLED' || row.rawStatus === 'NO_SHOW') {
                                                    return (
                                                        <button 
                                                            onClick={() => setSummaryModalId(row.id)}
                                                            className="bg-white border border-gray-200 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <FileText size={14} />
                                                            View Summary
                                                        </button>
                                                    );
                                                }

                                                return (
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                        <ShareButton appointmentId={row.id} patientName={row.name} brandName={branding.name} variant="subtle" />
                                                        <Link
                                                            href={`/consultation/${row.id}`}
                                                            className="border border-gray-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-[var(--brand-primary)] text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer flex items-center gap-1.5"
                                                        >
                                                            <Video size={12} />
                                                            Join Call
                                                        </Link>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                /* Empty state for Today's Schedule */
                                <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <CalendarOff size={24} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-700">No appointments today</h3>
                                    <p className="text-xs text-gray-500 mt-1 max-w-xs">
                                        Your schedule is clear for today. Appointments booked for today will appear here.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* ── Recent Patients (Col-Span-1) ── */}
                        <div className="col-span-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                                <h2 className="text-base font-semibold text-gray-900">Recent Patients</h2>
                                <Link href="/dashboard/patients" className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] cursor-pointer">
                                    View All
                                </Link>
                            </div>

                            {recentPatients.length > 0 ? (
                                recentPatients.map((patient, index) => (
                                    <button
                                        key={patient.id}
                                        onClick={() => openSheet(patient.id)}
                                        className="w-full px-5 py-4 border-b border-dashed border-gray-200 last:border-0 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer text-left"
                                    >
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                                            <User size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-gray-900">{patient.name}</p>
                                            <span className="text-xs text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 w-fit px-2 py-0.5 rounded-md mt-1 inline-block">
                                                {patient.condition}
                                            </span>
                                        </div>
                                        <span className="ml-auto text-xs text-gray-400 shrink-0">{patient.date}</span>
                                    </button>
                                ))
                            ) : (
                                /* Empty state for Recent Patients */
                                <div className="px-5 py-10 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                        <Users size={20} className="text-gray-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-gray-700">No patients yet</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Add your first patient to get started.
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ── Recent Summaries (Full Width) ── */}
                    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="text-base font-semibold text-gray-900">Recent Summaries</h2>
                            <Link href="/dashboard/schedule" className="text-sm font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] cursor-pointer">
                                View History
                            </Link>
                        </div>
                        {recentSummaries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                                {recentSummaries.map((summary, index) => (
                                    <button
                                        key={summary.id}
                                        onClick={() => setSummaryModalId(summary.id)}
                                        className="text-left border border-gray-200 rounded-xl p-4 hover:border-[var(--brand-primary)] hover:shadow-md transition-all cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarColors[index % avatarColors.length]}`}>
                                                <User size={18} />
                                            </div>
                                            <div className="bg-green-50 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                                                <FileText size={12} />
                                                Ready
                                            </div>
                                        </div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-[var(--brand-primary)] transition-colors">{summary.name}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{summary.date} • {summary.time.split(' —')[0]}</p>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                    <FileText size={20} className="text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-700">No summaries yet</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                                    AI-generated summaries will appear here after you complete a video consultation.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            </div>

            {/* ── Patient Profile Slide-Over ── */}
            <PatientProfileSheet
                patient={selectedPatient}
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                onNewPrescription={() => {
                    if (selectedPatient) {
                        setPrescriptionPatient({
                            id: selectedPatient.id,
                            name: selectedPatient.full_name,
                            condition: selectedPatient.existing_conditions?.[0] || '—',
                            dateOfBirth: selectedPatient.date_of_birth,
                            gender: selectedPatient.gender,
                            whatsappNumber: selectedPatient.whatsapp_number || undefined,
                        });
                    }
                    setIsSheetOpen(false);
                    setIsPrescriptionOpen(true);
                }}
                key={profileRefreshKey}
            />
            <NewPrescriptionSheet
                isOpen={isPrescriptionOpen}
                onClose={() => { setIsPrescriptionOpen(false); setPrescriptionPatient(null); }}
                patient={prescriptionPatient}
                onPrescriptionCreated={() => setProfileRefreshKey(k => k + 1)}
            />
            <PostCallSummarySheet
                isOpen={!!summaryModalId}
                appointmentId={summaryModalId}
                onClose={() => setSummaryModalId(null)}
            />
        </>
    );
}

/* ── ShareButton — fetches patient token and opens WhatsApp ────────── */

function ShareButton({ appointmentId, patientName, brandName, variant = "default" }: {
    appointmentId: string;
    patientName: string;
    brandName: string;
    variant?: "default" | "subtle";
}) {
    const [loading, setLoading] = useState(false);

    const handleShare = useCallback(async () => {
        if (!appointmentId || loading) return;
        setLoading(true);
        try {
            // Try start session first (returns patient_join_token), fallback to join
            let patientToken: string | undefined;
            try {
                const res = await startVideoSession(appointmentId);
                patientToken = res.patient_join_token;
            } catch {
                const res = await getJoinToken(appointmentId);
                patientToken = res.patient_join_token;
            }

            if (!patientToken) {
                alert("The video session hasn't been started yet. Start the call first.");
                return;
            }

            const joinUrl = `${window.location.origin}/join/${appointmentId}?token=${encodeURIComponent(patientToken)}`;
            const msg = `Hi! Your ${brandName} video consultation is ready.\n\nJoin here: ${joinUrl}`;
            const waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
            window.open(waUrl, "_blank");
        } catch (err) {
            console.error("Share failed:", err);
            alert("Failed to generate share link. Try again.");
        } finally {
            setLoading(false);
        }
    }, [appointmentId, loading]);

    if (variant === "subtle") {
        return (
            <button
                onClick={handleShare}
                disabled={loading}
                className="border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-600 text-gray-500 p-1.5 rounded-md text-xs transition-colors cursor-pointer disabled:opacity-50"
                title={`Share call link with ${patientName} via WhatsApp`}
            >
                {loading ? <Loader2 size={12} className="animate-spin" /> : <Share2 size={12} />}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            disabled={loading}
            className="border border-gray-200 bg-white hover:bg-green-50 hover:border-green-300 hover:text-green-600 text-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title={`Share call link with ${patientName} via WhatsApp`}
        >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
            Share
        </button>
    );
}
