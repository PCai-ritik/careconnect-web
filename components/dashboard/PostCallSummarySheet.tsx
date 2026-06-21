"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Activity, List, ClipboardList, Package, Calendar,
    FileText, Download, Loader2, CheckCircle, Languages
} from "lucide-react";
import { getPostCallSummary, type PostCallSummaryResponse } from "@/lib/dashboard";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

export default function PostCallSummarySheet({
    appointmentId,
    isOpen,
    onClose,
}: {
    appointmentId: string | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [summary, setSummary] = useState<PostCallSummaryResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showLocal, setShowLocal] = useState(false);

    useLockBodyScroll(isOpen);

    useEffect(() => {
        if (!isOpen || !appointmentId) {
            setSummary(null);
            setError(null);
            return;
        }

        let isMounted = true;
        setLoading(true);
        setError(null);

        getPostCallSummary(appointmentId)
            .then((res) => {
                if (isMounted) setSummary(res);
            })
            .catch((err) => {
                if (!isMounted) return;
                // If it's a 404, it might still be processing, though we only
                // show the button for COMPLETED appointments usually.
                if (err?.message?.includes("404")) {
                    setError("Summary not found. It may still be processing.");
                } else {
                    setError(err.message || "Failed to fetch summary.");
                }
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => { isMounted = false; };
    }, [isOpen, appointmentId]);

    // Parse the bilingual summary JSON
    const bilingualData = (() => {
        if (!summary?.summary) return null;
        try {
            return JSON.parse(summary.summary);
        } catch {
            return null;
        }
    })();

    const getBilingualField = (fieldPath: string, fallback: string | null) => {
        if (!bilingualData) return fallback;
        const field = fieldPath.split('.').reduce((obj: any, key) => obj?.[key], bilingualData);
        if (!field) return fallback;
        if (typeof field === 'string') return field;
        return showLocal ? (field.local_language || field.english || fallback) : (field.english || fallback);
    };

    const getBilingualArray = (fieldPath: string, fallback: string[] | null) => {
        if (!bilingualData) return fallback;
        const field = fieldPath.split('.').reduce((obj: any, key) => obj?.[key], bilingualData);
        if (!field) return fallback;
        if (Array.isArray(field)) return field;
        return showLocal ? (field.local_language || field.english || fallback) : (field.english || fallback);
    };

    if (!isOpen) return null;

    const diagnosis = summary ? getBilingualField('diagnosis', summary.diagnosis) : null;
    const treatmentPlan = summary ? getBilingualField('treatment_plan', summary.treatment_plan) : null;
    const followUp = summary ? getBilingualField('next_steps', summary.follow_up) : null;
    const symptoms = summary ? getBilingualArray('symptoms', summary.symptoms) : null;
    const prescriptions = summary?.prescriptions || [];
    const doctorNotes = summary?.doctor_notes || null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="ps-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        key="ps-panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-start justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                    <CheckCircle size={24} className="text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900">Post-Call Summary</h2>
                                    <p className="text-xs text-gray-500 mt-0.5">AI-generated from consultation</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                    <Loader2 size={24} className="animate-spin text-[var(--brand-primary)]" />
                                    <p className="text-sm">Loading summary...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-3">
                                    <FileText size={32} className="text-gray-300" />
                                    <p className="text-sm">{error}</p>
                                </div>
                            ) : summary ? (
                                <div className="space-y-6">
                                    {bilingualData && (
                                        <div className="flex items-center justify-end mb-2">
                                            <div className="bg-gray-100 p-1 rounded-lg inline-flex items-center">
                                                <button
                                                    onClick={() => setShowLocal(false)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!showLocal ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                                                >
                                                    English
                                                </button>
                                                <button
                                                    onClick={() => setShowLocal(true)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${showLocal ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                                                >
                                                    हिंदी
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {diagnosis && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Activity size={16} className="text-[var(--brand-primary)]" />
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Diagnosis</h3>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <p className="text-sm text-gray-700 leading-relaxed">{diagnosis}</p>
                                            </div>
                                        </div>
                                    )}

                                    {symptoms && symptoms.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <List size={16} className="text-[var(--brand-primary)]" />
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Symptoms</h3>
                                            </div>
                                            <ul className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                                {symptoms.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-1.5 shrink-0" />
                                                        <span className="leading-relaxed">{s}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {treatmentPlan && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <ClipboardList size={16} className="text-[var(--brand-primary)]" />
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Treatment Plan</h3>
                                            </div>
                                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                                <p className="text-sm text-gray-700 leading-relaxed">{treatmentPlan}</p>
                                            </div>
                                        </div>
                                    )}

                                    {prescriptions.length > 0 && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Package size={16} className="text-[var(--brand-primary)]" />
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Prescriptions</h3>
                                            </div>
                                            <ul className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                                {prescriptions.map((p: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-1.5 shrink-0" />
                                                        <span className="leading-relaxed">{p}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {followUp && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar size={16} className="text-amber-500" />
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Follow-Up</h3>
                                            </div>
                                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                                                <p className="text-sm text-amber-800 font-medium leading-relaxed">{followUp}</p>
                                            </div>
                                        </div>
                                    )}

                                    {doctorNotes && (
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText size={16} className="text-[var(--brand-primary)]" />
                                                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Doctor's Notes</h3>
                                            </div>
                                            <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{doctorNotes}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="p-5 border-t border-gray-200 bg-gray-50 shrink-0">
                            <button
                                disabled={!summary}
                                className={`w-full py-2.5 rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 text-sm ${
                                    !summary
                                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                }`}
                                onClick={() => alert("Downloading PDF... (Stub)")}
                            >
                                <Download size={16} />
                                Download PDF
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
