"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    FileText,
    Plus,
    Trash2,
    CheckCircle,
    MessageCircle,
    Download,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────────────── */

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface FormData {
    patientName: string;
    age: string;
    gender: string;
    complaints: string;
    vitals: string;
    diagnosis: string;
    medications: Medication[];
    advice: string;
    followUp: string;
}

const emptyForm: FormData = {
    patientName: "",
    age: "",
    gender: "",
    complaints: "",
    vitals: "",
    diagnosis: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    advice: "",
    followUp: "",
};

/* ── Shared Input Styles ─────────────────────────────────────────────── */

const inputCls =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/20 focus:border-[#4F46E5] transition-all bg-white";
const textareaCls = inputCls + " resize-none";

/* ── Helper: Field Wrapper ───────────────────────────────────────────── */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">{label}</label>
            {children}
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────────── */

export default function NewPrescriptionSheet({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const rxRef = useRef<HTMLDivElement>(null);

    // Reset success modal whenever the sheet opens fresh
    useEffect(() => {
        if (isOpen) setShowSuccessModal(false);
    }, [isOpen]);

    const handleClear = () => setFormData(emptyForm);

    const setField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
        setFormData((prev) => ({ ...prev, [key]: value }));

    const updateMed = (index: number, field: keyof Medication, value: string) => {
        const updated = formData.medications.map((m, i) =>
            i === index ? { ...m, [field]: value } : m
        );
        setField("medications", updated);
    };

    const addMed = () =>
        setField("medications", [
            ...formData.medications,
            { name: "", dosage: "", frequency: "", duration: "", instructions: "" },
        ]);

    const removeMed = (index: number) =>
        setField("medications", formData.medications.filter((_, i) => i !== index));

    const handleSubmit = () => {
        setActiveTab("preview");
        setShowSuccessModal(true);
    };

    const handleDownloadPdf = async () => {
        const { default: jsPDF } = await import("jspdf");
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const W = pdf.internal.pageSize.getWidth();
        let y = 20;

        const centered = (text: string, size = 11, style: "normal" | "bold" = "normal", color = "#111111") => {
            pdf.setFontSize(size);
            pdf.setFont("helvetica", style);
            pdf.setTextColor(color);
            pdf.text(text, W / 2, y, { align: "center" });
            y += size * 0.5 + 2;
        };

        const left = (text: string, size = 10, style: "normal" | "bold" = "normal") => {
            pdf.setFontSize(size);
            pdf.setFont("helvetica", style);
            pdf.setTextColor("#111111");
            const lines = pdf.splitTextToSize(text, W - 28);
            pdf.text(lines, 14, y);
            y += lines.length * (size * 0.4 + 2);
        };

        const divider = () => {
            pdf.setDrawColor("#e5e7eb");
            pdf.line(14, y, W - 14, y);
            y += 5;
        };

        // Doctor header
        centered("Dr. Rohan Mehta", 16, "bold");
        centered("Cardiologist • Reg No: NMC-78291", 10, "normal", "#6b7280");
        centered("CareConnect Health Platform", 9, "normal", "#9ca3af");
        y += 2;
        divider();

        // Patient row
        pdf.setFontSize(10); pdf.setFont("helvetica", "normal"); pdf.setTextColor("#111111");
        pdf.text(`Patient: ${formData.patientName || "—"}`, 14, y);
        pdf.text(`Date: ${today}`, W - 14, y, { align: "right" });
        y += 5;
        if (formData.age || formData.gender) {
            pdf.setTextColor("#6b7280"); pdf.setFontSize(9);
            pdf.text(
                `${formData.age ? `Age: ${formData.age}` : ""}${formData.age && formData.gender ? " • " : ""}${formData.gender}`,
                14, y
            );
            y += 5;
        }
        y += 2; divider();

        // Clinical details
        if (formData.complaints) { left(`Complaints: ${formData.complaints}`); y += 1; }
        if (formData.vitals) { left(`Vitals: ${formData.vitals}`); y += 1; }
        if (formData.diagnosis) { left(`Diagnosis: ${formData.diagnosis}`); y += 1; }
        if (formData.complaints || formData.vitals || formData.diagnosis) { y += 2; divider(); }

        // Rx symbol + medications
        pdf.setFontSize(20); pdf.setFont("times", "bold"); pdf.setTextColor("#9ca3af");
        pdf.text("Rx", 14, y); y += 8;
        formData.medications.forEach((med, i) => {
            if (!med.name) return;
            const parts = [
                `${i + 1}. ${med.name}`,
                med.dosage ? `— ${med.dosage}` : "",
                med.frequency || "",
                med.duration ? `for ${med.duration}` : "",
                med.instructions ? `(${med.instructions})` : "",
            ].filter(Boolean).join("  ");
            left(parts);
        });
        y += 3; divider();

        // Advice & follow-up
        if (formData.advice) { left(`Advice: ${formData.advice}`); y += 1; }
        if (formData.followUp) {
            const d = new Date(formData.followUp).toLocaleDateString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
            });
            left(`Follow-up: ${d}`);
        }

        const slug = formData.patientName.replace(/\s+/g, "_") || "prescription";
        pdf.save(`Rx_${slug}_${new Date().toISOString().slice(0, 10)}.pdf`);
    };

    const today = new Date().toLocaleDateString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ── */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* ── Slide-Over Panel ── */}
                    <motion.div
                        key="panel"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
                    >
                        {/* ── Panel Header ── */}
                        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[#4F46E5]/10 text-[#4F46E5] flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                <h2 className="text-base font-semibold text-gray-900">New Prescription</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* ── Tab Row + Clear Button ── */}
                        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white shrink-0">
                            <div className="inline-flex bg-gray-100 p-1 rounded-lg gap-1">
                                {(["edit", "preview"] as const).map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTab(t)}
                                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === t
                                                ? "bg-white shadow-sm text-gray-900"
                                                : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        {t === "edit" ? "Edit Form" : "Preview (Rx Paper)"}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={handleClear}
                                className="text-sm font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Trash2 size={15} />
                                Clear Form
                            </button>
                        </div>

                        {/* ── Scrollable Body ── */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 relative">
                            {activeTab === "edit" ? (
                                <>
                                    {/* Section 1 — Patient */}
                                    <section>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                            Patient Details
                                        </h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <Field label="Full Name">
                                                <input className={inputCls} placeholder="e.g. Sarah Johnson"
                                                    value={formData.patientName}
                                                    onChange={(e) => setField("patientName", e.target.value)} />
                                            </Field>
                                            <Field label="Age">
                                                <input className={inputCls} placeholder="e.g. 34" type="number"
                                                    value={formData.age}
                                                    onChange={(e) => setField("age", e.target.value)} />
                                            </Field>
                                            <Field label="Gender">
                                                <select className={inputCls} value={formData.gender}
                                                    onChange={(e) => setField("gender", e.target.value)}>
                                                    <option value="">Select</option>
                                                    <option>Male</option>
                                                    <option>Female</option>
                                                    <option>Other</option>
                                                </select>
                                            </Field>
                                        </div>
                                    </section>

                                    {/* Section 2 — Clinical */}
                                    <section>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                            Clinical Notes
                                        </h3>
                                        <div className="space-y-4">
                                            <Field label="Chief Complaints">
                                                <textarea className={textareaCls} rows={3}
                                                    placeholder="Describe the patient's main complaints..."
                                                    value={formData.complaints}
                                                    onChange={(e) => setField("complaints", e.target.value)} />
                                            </Field>
                                            <Field label="Diagnosis">
                                                <textarea className={textareaCls} rows={3}
                                                    placeholder="Primary and secondary diagnoses..."
                                                    value={formData.diagnosis}
                                                    onChange={(e) => setField("diagnosis", e.target.value)} />
                                            </Field>
                                            <Field label="Vitals (BP, Temp, Pulse)">
                                                <input className={inputCls}
                                                    placeholder="e.g. 120/80 mmHg, 98.6°F, 72 bpm"
                                                    value={formData.vitals}
                                                    onChange={(e) => setField("vitals", e.target.value)} />
                                            </Field>
                                        </div>
                                    </section>

                                    {/* Section 3 — Medications */}
                                    <section>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                            Medications
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                                            {/* Column Labels */}
                                            <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-3">
                                                {["Medicine Name", "Dosage", "Frequency", "Duration", ""].map((h, i) => (
                                                    <p key={i} className="text-xs font-medium text-gray-400">{h}</p>
                                                ))}
                                            </div>

                                            {/* Medication Rows */}
                                            {formData.medications.map((med, index) => (
                                                <div key={index} className="space-y-2">
                                                    {/* 4-col grid row */}
                                                    <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_auto] gap-3 items-center">
                                                        <input className={inputCls} placeholder="e.g. Amlodipine"
                                                            value={med.name}
                                                            onChange={(e) => updateMed(index, "name", e.target.value)} />
                                                        <input className={inputCls} placeholder="5mg"
                                                            value={med.dosage}
                                                            onChange={(e) => updateMed(index, "dosage", e.target.value)} />
                                                        <select className={inputCls} value={med.frequency}
                                                            onChange={(e) => updateMed(index, "frequency", e.target.value)}>
                                                            <option value="">Select</option>
                                                            <option>Once daily</option>
                                                            <option>Twice daily</option>
                                                            <option>Thrice daily</option>
                                                            <option>As needed</option>
                                                        </select>
                                                        <input className={inputCls} placeholder="7 days"
                                                            value={med.duration}
                                                            onChange={(e) => updateMed(index, "duration", e.target.value)} />
                                                        <button
                                                            onClick={() => removeMed(index)}
                                                            disabled={formData.medications.length === 1}
                                                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </div>
                                                    {/* Special Instructions — full width below */}
                                                    <input
                                                        className={inputCls}
                                                        placeholder="Special instructions (e.g., after meals, with warm water)"
                                                        value={med.instructions}
                                                        onChange={(e) => updateMed(index, "instructions", e.target.value)}
                                                    />
                                                </div>
                                            ))}

                                            <button onClick={addMed}
                                                className="flex items-center gap-2 text-sm text-[#4F46E5] hover:text-[#4338CA] font-medium cursor-pointer">
                                                <Plus size={15} />
                                                Add Medicine
                                            </button>
                                        </div>
                                    </section>

                                    {/* Section 4 — Advice */}
                                    <section>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                                            Advice & Follow-up
                                        </h3>
                                        <div className="space-y-4">
                                            <Field label="General Advice">
                                                <textarea className={textareaCls} rows={3}
                                                    placeholder="Dietary advice, lifestyle changes, precautions..."
                                                    value={formData.advice}
                                                    onChange={(e) => setField("advice", e.target.value)} />
                                            </Field>
                                            <Field label="Follow-up Date">
                                                <input className={inputCls} type="date"
                                                    value={formData.followUp}
                                                    onChange={(e) => setField("followUp", e.target.value)} />
                                            </Field>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                /* ── Preview: Rx Paper Pad ── */
                                <div ref={rxRef} className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 min-h-[500px] font-spline">
                                    {/* Doctor Header */}
                                    <div className="text-center border-b border-gray-200 pb-5 mb-5">
                                        <h3 className="text-lg font-bold text-gray-900">Dr. Rohan Mehta</h3>
                                        <p className="text-sm text-gray-500">Cardiologist • NMC-78291</p>
                                        <p className="text-xs text-gray-400 mt-0.5">CareConnect Health Platform</p>
                                    </div>

                                    {/* Patient Row */}
                                    <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5 text-sm">
                                        <div className="space-y-1">
                                            <p>
                                                <span className="font-semibold text-gray-700">Patient: </span>
                                                <span className="text-gray-900">{formData.patientName || "—"}</span>
                                            </p>
                                            <p className="text-gray-500">
                                                {formData.age && `Age: ${formData.age}`}
                                                {formData.age && formData.gender && " • "}
                                                {formData.gender}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400">Date: {today}</p>
                                    </div>

                                    {/* Clinical Details */}
                                    {(formData.complaints || formData.vitals || formData.diagnosis) && (
                                        <div className="space-y-3 mb-6 text-sm">
                                            {formData.complaints && (
                                                <p><span className="font-semibold text-gray-700">C/C: </span>
                                                    <span className="text-gray-600">{formData.complaints}</span></p>
                                            )}
                                            {formData.vitals && (
                                                <p><span className="font-semibold text-gray-700">Vitals: </span>
                                                    <span className="text-gray-600">{formData.vitals}</span></p>
                                            )}
                                            {formData.diagnosis && (
                                                <p><span className="font-semibold text-gray-700">Diagnosis: </span>
                                                    <span className="text-gray-600">{formData.diagnosis}</span></p>
                                            )}
                                        </div>
                                    )}

                                    {/* Rx Symbol */}
                                    <p className="text-2xl font-serif text-gray-400 mb-3">℞</p>

                                    {/* Medication List */}
                                    <ol className="space-y-2 mb-6">
                                        {formData.medications.map((med, i) =>
                                            med.name ? (
                                                <li key={i} className="text-sm text-gray-800">
                                                    <span className="font-semibold">{i + 1}. {med.name}</span>
                                                    {med.dosage && ` — ${med.dosage}`}
                                                    {med.frequency && <span className="text-gray-500"> • {med.frequency}</span>}
                                                    {med.duration && <span className="text-gray-500"> for {med.duration}</span>}
                                                    {med.instructions && <span className="text-gray-400 italic"> ({med.instructions})</span>}
                                                </li>
                                            ) : null
                                        )}
                                        {formData.medications.every((m) => !m.name) && (
                                            <li className="text-sm text-gray-400 italic">No medications added yet.</li>
                                        )}
                                    </ol>

                                    {/* Footer */}
                                    {(formData.advice || formData.followUp) && (
                                        <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                                            {formData.advice && (
                                                <p><span className="font-semibold text-gray-700">Advice: </span>
                                                    <span className="text-gray-600">{formData.advice}</span></p>
                                            )}
                                            {formData.followUp && (
                                                <p>
                                                    <span className="font-semibold text-gray-700">Follow-up: </span>
                                                    <span className="text-gray-600">
                                                        {new Date(formData.followUp).toLocaleDateString("en-IN", {
                                                            day: "2-digit", month: "short", year: "numeric",
                                                        })}
                                                    </span>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── Success Overlay ── */}
                            <AnimatePresence>
                                {showSuccessModal && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.95, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            className="bg-white border border-gray-200 shadow-xl rounded-2xl p-8 max-w-sm w-full text-center flex flex-col items-center"
                                        >
                                            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle size={32} />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900">Prescription Generated</h3>
                                            <p className="text-sm text-gray-500 mt-2 mb-8">
                                                The prescription has been securely saved to the patient&apos;s records.
                                            </p>

                                            <a
                                                href="https://wa.me/123456789"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 transition-all mb-3"
                                            >
                                                <MessageCircle size={20} />
                                                Share via WhatsApp
                                            </a>

                                            <button
                                                onClick={handleDownloadPdf}
                                                className="w-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                                            >
                                                <Download size={20} />
                                                Download PDF
                                            </button>

                                            <button
                                                onClick={() => setShowSuccessModal(false)}
                                                className="mt-4 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                                            >
                                                Back to Form
                                            </button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── Footer ── */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="px-5 py-2 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] text-white text-sm font-medium shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                            >
                                <FileText size={15} />
                                Generate Prescription
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
