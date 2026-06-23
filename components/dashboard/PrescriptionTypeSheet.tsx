"use client";

/**
 * CareConnect — Prescription Type Selector Sheet (Web)
 *
 * Slide-over panel that opens before NewPrescriptionSheet, letting the doctor
 * choose between:
 *   1. Independent Prescription — no patient binding (walk-in / unnamed)
 *   2. Prescription for a Patient — picks from the doctor's patient directory
 *
 * Follows the same AnimatePresence / spring slide-over pattern as
 * AddPatientSheet and NewPrescriptionSheet.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Users, ArrowLeft, Search, ChevronRight } from "lucide-react";
import { getPatients, type PatientResponse } from "@/lib/dashboard";
import { type PrescriptionPatient } from "./NewPrescriptionSheet";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

// ─── Types ────────────────────────────────────────────────────────────────────

type SheetView = "select" | "patients";

interface PrescriptionTypeSheetProps {
    isOpen: boolean;
    onClose: () => void;
    onIndependentPrescription: () => void;
    onPatientPrescription: (patient: PrescriptionPatient) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
    "#C7D2FE", "#A5B4FC", "#BAE6FD", "#99F6E4",
    "#D9F99D", "#FDE68A", "#FECACA", "#DDD6FE",
];

function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function calcAge(dob: string | null | undefined): number | null {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? age : null;
}

function toPatient(p: PatientResponse): PrescriptionPatient {
    return {
        id: p.id,
        name: p.full_name,
        condition: p.existing_conditions?.[0] || undefined,
        dateOfBirth: p.date_of_birth,
        gender: p.gender,
        whatsappNumber: p.whatsapp_number || undefined,
    };
}

// ─── Patient Row ──────────────────────────────────────────────────────────────

function PatientRow({
    patient,
    onSelect,
}: {
    patient: PatientResponse;
    onSelect: () => void;
}) {
    const age = calcAge(patient.date_of_birth);
    const condition = patient.existing_conditions?.join(", ") || "—";
    const avatarBg = getAvatarColor(patient.full_name);

    return (
        <button
            type="button"
            onClick={onSelect}
            className="w-full flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
        >
            {/* Avatar */}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold text-gray-700"
                style={{ backgroundColor: avatarBg }}
            >
                {patient.full_name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{patient.full_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                    {age ? `Age ${age}` : ""}
                    {age && patient.gender ? "  ·  " : ""}
                    {patient.gender ?? ""}
                </p>
                {condition !== "—" && (
                    <p className="text-xs text-[var(--brand-primary)] font-medium mt-0.5 truncate">{condition}</p>
                )}
            </div>

            <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PrescriptionTypeSheet({
    isOpen,
    onClose,
    onIndependentPrescription,
    onPatientPrescription,
}: PrescriptionTypeSheetProps) {
    const [view, setView] = useState<SheetView>("select");
    const [patients, setPatients] = useState<PatientResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetched, setFetched] = useState(false);
    const [search, setSearch] = useState("");

    useLockBodyScroll(isOpen);

    // Reset to select view when sheet opens or closes
    useEffect(() => {
        if (!isOpen) {
            setView("select");
            setSearch("");
        }
    }, [isOpen]);

    const fetchPatients = async () => {
        if (fetched) return;
        setLoading(true);
        try {
            const data = await getPatients();
            setPatients(data);
            setFetched(true);
        } catch {
            // Silently fail — list stays empty
        } finally {
            setLoading(false);
        }
    };

    const handlePatientView = () => {
        setView("patients");
        fetchPatients();
    };

    const filtered = useMemo(() => {
        if (!search.trim()) return patients;
        const q = search.toLowerCase();
        return patients.filter(
            (p) =>
                p.full_name.toLowerCase().includes(q) ||
                (p.existing_conditions?.some((c) => c.toLowerCase().includes(q)) ?? false),
        );
    }, [search, patients]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="pts-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* ── Panel ── */}
                    <motion.div
                        key="pts-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* ── Panel Header ── */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center gap-3 shrink-0">
                            {view === "patients" && (
                                <button
                                    type="button"
                                    onClick={() => setView("select")}
                                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer -ml-1 mr-1"
                                >
                                    <ArrowLeft size={18} />
                                </button>
                            )}
                            <div
                                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: "var(--brand-primary)" }}
                            >
                                <FileText size={18} className="text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-base font-semibold text-gray-900">
                                    {view === "select" ? "New Prescription" : "Select Patient"}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {view === "select"
                                        ? "Choose how you'd like to write this prescription."
                                        : "Pick a patient from your directory."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Select View ── */}
                        {view === "select" && (
                            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                {/* Card: Independent */}
                                <button
                                    type="button"
                                    onClick={onIndependentPrescription}
                                    className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-all text-left group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                                        <FileText size={22} className="text-[var(--brand-primary)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">Independent Prescription</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Write a prescription without linking it to a patient file. Ideal for walk-ins or one-time visits.
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[var(--brand-primary)] transition-colors shrink-0" />
                                </button>

                                {/* Card: For a Patient */}
                                <button
                                    type="button"
                                    onClick={handlePatientView}
                                    className="flex items-center gap-4 p-5 rounded-2xl border border-gray-200 hover:border-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/5 transition-all text-left group cursor-pointer"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center shrink-0 group-hover:bg-[var(--brand-primary)]/20 transition-colors">
                                        <Users size={22} className="text-[var(--brand-primary)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">Prescription for a Patient</p>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            Link to an existing patient in your directory. The prescription is saved to their medical history.
                                        </p>
                                    </div>
                                    <ChevronRight size={18} className="text-gray-300 group-hover:text-[var(--brand-primary)] transition-colors shrink-0" />
                                </button>
                            </div>
                        )}

                        {/* ── Patient List View ── */}
                        {view === "patients" && (
                            <div className="flex-1 flex flex-col min-h-0">
                                {/* Search */}
                                <div className="px-6 py-3 border-b border-gray-100 shrink-0">
                                    <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
                                        <Search size={15} className="text-gray-400 shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Search by name or condition…"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder-gray-400"
                                            autoFocus
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                onClick={() => setSearch("")}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <X size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* List */}
                                <div className="flex-1 overflow-y-auto">
                                    {loading ? (
                                        <div className="flex items-center justify-center py-20">
                                            <div className="w-8 h-8 border-2 border-[var(--brand-primary)] border-t-transparent rounded-full animate-spin" />
                                        </div>
                                    ) : filtered.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                            <Users size={36} className="text-gray-300 mb-3" />
                                            <p className="text-sm font-medium text-gray-500">
                                                {patients.length === 0
                                                    ? "No patients in your directory yet."
                                                    : "No patients match your search."}
                                            </p>
                                        </div>
                                    ) : (
                                        filtered.map((p) => (
                                            <PatientRow
                                                key={p.id}
                                                patient={p}
                                                onSelect={() => onPatientPrescription(toPatient(p))}
                                            />
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
