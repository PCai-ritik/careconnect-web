"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    X, FileText, User, Package, ChevronDown, ChevronRight,
    Heart, Activity, Thermometer, TrendingUp, AlertCircle,
    Phone, MapPin, Droplets, Calendar, Clock, Video, Loader2, Sparkles,
} from "lucide-react";
import {
    getPatientRecords,
    getDoctorProfile,
    createAppointment,
    getPostCallSummary,
    type PatientResponse,
    type MedicalRecordResponse,
    type PostCallSummaryResponse,
} from "@/lib/dashboard";
import { getMe } from "@/lib/auth";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

/* ── Tab config ──────────────────────────────────────────────────────── */

type TabId = "history" | "profile" | "medications";
const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: "history", label: "History", Icon: FileText },
    { id: "profile", label: "Profile", Icon: User },
    { id: "medications", label: "Medications", Icon: Package },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function fmtDate(iso: string | null): string {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function PostCallSummaryBlock({ appointmentId }: { appointmentId: string }) {
    const [summary, setSummary] = useState<PostCallSummaryResponse | null>(null);
    useEffect(() => {
        if (!appointmentId) return;
        getPostCallSummary(appointmentId).then(setSummary).catch(() => {});
    }, [appointmentId]);

    if (!summary || (!summary.diagnosis && !summary.treatment_plan)) return null;
    
    let diagnosis = summary.diagnosis || "";
    let treatmentPlan = summary.treatment_plan || "";
    let followUp = summary.follow_up || "";

    return (
        <div className="mt-4 bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
            <div className="flex items-center gap-1.5 mb-3">
                <Sparkles size={14} className="text-indigo-600" />
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">AI Consultation Summary</p>
            </div>
            <div className="space-y-3">
                {diagnosis && (
                    <div>
                        <p className="text-[11px] font-bold text-indigo-400 uppercase">Diagnosis</p>
                        <p className="text-sm text-indigo-900 mt-0.5">{diagnosis}</p>
                    </div>
                )}
                {treatmentPlan && (
                    <div>
                        <p className="text-[11px] font-bold text-indigo-400 uppercase">Treatment Plan</p>
                        <p className="text-sm text-indigo-900 mt-0.5">{treatmentPlan}</p>
                    </div>
                )}
                {followUp && (
                    <div>
                        <p className="text-[11px] font-bold text-indigo-400 uppercase">Follow Up</p>
                        <p className="text-sm text-indigo-900 mt-0.5">{followUp}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── History Tab ─────────────────────────────────────────────────────── */

function HistoryTab({ records, loading }: { records: MedicalRecordResponse[]; loading: boolean }) {
    const [openId, setOpenId] = useState<string | null>(null);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 size={16} className="animate-spin" /> Loading history…
            </div>
        );
    }

    if (records.length === 0) {
        return (
            <div className="text-center py-12">
                <FileText size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">No consultation history yet.</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Past Consultations ({records.length})
            </p>
            <div className="space-y-2">
                {records.map((c) => {
                    const isOpen = openId === c.id;
                    return (
                        <div key={c.id} className="rounded-xl border border-gray-200 overflow-hidden">
                            {/* Accordion header */}
                            <button
                                onClick={() => setOpenId(isOpen ? null : c.id)}
                                className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${isOpen ? "bg-[var(--brand-primary)]/8 border-b border-[var(--brand-primary)]/15" : "hover:bg-gray-50"}`}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{c.diagnosis}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{fmtDate(c.created_at)}</p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                                        {c.prescriptions.length} Rx
                                    </span>
                                    {isOpen ? <ChevronDown size={15} className="text-indigo-500" /> : <ChevronRight size={15} className="text-gray-400" />}
                                </div>
                            </button>

                            {/* Accordion body */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 space-y-4 bg-gray-50">
                                            {/* Vitals grid */}
                                            {c.vitals && Object.keys(c.vitals).length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 mb-2">Vitals</p>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {[
                                                            { Icon: Heart, color: "text-red-500", label: `BP: ${c.vitals.bp || "—"}` },
                                                            { Icon: Activity, color: "text-pink-500", label: `Pulse: ${c.vitals.pulse || "—"}` },
                                                            { Icon: Thermometer, color: "text-orange-500", label: `Temp: ${c.vitals.temp || "—"}` },
                                                            { Icon: TrendingUp, color: "text-blue-500", label: `Weight: ${c.vitals.weight || "—"}` },
                                                        ].map(({ Icon, color, label }) => (
                                                            <div key={label} className="flex items-center gap-1.5 text-sm text-gray-700">
                                                                <Icon size={13} className={color} />
                                                                {label}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {c.vitals && Object.keys(c.vitals).length > 0 && <div className="h-px bg-gray-100" />}

                                            {/* Symptoms */}
                                            {c.symptoms && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 mb-1">Symptoms</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{c.symptoms}</p>
                                                </div>
                                            )}

                                            {/* Treatment */}
                                            {c.treatment && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 mb-1">Treatment</p>
                                                    <p className="text-sm text-gray-700 leading-relaxed">{c.treatment}</p>
                                                </div>
                                            )}

                                            {/* Prescriptions */}
                                            {c.prescriptions.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-medium text-gray-400 mb-2">Prescriptions</p>
                                                    <div className="space-y-1.5">
                                                        {c.prescriptions.map((rx) => (
                                                            <div key={rx.id} className="flex items-start gap-2">
                                                                <Package size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                                                                <p className="text-sm text-gray-700">
                                                                    {rx.medication_name}
                                                                    {rx.dosage ? ` ${rx.dosage}` : ""}
                                                                    {rx.frequency ? ` — ${rx.frequency}` : ""}
                                                                    {rx.duration ? ` (${rx.duration})` : ""}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Follow-up */}
                                            {c.follow_up_date && (
                                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
                                                    <Clock size={13} className="text-amber-600 shrink-0" />
                                                    <p className="text-sm text-amber-700 font-medium">
                                                        Follow-up: {fmtDate(c.follow_up_date)}
                                                    </p>
                                                </div>
                                            )}

                                            {c.appointment_id && (
                                                <PostCallSummaryBlock appointmentId={c.appointment_id} />
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ── Profile Tab ─────────────────────────────────────────────────────── */

function ProfileTab({ patient }: { patient: PatientResponse }) {
    return (
        <div className="space-y-6">
            {/* Personal information */}
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                <div className="space-y-3">
                    {[
                        { Icon: User, label: "Full Name", value: patient.full_name },
                        { Icon: Calendar, label: "Date of Birth", value: patient.date_of_birth ? fmtDate(patient.date_of_birth) : "—" },
                        { Icon: Phone, label: "Phone", value: patient.whatsapp_number || "—" },
                        { Icon: MapPin, label: "Address", value: patient.address || "—" },
                        { Icon: Droplets, label: "Blood Group", value: patient.blood_group || "—" },
                    ].map(({ Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                            <Icon size={15} className="text-gray-400 shrink-0" />
                            <div>
                                <p className="text-[10px] text-gray-400">{label}</p>
                                <p className="text-sm font-medium text-gray-900">{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-px bg-gray-100" />

            {/* Allergies */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={14} className="text-red-500" />
                    <p className="text-sm font-semibold text-gray-800">Known Allergies</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(patient.allergies && patient.allergies.length > 0) ? patient.allergies.map((a) => (
                        <span key={a} className="text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full font-medium">{a}</span>
                    )) : <span className="text-sm text-gray-400">No known allergies</span>}
                </div>
            </div>

            {/* Existing conditions */}
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={14} className="text-amber-500" />
                    <p className="text-sm font-semibold text-gray-800">Existing Conditions</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {(patient.existing_conditions && patient.existing_conditions.length > 0) ? patient.existing_conditions.map((c) => (
                        <span key={c} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full font-medium">{c}</span>
                    )) : <span className="text-sm text-gray-400">No existing conditions</span>}
                </div>
            </div>

            {/* Emergency contact */}
            {(patient.emergency_contact_name || patient.emergency_contact_phone) && (
                <div>
                    <p className="text-sm font-semibold text-gray-800 mb-2">Emergency Contact</p>
                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                        <p className="text-sm font-medium text-gray-900">{patient.emergency_contact_name || "—"}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{patient.emergency_contact_phone || "—"}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Medications Tab ─────────────────────────────────────────────────── */

function MedicationsTab({ records, loading }: { records: MedicalRecordResponse[]; loading: boolean }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                <Loader2 size={16} className="animate-spin" /> Loading medications…
            </div>
        );
    }

    const allMeds = records.flatMap((r) =>
        r.prescriptions.map((rx) => ({
            rx,
            date: r.created_at,
            diagnosis: r.diagnosis,
        }))
    );

    if (allMeds.length === 0) {
        return (
            <div className="text-center py-12">
                <Package size={32} className="mx-auto text-gray-300 mb-3" />
                <p className="text-sm text-gray-400">No medications prescribed yet.</p>
            </div>
        );
    }

    return (
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Current & Past Medications
            </p>
            <div className="space-y-2">
                {allMeds.map(({ rx, date, diagnosis }) => (
                    <div key={rx.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                            <Package size={15} className="text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {rx.medication_name}
                                {rx.dosage ? ` ${rx.dosage}` : ""}
                                {rx.frequency ? ` — ${rx.frequency}` : ""}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">Prescribed {fmtDate(date)} · {diagnosis}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────────── */

export default function PatientProfileSheet({
    patient,
    isOpen,
    onClose,
    onNewPrescription,
}: {
    patient: PatientResponse | null;
    isOpen: boolean;
    onClose: () => void;
    onNewPrescription?: () => void;
}) {
    const [activeTab, setActiveTab] = useState<TabId>("history");
    const [records, setRecords] = useState<MedicalRecordResponse[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(false);
    const [startingCall, setStartingCall] = useState(false);
    const router = useRouter();

    useLockBodyScroll(isOpen);

    // Fetch medical records when sheet opens
    useEffect(() => {
        if (isOpen && patient) {
            setLoadingRecords(true);
            getPatientRecords(patient.id)
                .then(setRecords)
                .catch(() => setRecords([]))
                .finally(() => setLoadingRecords(false));
        }
        if (!isOpen) {
            setRecords([]);
            setActiveTab("history");
        }
    }, [isOpen, patient?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    if (!patient) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="pps-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="pps-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-start justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-full bg-[var(--brand-primary)] flex items-center justify-center shrink-0">
                                    <User size={28} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">{patient.full_name}</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        {patient.gender || "—"} · {patient.blood_group || "—"} · {patient.whatsapp_number || "—"}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Tab Bar */}
                        <div className="flex border-b border-gray-200 shrink-0">
                            {TABS.map(({ id, label, Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium border-b-2 transition-all cursor-pointer ${activeTab === id
                                        ? "border-[var(--brand-primary)] text-[var(--brand-primary)]"
                                        : "border-transparent text-gray-500 hover:text-gray-700"
                                        }`}
                                >
                                    <Icon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>

                        {/* Scrollable Tab Content */}
                        <div className="flex-1 overflow-y-auto p-5">
                            {activeTab === "history" && <HistoryTab records={records} loading={loadingRecords} />}
                            {activeTab === "profile" && <ProfileTab patient={patient} />}
                            {activeTab === "medications" && <MedicationsTab records={records} loading={loadingRecords} />}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 bg-white flex flex-col gap-3 shrink-0">
                            {/* Start Video Call */}
                            <button
                                onClick={async () => {
                                    if (startingCall) return;
                                    setStartingCall(true);
                                    try {
                                        const [profile, me] = await Promise.all([
                                            getDoctorProfile(),
                                            getMe(),
                                        ]);
                                        if (!profile || !me?.hospital_id) throw new Error('Missing doctor/hospital info');
                                        const appt = await createAppointment({
                                            doctor_id: profile.id,
                                            patient_id: patient.id,
                                            hospital_id: me.hospital_id,
                                            scheduled_time: new Date().toISOString(),
                                            duration_minutes: 30,
                                            appointment_type: 'VIDEO',
                                        });
                                        onClose();
                                        router.push(`/consultation/${appt.id}`);
                                    } catch (e) {
                                        console.error('Failed to create appointment:', e);
                                        setStartingCall(false);
                                    }
                                }}
                                disabled={startingCall}
                                className={`w-full py-3 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ${
                                    startingCall
                                        ? 'bg-[var(--brand-primary)]/60 text-white/80 cursor-not-allowed'
                                        : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white'
                                }`}
                            >
                                {startingCall ? (
                                    <><Loader2 size={16} className="animate-spin" /> Starting…</>
                                ) : (
                                    <><Video size={16} /> Start Video Consultation</>
                                )}
                            </button>

                            {/* New Prescription */}
                            {onNewPrescription && (
                                <button
                                    onClick={() => { onClose(); onNewPrescription(); }}
                                    className="w-full bg-[var(--brand-primary)]/10 hover:bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                                >
                                    <FileText size={15} />
                                    New Prescription
                                </button>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
