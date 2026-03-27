"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    X, FileText, User, Package, ChevronDown, ChevronRight,
    Heart, Activity, Thermometer, TrendingUp, AlertCircle,
    Phone, MapPin, Droplets, Calendar, Clock, Video,
} from "lucide-react";

/* ── Types (matching mobile 1:1) ────────────────────────────────────── */

interface ConsultationRecord {
    id: string;
    date: string;
    diagnosis: string;
    symptoms: string;
    treatment: string;
    prescriptions: string[];
    followUp: string | null;
    vitals: { bp: string; pulse: string; temp: string; weight: string };
}

/* ── Mock Data (same as mobile mock) ────────────────────────────────── */

const MOCK_PROFILE = {
    phone: "+91 98765 43210",
    dateOfBirth: "Mar 15, 1990",
    gender: "Female",
    bloodGroup: "B+",
    address: "42 Residency Rd, Bengaluru",
    allergies: ["Penicillin", "Sulfa Drugs"],
    existingConditions: ["Hypertension", "Mild Asthma"],
    emergencyContact: { name: "Vikram Gupta", phone: "+91 98765 43211" },
};

const MOCK_CONSULTATIONS: ConsultationRecord[] = [
    {
        id: "1", date: "Jan 10, 2026", diagnosis: "Upper Respiratory Infection",
        symptoms: "Persistent cough, sore throat, mild fever (99.5°F)",
        treatment: "Prescribed antibiotics course, rest advised, increased fluid intake",
        prescriptions: ["Amoxicillin 500mg — 3× daily for 7 days", "Acetaminophen 500mg — as needed", "Cough syrup — 10ml twice daily"],
        followUp: "Jan 17, 2026",
        vitals: { bp: "120/80", pulse: "78 bpm", temp: "99.5°F", weight: "72 kg" },
    },
    {
        id: "2", date: "Dec 15, 2025", diagnosis: "Annual Health Checkup — All Clear",
        symptoms: "Routine examination, no complaints",
        treatment: "Continue current lifestyle, recommended vitamin D supplements",
        prescriptions: ["Vitamin D3 60K — Once weekly for 8 weeks"],
        followUp: null,
        vitals: { bp: "118/76", pulse: "72 bpm", temp: "98.6°F", weight: "71 kg" },
    },
    {
        id: "3", date: "Nov 05, 2025", diagnosis: "Migraine with Aura",
        symptoms: "Severe headache, light sensitivity, nausea, visual disturbances",
        treatment: "Prescribed migraine-specific medication, lifestyle modifications advised",
        prescriptions: ["Sumatriptan 50mg — as needed", "Metoclopramide 10mg — for nausea"],
        followUp: "Dec 05, 2025",
        vitals: { bp: "125/82", pulse: "80 bpm", temp: "98.4°F", weight: "71 kg" },
    },
    {
        id: "4", date: "Sep 20, 2025", diagnosis: "Seasonal Allergies",
        symptoms: "Sneezing, runny nose, itchy eyes",
        treatment: "Antihistamine medication, nasal spray",
        prescriptions: ["Cetirizine 10mg — once daily for 14 days", "Fluticasone nasal spray — twice daily"],
        followUp: null,
        vitals: { bp: "120/78", pulse: "74 bpm", temp: "98.6°F", weight: "70 kg" },
    },
];

/* ── Avatar color (same hash as mobile) ─────────────────────────────── */

const AVATAR_COLORS = ["#C7D2FE", "#A5B4FC", "#BAE6FD", "#99F6E4", "#D9F99D", "#FDE68A", "#FECACA", "#DDD6FE"];
function avatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

/* ── Tab config ──────────────────────────────────────────────────────── */

type TabId = "history" | "profile" | "medications";
const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
    { id: "history", label: "History", Icon: FileText },
    { id: "profile", label: "Profile", Icon: User },
    { id: "medications", label: "Medications", Icon: Package },
];

/* ── History Tab ─────────────────────────────────────────────────────── */

function HistoryTab() {
    const [openId, setOpenId] = useState<string | null>(null);
    return (
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Past Consultations ({MOCK_CONSULTATIONS.length})
            </p>
            <div className="space-y-2">
                {MOCK_CONSULTATIONS.map((c) => {
                    const isOpen = openId === c.id;
                    return (
                        <div key={c.id} className="rounded-xl border border-gray-200 overflow-hidden">
                            {/* Accordion header */}
                            <button
                                onClick={() => setOpenId(isOpen ? null : c.id)}
                                className={`w-full flex items-center justify-between p-4 text-left transition-colors cursor-pointer ${isOpen ? "bg-[#4F46E5]/8 border-b border-[#4F46E5]/15" : "hover:bg-gray-50"}`}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{c.diagnosis}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{c.date}</p>
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
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 mb-2">Vitals</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { Icon: Heart, color: "text-red-500", label: `BP: ${c.vitals.bp}` },
                                                        { Icon: Activity, color: "text-pink-500", label: `Pulse: ${c.vitals.pulse}` },
                                                        { Icon: Thermometer, color: "text-orange-500", label: `Temp: ${c.vitals.temp}` },
                                                        { Icon: TrendingUp, color: "text-blue-500", label: `Weight: ${c.vitals.weight}` },
                                                    ].map(({ Icon, color, label }) => (
                                                        <div key={label} className="flex items-center gap-1.5 text-sm text-gray-700">
                                                            <Icon size={13} className={color} />
                                                            {label}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="h-px bg-gray-100" />

                                            {/* Symptoms */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 mb-1">Symptoms</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{c.symptoms}</p>
                                            </div>

                                            {/* Treatment */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 mb-1">Treatment</p>
                                                <p className="text-sm text-gray-700 leading-relaxed">{c.treatment}</p>
                                            </div>

                                            {/* Prescriptions */}
                                            <div>
                                                <p className="text-xs font-medium text-gray-400 mb-2">Prescriptions</p>
                                                <div className="space-y-1.5">
                                                    {c.prescriptions.map((rx, i) => (
                                                        <div key={i} className="flex items-start gap-2">
                                                            <Package size={13} className="text-indigo-500 mt-0.5 shrink-0" />
                                                            <p className="text-sm text-gray-700">{rx}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Follow-up */}
                                            {c.followUp && (
                                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg p-3">
                                                    <Clock size={13} className="text-amber-600 shrink-0" />
                                                    <p className="text-sm text-amber-700 font-medium">
                                                        Follow-up: {c.followUp}
                                                    </p>
                                                </div>
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

function ProfileTab({ patientName }: { patientName: string }) {
    const p = MOCK_PROFILE;
    return (
        <div className="space-y-6">
            {/* Personal information */}
            <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</p>
                <div className="space-y-3">
                    {[
                        { Icon: User, label: "Full Name", value: patientName },
                        { Icon: Calendar, label: "Date of Birth", value: p.dateOfBirth },
                        { Icon: Phone, label: "Phone", value: p.phone },
                        { Icon: MapPin, label: "Address", value: p.address },
                        { Icon: Droplets, label: "Blood Group", value: p.bloodGroup },
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
                    {p.allergies.length > 0 ? p.allergies.map((a) => (
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
                    {p.existingConditions.length > 0 ? p.existingConditions.map((c) => (
                        <span key={c} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-full font-medium">{c}</span>
                    )) : <span className="text-sm text-gray-400">No existing conditions</span>}
                </div>
            </div>

            {/* Emergency contact */}
            <div>
                <p className="text-sm font-semibold text-gray-800 mb-2">Emergency Contact</p>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-3">
                    <p className="text-sm font-medium text-gray-900">{p.emergencyContact.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{p.emergencyContact.phone}</p>
                </div>
            </div>
        </div>
    );
}

/* ── Medications Tab ─────────────────────────────────────────────────── */

function MedicationsTab() {
    const allMeds = MOCK_CONSULTATIONS.flatMap((c) =>
        c.prescriptions.map((rx) => ({ rx, date: c.date, diagnosis: c.diagnosis }))
    );
    return (
        <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Current & Past Medications
            </p>
            <div className="space-y-2">
                {allMeds.map(({ rx, date, diagnosis }, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl">
                        <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                            <Package size={15} className="text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">{rx}</p>
                            <p className="text-xs text-gray-400 mt-0.5">Prescribed {date} · {diagnosis}</p>
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
    patient: { id: string; name: string; condition?: string } | null;
    isOpen: boolean;
    onClose: () => void;
    onNewPrescription?: () => void;
}) {
    const [activeTab, setActiveTab] = useState<TabId>("history");
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
                                <div className="w-14 h-14 rounded-full bg-[#4F46E5] flex items-center justify-center shrink-0">
                                    <User size={28} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">{patient.name}</h2>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        ID: #{patient.id} • {patient.condition ?? "General Consultation"}
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
                                        ? "border-[#4F46E5] text-[#4F46E5]"
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
                            {activeTab === "history" && <HistoryTab />}
                            {activeTab === "profile" && <ProfileTab patientName={patient.name} />}
                            {activeTab === "medications" && <MedicationsTab />}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 bg-white flex flex-col gap-3 shrink-0">
                            {/* Start Video Call */}
                            <Link
                                href={`/consultation/${patient.id}`}
                                onClick={onClose}
                                className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white py-3 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm"
                            >
                                <Video size={16} />
                                Start Video Consultation
                            </Link>

                            {/* New Prescription */}
                            {onNewPrescription && (
                                <button
                                    onClick={() => { onClose(); onNewPrescription(); }}
                                    className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                                >
                                    <FileText size={15} />
                                    New Prescription
                                </button>
                            )}

                            {/* View full history */}
                            <button
                                onClick={() => setActiveTab("history")}
                                className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer py-1"
                            >
                                View Full Medical History
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
