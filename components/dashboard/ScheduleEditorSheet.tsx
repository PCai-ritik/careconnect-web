"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Clock, ChevronUp, ChevronDown, Save, Loader2, CheckCircle,
} from "lucide-react";
import {
    getDoctorProfile,
    submitDoctorAvailability,
    type DoctorAvailabilitySlot,
} from "@/lib/dashboard";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";

/* ── Constants ───────────────────────────────────────────────────────── */

const DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
];

const defaultSlot = (day: string): DoctorAvailabilitySlot => ({
    day_of_week: day,
    start_time: "09:00",
    end_time: "17:00",
    is_enabled: false,
});

/* ── Time Spinner ────────────────────────────────────────────────────── */

function TimeSpinner({
    value,
    onChange,
    disabled,
}: {
    value: string;
    onChange: (val: string) => void;
    disabled?: boolean;
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

    const btnCls = `w-7 h-6 flex items-center justify-center rounded transition-colors ${
        disabled
            ? "text-gray-300 cursor-not-allowed"
            : "text-gray-400 hover:text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 cursor-pointer"
    }`;

    return (
        <div className={`flex items-center gap-0.5 ${disabled ? "opacity-50" : ""}`}>
            <div className="flex flex-col items-center">
                <button type="button" className={btnCls} disabled={disabled} onClick={() => setH(hours + 1)}>
                    <ChevronUp size={12} />
                </button>
                <input
                    type="text"
                    disabled={disabled}
                    className="w-9 text-center text-xs font-mono border border-gray-200 rounded py-1 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30 disabled:bg-gray-50"
                    value={pad(hours)}
                    onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 0 && v <= 23) setH(v);
                    }}
                    maxLength={2}
                />
                <button type="button" className={btnCls} disabled={disabled} onClick={() => setH(hours - 1)}>
                    <ChevronDown size={12} />
                </button>
            </div>
            <span className="text-sm font-bold text-gray-300">:</span>
            <div className="flex flex-col items-center">
                <button type="button" className={btnCls} disabled={disabled} onClick={() => setM(minutes + 1)}>
                    <ChevronUp size={12} />
                </button>
                <input
                    type="text"
                    disabled={disabled}
                    className="w-9 text-center text-xs font-mono border border-gray-200 rounded py-1 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30 disabled:bg-gray-50"
                    value={pad(minutes)}
                    onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        if (!isNaN(v) && v >= 0 && v <= 59) setM(v);
                    }}
                    maxLength={2}
                />
                <button type="button" className={btnCls} disabled={disabled} onClick={() => setM(minutes - 1)}>
                    <ChevronDown size={12} />
                </button>
            </div>
        </div>
    );
}

/* ── Main Component ──────────────────────────────────────────────────── */

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSaved?: () => void;
}

export default function ScheduleEditorSheet({ isOpen, onClose, onSaved }: Props) {
    const [slots, setSlots] = useState<DoctorAvailabilitySlot[]>(
        DAYS.map(defaultSlot)
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useLockBodyScroll(isOpen);

    // Load current schedule when sheet opens
    useEffect(() => {
        if (!isOpen) return;
        setSaved(false);
        setLoading(true);
        getDoctorProfile()
            .then((profile) => {
                if (profile.availability_slots && profile.availability_slots.length > 0) {
                    // Merge existing slots with defaults for missing days
                    const existing = profile.availability_slots;
                    const merged = DAYS.map((day) => {
                        const found = existing.find(
                            (s) => s.day_of_week === day
                        );
                        return found ?? defaultSlot(day);
                    });
                    setSlots(merged);
                } else {
                    setSlots(DAYS.map(defaultSlot));
                }
            })
            .catch(() => setSlots(DAYS.map(defaultSlot)))
            .finally(() => setLoading(false));
    }, [isOpen]);

    const updateSlot = (
        dayIndex: number,
        field: keyof DoctorAvailabilitySlot,
        value: string | boolean
    ) => {
        setSlots((prev) => {
            const next = [...prev];
            next[dayIndex] = { ...next[dayIndex], [field]: value };
            return next;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Only send enabled slots to the API
            const enabledSlots = slots.filter((s) => s.is_enabled);
            await submitDoctorAvailability(enabledSlots);
            setSaved(true);
            onSaved?.();
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1500);
        } catch (e) {
            console.error("Failed to save schedule:", e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-xl flex items-center justify-center">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">
                                        Edit Schedule
                                    </h2>
                                    <p className="text-xs text-gray-400">
                                        Set your weekly availability
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <X size={18} className="text-gray-400" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {loading ? (
                                <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    Loading schedule…
                                </div>
                            ) : (
                                slots.map((slot, i) => (
                                    <div
                                        key={slot.day_of_week}
                                        className={`rounded-xl border transition-all ${
                                            slot.is_enabled
                                                ? "border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/[0.02]"
                                                : "border-gray-200 bg-gray-50/50"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between px-4 py-3">
                                            {/* Day toggle */}
                                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                                <div
                                                    className={`w-10 h-[22px] rounded-full p-[2px] transition-colors cursor-pointer ${
                                                        slot.is_enabled
                                                            ? "bg-[var(--brand-primary)]"
                                                            : "bg-gray-300"
                                                    }`}
                                                    onClick={() => updateSlot(i, "is_enabled", !slot.is_enabled)}
                                                >
                                                    <div
                                                        className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${
                                                            slot.is_enabled ? "translate-x-[18px]" : "translate-x-0"
                                                        }`}
                                                    />
                                                </div>
                                                <span
                                                    className={`text-sm font-medium ${
                                                        slot.is_enabled
                                                            ? "text-gray-900"
                                                            : "text-gray-400"
                                                    }`}
                                                >
                                                    {slot.day_of_week}
                                                </span>
                                            </label>

                                            {/* Time range */}
                                            <div className="flex items-center gap-2">
                                                <TimeSpinner
                                                    value={slot.start_time}
                                                    disabled={!slot.is_enabled}
                                                    onChange={(v) => updateSlot(i, "start_time", v)}
                                                />
                                                <span className="text-xs text-gray-400 font-medium">to</span>
                                                <TimeSpinner
                                                    value={slot.end_time}
                                                    disabled={!slot.is_enabled}
                                                    onChange={(v) => updateSlot(i, "end_time", v)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || saved}
                                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                                    saved
                                        ? "bg-emerald-500 text-white"
                                        : saving
                                        ? "bg-[var(--brand-primary)]/50 text-white/80 cursor-not-allowed"
                                        : "bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white shadow-sm"
                                }`}
                            >
                                {saved ? (
                                    <><CheckCircle size={15} /> Saved!</>
                                ) : saving ? (
                                    <><Loader2 size={15} className="animate-spin" /> Saving…</>
                                ) : (
                                    <><Save size={15} /> Save Schedule</>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
