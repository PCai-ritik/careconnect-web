"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Video, User, FileText, Loader2, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";
import { getAppointments, getPatients, updateAppointmentStatus, type AppointmentResponse, type PatientResponse } from "@/lib/dashboard";
import PostCallSummarySheet from "@/components/dashboard/PostCallSummarySheet";
import PatientProfileSheet from "@/components/dashboard/PatientProfileSheet";
import NewPrescriptionSheet from "@/components/dashboard/NewPrescriptionSheet";
import type { PrescriptionPatient } from "@/components/dashboard/NewPrescriptionSheet";

/* ── Avatar Color Palette ────────────────────────────────────────────── */

const avatarColors = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
    "bg-amber-50 text-amber-600",
];


/* ── Helpers ──────────────────────────────────────────────────────────── */

function formatDate(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return "Today";
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatTime(iso: string): string {
    return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
}

function mapStatus(s: string, scheduledTime: string): "upcoming" | "overdue" | "completed" {
    if (s === 'COMPLETED' || s === 'CANCELLED' || s === 'NO_SHOW') return 'completed';
    if (new Date(scheduledTime) < new Date()) return 'overdue';
    return 'upcoming';
}

/* ── Emergency Reschedule Modal ──────────────────────────────────────── */

function EmergencyRescheduleModal({
    isOpen,
    patientName,
    onClose,
    onConfirm,
    loading,
}: {
    isOpen: boolean;
    patientName: string;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10"
            >
                {/* Warning Icon */}
                <div className="flex items-center justify-center w-14 h-14 mx-auto rounded-full bg-amber-50 mb-4">
                    <AlertTriangle size={28} className="text-amber-500" />
                </div>

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                    Emergency Reschedule
                </h3>
                <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                    This will cancel <span className="font-medium text-gray-700">{patientName}&apos;s</span> appointment
                    and notify them via WhatsApp with rescheduling options and an instant refund link.
                </p>

                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-6">
                    <p className="text-xs text-amber-800 leading-relaxed">
                        <span className="font-semibold">What happens next:</span> The caregiver will receive a
                        WhatsApp message offering to reschedule or receive an instant refund.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <AlertTriangle size={14} />}
                        Reschedule
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function SchedulePage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [rawAppointments, setRawAppointments] = useState<AppointmentResponse[]>([]);
    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Emergency reschedule modal state
    const [rescheduleModal, setRescheduleModal] = useState<{ id: string; name: string } | null>(null);
    const [summaryModalId, setSummaryModalId] = useState<string | null>(null);

    // Patient Profile Modal State
    const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [prescriptionPatient, setPrescriptionPatient] = useState<PrescriptionPatient | null>(null);
    const [profileRefreshKey, setProfileRefreshKey] = useState(0);

    const openSheet = (patientId: string) => {
        const raw = patients.find(p => p.id === patientId);
        if (raw) {
            setSelectedPatient(raw);
            setIsSheetOpen(true);
        }
    };

    useEffect(() => {
        async function load() {
            try {
                const [data, pts] = await Promise.all([
                    getAppointments(),
                    getPatients(),
                ]);
                setRawAppointments(data);
                setPatients(pts);
            } catch {
                // API failure — leave rawAppointments empty, show empty state below
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    // Map API data → display format
    const patientMap = new Map(patients.map(p => [p.id, p.full_name]));
    const allAppointments = rawAppointments.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        name: patientMap.get(a.patient_id) ?? 'Unknown Patient',
        type: a.appointment_type.replace('_', ' '),
        rawType: a.appointment_type,
        date: formatDate(a.scheduled_time),
        time: formatTime(a.scheduled_time),
        status: mapStatus(a.status, a.scheduled_time),
        rawStatus: a.status,
        duration: a.duration_minutes || 30,
        scheduledTime: a.scheduled_time,
    }));

    // Emergency reschedule handler → sets status to CANCELLED
    const handleEmergencyReschedule = async () => {
        if (!rescheduleModal) return;
        setActionLoading(rescheduleModal.id);
        try {
            await updateAppointmentStatus(rescheduleModal.id, 'CANCELLED');
            setRawAppointments(prev =>
                prev.map(a => a.id === rescheduleModal.id ? { ...a, status: 'CANCELLED' as const } : a)
            );
            setRescheduleModal(null);
        } catch (e) {
            console.error('Failed to reschedule appointment:', e);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredAppointments = allAppointments.filter((a) =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto  pb-12">
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
                        All appointments are instantly confirmed. Use Emergency Reschedule if you need to cancel.
                    </p>
                </motion.div>

                {/* ── Controls Row ── */}
                <motion.div transition={{ duration: 0.35 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                    {/* Status Pills */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span>{filteredAppointments.filter(a => a.status === 'upcoming').length} upcoming</span>
                        </div>
                        {filteredAppointments.some(a => a.status === 'overdue') && (
                            <>
                                <div className="w-px h-4 bg-gray-200" />
                                <div className="flex items-center gap-1.5 text-sm text-amber-600">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span>{filteredAppointments.filter(a => a.status === 'overdue').length} overdue</span>
                                </div>
                            </>
                        )}
                        <div className="w-px h-4 bg-gray-200" />
                        <div className="flex items-center gap-1.5 text-sm text-gray-500">
                            <div className="w-2 h-2 rounded-full bg-gray-300" />
                            <span>{filteredAppointments.filter(a => a.status === 'completed').length} completed</span>
                        </div>
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
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all bg-white shadow-sm"
                        />
                    </div>
                </motion.div>

                {/* ── Data List ── */}
                <motion.div transition={{ duration: 0.35 }} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                    {/* Column Headers */}
                    <div className="hidden sm:grid grid-cols-4 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <div>Patient</div>
                        <div className="text-center">Date & Time</div>
                        <div className="text-center">Status</div>
                        <div className="text-right">Actions</div>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Loader2 size={40} className="mb-3 animate-spin opacity-50" />
                            <p className="text-sm font-medium">Loading appointments…</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
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
                                    {appt.status === 'upcoming' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                            Confirmed
                                        </span>
                                    )}
                                    {appt.status === 'overdue' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                            <AlertTriangle size={11} />
                                            Overdue
                                        </span>
                                    )}
                                    {appt.status === 'completed' && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-200">
                                            Completed
                                        </span>
                                    )}
                                </div>

                                {/* Col 4 — Actions */}
                                <div className="flex flex-col items-end gap-2">
                                    {appt.rawStatus === 'IN_PROGRESS' && (
                                        <div className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-default">
                                            <Loader2 size={14} className="animate-spin" />
                                            Processing Summary...
                                        </div>
                                    )}

                                    {appt.status === 'upcoming' && (
                                        <>
                                            <button
                                                onClick={() => setRescheduleModal({ id: appt.id, name: appt.name })}
                                                className="bg-white border border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center justify-center w-[120px] gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                                            >
                                                <Calendar size={14} />
                                                Reschedule
                                            </button>
                                            {appt.rawType === 'IN_PERSON' ? (
                                                <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center justify-center w-[120px] gap-1.5 cursor-default sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                                                    <Calendar size={14} />
                                                    In-Person
                                                </span>
                                            ) : (
                                                <Link
                                                    href={`/consultation/${appt.id}`}
                                                    className="bg-white border border-gray-200 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center justify-center w-[120px] gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                                                >
                                                    <Video size={14} />
                                                    Join Call
                                                </Link>
                                            )}
                                        </>
                                    )}

                                    {appt.status === 'overdue' && appt.rawStatus !== 'IN_PROGRESS' && (
                                        <>
                                            <button
                                                onClick={() => setRescheduleModal({ id: appt.id, name: appt.name })}
                                                className="bg-white border border-amber-200 hover:border-amber-300 hover:bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center justify-center w-[120px] gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                                            >
                                                <Calendar size={14} />
                                                Reschedule
                                            </button>
                                            {appt.rawType !== 'IN_PERSON' && (
                                                <Link
                                                    href={`/consultation/${appt.id}`}
                                                    className="bg-amber-500 hover:bg-amber-600 text-white border border-amber-500 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center justify-center w-[120px] gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer"
                                                >
                                                    <Video size={14} />
                                                    Join Late
                                                </Link>
                                            )}
                                        </>
                                    )}

                                    {appt.status === 'completed' && appt.rawType !== 'IN_PERSON' && (
                                        <button
                                            onClick={() => setSummaryModalId(appt.id)}
                                            className="bg-white border border-gray-200 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer whitespace-nowrap"
                                        >
                                            <FileText size={14} />
                                            View Summary
                                        </button>
                                    )}

                                    {appt.status === 'completed' && appt.rawType === 'IN_PERSON' && (
                                        <button
                                            onClick={() => openSheet(appt.patientId)}
                                            className="bg-white border border-gray-200 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 sm:opacity-0 sm:group-hover:opacity-100 cursor-pointer whitespace-nowrap"
                                        >
                                            <User size={14} />
                                            Open Patient
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </motion.div>
            </motion.div>

            {/* ── Emergency Reschedule Modal ── */}
            <EmergencyRescheduleModal
                isOpen={!!rescheduleModal}
                patientName={rescheduleModal?.name ?? ""}
                onClose={() => setRescheduleModal(null)}
                onConfirm={handleEmergencyReschedule}
                loading={actionLoading === rescheduleModal?.id}
            />

            {/* ── Post-Call Summary Sheet ── */}
            <PostCallSummarySheet
                isOpen={!!summaryModalId}
                appointmentId={summaryModalId}
                onClose={() => setSummaryModalId(null)}
            />

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
        </div>
    );
}
