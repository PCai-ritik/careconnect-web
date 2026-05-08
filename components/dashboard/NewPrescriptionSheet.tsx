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
    Printer,
    Lock,
    Loader2,
    ChevronUp,
    ChevronDown,
    Clock,
    CalendarCheck,
    AlertCircle,
} from "lucide-react";
import {
    getDoctorProfile,
    createAppointment,
    getAvailableSlots,
    type DoctorProfile,
    type AvailableSlot,
} from "@/lib/dashboard";
import { getMe } from "@/lib/auth";

/* ── Types ───────────────────────────────────────────────────────────── */

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface Vitals {
    bp: string;
    pulse: string;
    temp: string;
    weight: string;
}

interface FormData {
    patientName: string;
    age: string;
    gender: string;
    complaints: string;
    vitals: Vitals;
    diagnosis: string;
    medications: Medication[];
    advice: string;
    followUp: string;
    followUpTime: string;
}

/** When opened from a patient sheet, pass patient info to lock the form */
export interface PrescriptionPatient {
    id: string;
    name: string;
    condition?: string;
    whatsappNumber?: string;
    dateOfBirth?: string | null;
    gender?: string | null;
}

const emptyVitals: Vitals = { bp: "", pulse: "", temp: "", weight: "" };

const emptyForm: FormData = {
    patientName: "",
    age: "",
    gender: "",
    complaints: "",
    vitals: { ...emptyVitals },
    diagnosis: "",
    medications: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    advice: "",
    followUp: "",
    followUpTime: "09:00",
};

/* ── Time Picker Component ───────────────────────────────────────────── */

function TimePicker({
    value,
    onChange,
}: {
    value: string;
    onChange: (val: string) => void;
}) {
    const [hours, minutes] = value.split(":").map(Number);

    const pad = (n: number) => String(n).padStart(2, "0");

    const setH = (h: number) => {
        const clamped = ((h % 24) + 24) % 24;
        onChange(`${pad(clamped)}:${pad(minutes)}`);
    };

    const setM = (m: number) => {
        const clamped = ((m % 60) + 60) % 60;
        onChange(`${pad(hours)}:${pad(clamped)}`);
    };

    const spinnerBtn =
        "w-8 h-7 flex items-center justify-center text-gray-400 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 rounded transition-colors cursor-pointer";

    return (
        <div className="flex items-center gap-1">
            {/* Hours */}
            <div className="flex flex-col items-center">
                <button type="button" className={spinnerBtn} onClick={() => setH(hours + 1)}>
                    <ChevronUp size={14} />
                </button>
                <input
                    type="text"
                    className="w-10 text-center text-sm font-mono border border-gray-200 rounded-md py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]"
                    value={pad(hours)}
                    onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 0 && v <= 23) setH(v);
                    }}
                    maxLength={2}
                />
                <button type="button" className={spinnerBtn} onClick={() => setH(hours - 1)}>
                    <ChevronDown size={14} />
                </button>
            </div>

            <span className="text-lg font-bold text-gray-400 pb-0.5">:</span>

            {/* Minutes */}
            <div className="flex flex-col items-center">
                <button type="button" className={spinnerBtn} onClick={() => setM(minutes + 1)}>
                    <ChevronUp size={14} />
                </button>
                <input
                    type="text"
                    className="w-10 text-center text-sm font-mono border border-gray-200 rounded-md py-1.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)]"
                    value={pad(minutes)}
                    onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 0 && v <= 59) setM(v);
                    }}
                    maxLength={2}
                />
                <button type="button" className={spinnerBtn} onClick={() => setM(minutes - 1)}>
                    <ChevronDown size={14} />
                </button>
            </div>

            <span className="text-xs text-gray-400 ml-1">hrs</span>
        </div>
    );
}

/* ── Slot Picker Modal ───────────────────────────────────────────────── */

function SlotPickerModal({
    date,
    slots,
    onSelect,
    onSkip,
    loading,
}: {
    date: string;
    slots: AvailableSlot[];
    onSelect: (slot: AvailableSlot) => void;
    onSkip: () => void;
    loading: boolean;
}) {
    const [selected, setSelected] = useState<string | null>(null);

    const fmtDate = new Date(date).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "2-digit",
        month: "short",
        year: "numeric",
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6"
        >
            <motion.div
                initial={{ scale: 0.95, y: 10 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white border border-gray-200 shadow-xl rounded-2xl p-6 max-w-md w-full"
            >
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <AlertCircle size={20} />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Time Slot Unavailable</h3>
                        <p className="text-xs text-gray-400">The selected time is already booked</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-lg px-3 py-2 my-4 text-sm text-gray-600">
                    <CalendarCheck size={14} className="inline mr-1.5 text-gray-400" />
                    {fmtDate}
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-8 text-gray-400 gap-2">
                        <Loader2 size={16} className="animate-spin" /> Loading available slots…
                    </div>
                ) : slots.length === 0 ? (
                    <div className="text-center py-8">
                        <Clock size={28} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">No available slots on this day.</p>
                        <p className="text-xs text-gray-300 mt-1">Try a different date on the form.</p>
                    </div>
                ) : (
                    <>
                        <p className="text-xs font-medium text-gray-500 mb-2">Available Slots</p>
                        <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                            {slots.map((slot) => (
                                <button
                                    key={slot.start_time}
                                    type="button"
                                    onClick={() => setSelected(slot.start_time)}
                                    className={`px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
                                        selected === slot.start_time
                                            ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                                            : "bg-white text-gray-700 border-gray-200 hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-primary)]/5"
                                    }`}
                                >
                                    {slot.start_time}
                                </button>
                            ))}
                        </div>
                    </>
                )}

                <div className="flex gap-2 mt-5">
                    <button
                        type="button"
                        onClick={onSkip}
                        className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        Skip
                    </button>
                    {slots.length > 0 && (
                        <button
                            type="button"
                            disabled={!selected}
                            onClick={() => {
                                const slot = slots.find((s) => s.start_time === selected);
                                if (slot) onSelect(slot);
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                                selected
                                    ? "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white shadow-sm"
                                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                            }`}
                        >
                            <CalendarCheck size={14} />
                            Book Follow-Up
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

/* ── Shared Input Styles ─────────────────────────────────────────────── */

const inputCls =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all bg-white";
const textareaCls = inputCls + " resize-none";
const lockedCls =
    "w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-900 bg-gray-50 cursor-not-allowed";

/* ── Helper: Field Wrapper ───────────────────────────────────────────── */

function Field({ label, locked, children }: { label: string; locked?: boolean; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                {label}
                {locked && <Lock size={10} className="text-gray-400" />}
            </label>
            {children}
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────────── */

export default function NewPrescriptionSheet({
    isOpen,
    onClose,
    patient,
    onPrescriptionCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    patient?: PrescriptionPatient | null;
    onPrescriptionCreated?: () => void;
}) {
    const [formData, setFormData] = useState<FormData>(emptyForm);
    const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
    const [showSlotPicker, setShowSlotPicker] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [followUpBooked, setFollowUpBooked] = useState(false);
    const rxRef = useRef<HTMLDivElement>(null);

    const isPatientLocked = !!patient;

    // Fetch doctor profile once
    useEffect(() => {
        getDoctorProfile().then(setDoctorProfile).catch(() => { });
    }, []);

    // Reset everything when sheet opens/closes
    useEffect(() => {
        if (isOpen) {
            setShowSuccessModal(false);
            setActiveTab("edit");
            setIsSaving(false);
            setFormData(emptyForm);
            setShowSlotPicker(false);
            setAvailableSlots([]);
            setFollowUpBooked(false);
        }
    }, [isOpen]);

    // Pre-fill patient info when patient data becomes available
    useEffect(() => {
        if (isOpen && patient) {
            let age = "";
            if (patient.dateOfBirth) {
                const dob = new Date(patient.dateOfBirth);
                age = String(Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)));
            }
            setFormData((prev) => ({
                ...prev,
                patientName: patient.name,
                age: age || prev.age,
                gender: patient.gender || prev.gender,
            }));
        }
    }, [isOpen, patient]);

    const doctorName = doctorProfile?.full_name || "Doctor";
    const doctorSpec = doctorProfile?.specialization || "";
    const doctorLicense = doctorProfile?.license_number || "";
    const doctorLabel = [doctorSpec, doctorLicense ? `Reg No: ${doctorLicense}` : ""].filter(Boolean).join(" • ");

    const handleClear = () => setFormData(patient ? { ...emptyForm, patientName: patient.name, age: formData.age, gender: formData.gender } : emptyForm);

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

    const handleSubmit = async () => {
        if (!formData.diagnosis.trim()) return;

        // If locked to a patient, save to the backend
        if (isPatientLocked && patient && doctorProfile) {
            setIsSaving(true);
            try {
                const { apiRequest } = await import("@/lib/api");
                await apiRequest({
                    method: "POST",
                    path: "/medical-records",
                    body: {
                        patient_id: patient.id,
                        doctor_id: doctorProfile.id,
                        diagnosis: formData.diagnosis,
                        symptoms: formData.complaints || null,
                        treatment: formData.advice || null,
                        follow_up_date: formData.followUp || null,
                        vitals: (formData.vitals.bp || formData.vitals.pulse || formData.vitals.temp || formData.vitals.weight)
                            ? formData.vitals : null,
                        prescriptions: formData.medications
                            .filter(m => m.name.trim())
                            .map(m => ({
                                medication_name: m.name,
                                dosage: m.dosage || null,
                                frequency: m.frequency || null,
                                duration: m.duration || null,
                                notes: m.instructions || null,
                            })),
                    },
                });

                // ── Follow-up appointment creation ──
                if (formData.followUp && formData.followUpTime) {
                    try {
                        const me = await getMe();
                        const hospitalId = me?.hospital_id;
                        if (hospitalId) {
                            const scheduledTime = new Date(
                                `${formData.followUp}T${formData.followUpTime}:00`
                            ).toISOString();

                            await createAppointment({
                                doctor_id: doctorProfile.id,
                                patient_id: patient.id,
                                hospital_id: hospitalId,
                                scheduled_time: scheduledTime,
                                duration_minutes: 15,
                                appointment_type: "FOLLOW_UP",
                                reason: `Follow-up: ${formData.diagnosis}`,
                            });
                            setFollowUpBooked(true);
                        }
                    } catch (followUpErr: any) {
                        // 409 = slot conflict → show slot picker
                        if (followUpErr?.status === 409) {
                            setSlotsLoading(true);
                            setShowSlotPicker(true);
                            try {
                                const slots = await getAvailableSlots(
                                    doctorProfile.id,
                                    formData.followUp
                                );
                                setAvailableSlots(slots);
                            } catch {
                                setAvailableSlots([]);
                            } finally {
                                setSlotsLoading(false);
                            }
                            setIsSaving(false);
                            // Don't proceed to success — wait for slot pick
                            return;
                        }
                        // Other errors — still proceed (prescription was saved)
                        console.error("Follow-up booking failed:", followUpErr);
                    }
                }

                onPrescriptionCreated?.();
            } catch {
                // Still show success for local PDF/WhatsApp workflow
            } finally {
                setIsSaving(false);
            }
        }

        setActiveTab("preview");
        setShowSuccessModal(true);
    };

    // ── Handle slot pick from the conflict picker ──
    const handleSlotPick = async (slot: AvailableSlot) => {
        if (!patient || !doctorProfile) return;
        setIsSaving(true);
        try {
            const me = await getMe();
            const hospitalId = me?.hospital_id;
            if (!hospitalId) return;

            const scheduledTime = new Date(
                `${formData.followUp}T${slot.start_time}:00`
            ).toISOString();

            await createAppointment({
                doctor_id: doctorProfile.id,
                patient_id: patient.id,
                hospital_id: hospitalId,
                scheduled_time: scheduledTime,
                duration_minutes: 15,
                appointment_type: "FOLLOW_UP",
                reason: `Follow-up: ${formData.diagnosis}`,
            });
            setFollowUpBooked(true);
        } catch (e) {
            console.error("Failed to book follow-up:", e);
        } finally {
            setIsSaving(false);
            setShowSlotPicker(false);
            setActiveTab("preview");
            setShowSuccessModal(true);
            onPrescriptionCreated?.();
        }
    };

    // ── Build prescription text summary (shared for WhatsApp + PDF) ──
    const buildTextSummary = (): string => {
        const lines: string[] = [];
        lines.push(`*Prescription — Dr. ${doctorName}*`);
        if (doctorLabel) lines.push(doctorLabel);
        lines.push(`Date: ${today}`);
        lines.push("");
        lines.push(`Patient: ${formData.patientName || "—"}`);
        if (formData.age || formData.gender) {
            lines.push([formData.age ? `Age: ${formData.age}` : "", formData.gender].filter(Boolean).join(" • "));
        }
        lines.push("");
        if (formData.complaints) lines.push(`Complaints: ${formData.complaints}`);
        if (formData.diagnosis) lines.push(`Diagnosis: ${formData.diagnosis}`);
        const vParts = [
            formData.vitals.bp && `BP: ${formData.vitals.bp}`,
            formData.vitals.pulse && `Pulse: ${formData.vitals.pulse}`,
            formData.vitals.temp && `Temp: ${formData.vitals.temp}`,
            formData.vitals.weight && `Weight: ${formData.vitals.weight}`,
        ].filter(Boolean);
        if (vParts.length) lines.push(`Vitals: ${vParts.join(" | ")}`);
        lines.push("");
        lines.push("*Medications:*");
        formData.medications.forEach((med, i) => {
            if (!med.name) return;
            const parts = [
                `${i + 1}. ${med.name}`,
                med.dosage ? `— ${med.dosage}` : "",
                med.frequency || "",
                med.duration ? `for ${med.duration}` : "",
                med.instructions ? `(${med.instructions})` : "",
            ].filter(Boolean).join("  ");
            lines.push(parts);
        });
        if (formData.advice) { lines.push(""); lines.push(`Advice: ${formData.advice}`); }
        if (formData.followUp) {
            const d = new Date(formData.followUp).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
            lines.push(`Follow-up: ${d}`);
        }
        return lines.join("\n");
    };

    const handleWhatsApp = () => {
        const text = encodeURIComponent(buildTextSummary());
        const phone = patient?.whatsappNumber?.replace(/[^0-9]/g, '') || '';
        const url = phone
            ? `https://wa.me/${phone}?text=${text}`
            : `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
    };

    const handlePrintPdf = () => {
        if (rxRef.current) {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            printWindow.document.write(`
                <html><head><title>Prescription — ${formData.patientName || 'Patient'}</title>
                <style>body{font-family:system-ui,sans-serif;padding:40px;color:#111}h3{margin:0}p{margin:4px 0}
                .sep{border-top:1px solid #e5e7eb;margin:12px 0}</style></head>
                <body>${rxRef.current.innerHTML}</body></html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
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
        centered(`Dr. ${doctorName}`, 16, "bold");
        if (doctorLabel) centered(doctorLabel, 10, "normal", "#6b7280");
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
        const vitalsPdf = [
            formData.vitals.bp && `BP: ${formData.vitals.bp}`,
            formData.vitals.pulse && `Pulse: ${formData.vitals.pulse}`,
            formData.vitals.temp && `Temp: ${formData.vitals.temp}`,
            formData.vitals.weight && `Weight: ${formData.vitals.weight}`,
        ].filter(Boolean).join(" | ");
        if (vitalsPdf) { left(`Vitals: ${vitalsPdf}`); y += 1; }
        if (formData.diagnosis) { left(`Diagnosis: ${formData.diagnosis}`); y += 1; }
        if (formData.complaints || vitalsPdf || formData.diagnosis) { y += 2; divider(); }

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
                                <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center">
                                    <FileText size={18} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900">New Prescription</h2>
                                    {isPatientLocked && (
                                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                            <Lock size={10} /> Locked to {patient.name}
                                        </p>
                                    )}
                                </div>
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
                                            <Field label="Full Name" locked={isPatientLocked}>
                                                {isPatientLocked ? (
                                                    <div className={lockedCls}>{formData.patientName}</div>
                                                ) : (
                                                    <input className={inputCls} placeholder="e.g. Sarah Johnson"
                                                        value={formData.patientName}
                                                        onChange={(e) => setField("patientName", e.target.value)} />
                                                )}
                                            </Field>
                                            <Field label="Age" locked={isPatientLocked && !!formData.age}>
                                                {isPatientLocked && formData.age ? (
                                                    <div className={lockedCls}>{formData.age}</div>
                                                ) : (
                                                    <input className={inputCls} placeholder="e.g. 34" type="number"
                                                        value={formData.age}
                                                        onChange={(e) => setField("age", e.target.value)} />
                                                )}
                                            </Field>
                                            <Field label="Gender" locked={isPatientLocked && !!formData.gender}>
                                                {isPatientLocked && formData.gender ? (
                                                    <div className={lockedCls}>{formData.gender}</div>
                                                ) : (
                                                    <select className={inputCls} value={formData.gender}
                                                        onChange={(e) => setField("gender", e.target.value)}>
                                                        <option value="">Select</option>
                                                        <option>Male</option>
                                                        <option>Female</option>
                                                        <option>Other</option>
                                                    </select>
                                                )}
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
                                            <div className="col-span-2">
                                                <p className="text-xs font-medium text-gray-500 mb-2">Vitals</p>
                                                <div className="grid grid-cols-4 gap-3">
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 mb-0.5 block">BP (mmHg)</label>
                                                        <input className={inputCls} placeholder="120/80"
                                                            value={formData.vitals.bp}
                                                            onChange={(e) => setField("vitals", { ...formData.vitals, bp: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 mb-0.5 block">Pulse (bpm)</label>
                                                        <input className={inputCls} placeholder="72"
                                                            value={formData.vitals.pulse}
                                                            onChange={(e) => setField("vitals", { ...formData.vitals, pulse: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 mb-0.5 block">Temp (°F)</label>
                                                        <input className={inputCls} placeholder="98.6"
                                                            value={formData.vitals.temp}
                                                            onChange={(e) => setField("vitals", { ...formData.vitals, temp: e.target.value })} />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-gray-400 mb-0.5 block">Weight (kg)</label>
                                                        <input className={inputCls} placeholder="70"
                                                            value={formData.vitals.weight}
                                                            onChange={(e) => setField("vitals", { ...formData.vitals, weight: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
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
                                                className="flex items-center gap-2 text-sm text-[var(--brand-primary)] hover:text-[var(--brand-primary-hover)] font-medium cursor-pointer">
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
                                            <AnimatePresence>
                                                {formData.followUp && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <Field label="Follow-up Time">
                                                            <TimePicker
                                                                value={formData.followUpTime}
                                                                onChange={(val) => setField("followUpTime", val)}
                                                            />
                                                        </Field>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </section>
                                </>
                            ) : (
                                /* ── Preview: Rx Paper Pad ── */
                                <div ref={rxRef} className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 min-h-[500px] font-spline">
                                    {/* Doctor Header */}
                                    <div className="text-center border-b border-gray-200 pb-5 mb-5">
                                        <h3 className="text-lg font-bold text-gray-900">Dr. {doctorName}</h3>
                                        {doctorLabel && <p className="text-sm text-gray-500">{doctorLabel}</p>}
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
                                    {(() => {
                                        const hasVitals = formData.vitals.bp || formData.vitals.pulse || formData.vitals.temp || formData.vitals.weight;
                                        const vitalsStr = [
                                            formData.vitals.bp && `BP: ${formData.vitals.bp}`,
                                            formData.vitals.pulse && `Pulse: ${formData.vitals.pulse}`,
                                            formData.vitals.temp && `Temp: ${formData.vitals.temp}`,
                                            formData.vitals.weight && `Weight: ${formData.vitals.weight}`,
                                        ].filter(Boolean).join(" | ");
                                        return (formData.complaints || hasVitals || formData.diagnosis) && (
                                            <div className="space-y-3 mb-6 text-sm">
                                                {formData.complaints && (
                                                    <p><span className="font-semibold text-gray-700">C/C: </span>
                                                        <span className="text-gray-600">{formData.complaints}</span></p>
                                                )}
                                                {hasVitals && (
                                                    <p><span className="font-semibold text-gray-700">Vitals: </span>
                                                        <span className="text-gray-600">{vitalsStr}</span></p>
                                                )}
                                                {formData.diagnosis && (
                                                    <p><span className="font-semibold text-gray-700">Diagnosis: </span>
                                                        <span className="text-gray-600">{formData.diagnosis}</span></p>
                                                )}
                                            </div>
                                        );
                                    })()}

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
                        </div>

                        {/* ── Success Overlay (covers entire panel) ── */}
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
                                        <p className="text-sm text-gray-500 mt-2 mb-4">
                                            {isPatientLocked
                                                ? `Prescription for ${patient.name} is ready to share.`
                                                : "The prescription has been generated and is ready to share."}
                                        </p>

                                        {followUpBooked && (
                                            <div className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
                                                <CalendarCheck size={16} className="text-emerald-600 shrink-0" />
                                                <p className="text-sm text-emerald-700 font-medium">
                                                    Follow-up appointment booked
                                                </p>
                                            </div>
                                        )}

                                        <button
                                            onClick={handleWhatsApp}
                                            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 transition-all mb-3 cursor-pointer"
                                        >
                                            <MessageCircle size={20} />
                                            {isPatientLocked ? "WhatsApp to Patient / Caregiver" : "Share via WhatsApp"}
                                        </button>

                                        <div className="w-full flex gap-2 mb-3">
                                            <button
                                                onClick={handlePrintPdf}
                                                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                                            >
                                                <Printer size={18} />
                                                Print
                                            </button>
                                            <button
                                                onClick={handleDownloadPdf}
                                                className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-medium shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                                            >
                                                <Download size={18} />
                                                Download PDF
                                            </button>
                                        </div>

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

                        {/* ── Slot Picker Overlay ── */}
                        <AnimatePresence>
                            {showSlotPicker && (
                                <SlotPickerModal
                                    date={formData.followUp}
                                    slots={availableSlots}
                                    loading={slotsLoading}
                                    onSelect={handleSlotPick}
                                    onSkip={() => {
                                        setShowSlotPicker(false);
                                        setActiveTab("preview");
                                        setShowSuccessModal(true);
                                        onPrescriptionCreated?.();
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* ── Footer (hidden during success) ── */}
                        {!showSuccessModal && !showSlotPicker && (
                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSaving}
                                    className={`px-5 py-2 rounded-lg text-white text-sm font-medium shadow-sm transition-colors flex items-center gap-2 ${isSaving ? 'bg-[var(--brand-primary)]/50 cursor-not-allowed' : 'bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] cursor-pointer'}`}
                                >
                                    {isSaving ? (
                                        <><Loader2 size={15} className="animate-spin" /> Saving…</>
                                    ) : (
                                        <><FileText size={15} /> Generate Prescription</>
                                    )}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )
            }
        </AnimatePresence >
    );
}
