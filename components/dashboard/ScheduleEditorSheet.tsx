"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Clock, ChevronUp, ChevronDown, Save, Loader2, CheckCircle, Plus
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

interface TimeInterval {
    startTime: string;
    endTime: string;
    type: "VIDEO" | "IN_PERSON";
}

interface DaySchedule {
    enabled: boolean;
    intervals: TimeInterval[];
}

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
    const [schedule, setSchedule] = useState<Record<string, DaySchedule>>({});
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
                const initialSchedule: Record<string, DaySchedule> = {};
                DAYS.forEach(day => {
                    const daySlots = profile.availability_slots?.filter(s => s.day_of_week.toLowerCase() === day.toLowerCase() && s.is_enabled) || [];

                    if (daySlots.length > 0) {
                        initialSchedule[day] = {
                            enabled: true,
                            intervals: daySlots.map(s => ({
                                startTime: s.start_time.substring(0, 5),
                                endTime: s.end_time.substring(0, 5),
                                type: s.appointment_type as "VIDEO" | "IN_PERSON"
                            }))
                        };
                    } else {
                        initialSchedule[day] = {
                            enabled: false,
                            intervals: [{ startTime: "09:00", endTime: "17:00", type: "VIDEO" }]
                        };
                    }
                });
                setSchedule(initialSchedule);
            })
            .catch(() => {
                const initialSchedule: Record<string, DaySchedule> = {};
                DAYS.forEach(day => {
                    initialSchedule[day] = {
                        enabled: false,
                        intervals: [{ startTime: "09:00", endTime: "17:00", type: "VIDEO" }]
                    };
                });
                setSchedule(initialSchedule);
            })
            .finally(() => setLoading(false));
    }, [isOpen]);

    const updateDayEnabled = (day: string, enabled: boolean) => {
        setSchedule(prev => ({ ...prev, [day]: { ...prev[day], enabled } }));
    }

    const updateInterval = (day: string, index: number, field: keyof TimeInterval, value: string) => {
        setSchedule(prev => {
            const newIntervals = [...prev[day].intervals];
            newIntervals[index] = { ...newIntervals[index], [field]: value };
            return { ...prev, [day]: { ...prev[day], intervals: newIntervals } };
        });
    }

    const addInterval = (day: string) => {
        setSchedule(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                intervals: [...prev[day].intervals, { startTime: "09:00", endTime: "17:00", type: "VIDEO" }]
            }
        }));
    }

    const removeInterval = (day: string, index: number) => {
        setSchedule(prev => {
            const newIntervals = [...prev[day].intervals];
            newIntervals.splice(index, 1);
            return {
                ...prev,
                [day]: { ...prev[day], intervals: newIntervals }
            };
        });
    }

    const handleSave = async () => {
        setSaving(true);
        try {
            // Build the slots array
            const slots: any[] = [];
            Object.entries(schedule).forEach(([day, v]) => {
                if (v.enabled) {
                    v.intervals.forEach((interval) => {
                        slots.push({
                            day_of_week: day.toUpperCase(),
                            start_time: interval.startTime + ":00",
                            end_time: interval.endTime + ":00",
                            is_enabled: true,
                            appointment_type: interval.type,
                        });
                    });
                }
            });

            await submitDoctorAvailability(slots);
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
                                DAYS.map((day) => {
                                    const sched = schedule[day];
                                    if (!sched) return null;
                                    return (
                                        <div
                                            key={day}
                                            className={`rounded-xl border transition-all ${
                                                sched.enabled
                                                    ? "border-[var(--brand-primary)]/20 bg-[var(--brand-primary)]/[0.02]"
                                                    : "border-gray-200 bg-gray-50/50"
                                            }`}
                                        >
                                            <div className="flex items-start justify-between px-4 py-3">
                                                {/* Day toggle */}
                                                <label className="flex items-center gap-3 cursor-pointer select-none mt-2">
                                                    <div
                                                        className={`w-10 h-[22px] rounded-full p-[2px] transition-colors cursor-pointer ${
                                                            sched.enabled
                                                                ? "bg-[var(--brand-primary)]"
                                                                : "bg-gray-300"
                                                        }`}
                                                        onClick={() => updateDayEnabled(day, !sched.enabled)}
                                                    >
                                                        <div
                                                            className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transition-transform ${
                                                                sched.enabled ? "translate-x-[18px]" : "translate-x-0"
                                                            }`}
                                                        />
                                                    </div>
                                                    <span
                                                        className={`text-sm font-medium w-20 ${
                                                            sched.enabled
                                                                ? "text-gray-900"
                                                                : "text-gray-400"
                                                        }`}
                                                    >
                                                        {day}
                                                    </span>
                                                </label>

                                                {/* Time range intervals */}
                                                <div className="flex flex-col gap-2 flex-1 items-end">
                                                    {sched.intervals.map((interval, idx) => (
                                                        <div key={idx} className="flex items-center gap-2">
                                                            <TimeSpinner
                                                                value={interval.startTime}
                                                                disabled={!sched.enabled}
                                                                onChange={(v) => updateInterval(day, idx, "startTime", v)}
                                                            />
                                                            <span className="text-xs text-gray-400 font-medium">to</span>
                                                            <TimeSpinner
                                                                value={interval.endTime}
                                                                disabled={!sched.enabled}
                                                                onChange={(v) => updateInterval(day, idx, "endTime", v)}
                                                            />
                                                            <select
                                                                disabled={!sched.enabled}
                                                                value={interval.type}
                                                                onChange={(e) => updateInterval(day, idx, "type", e.target.value)}
                                                                className="ml-1 text-xs border border-gray-200 rounded py-1 px-2 focus:outline-none focus:ring-1 focus:ring-[var(--brand-primary)]/30 disabled:bg-gray-50 disabled:text-gray-400 w-24"
                                                            >
                                                                <option value="VIDEO">Video</option>
                                                                <option value="IN_PERSON">In-Person</option>
                                                            </select>
                                                            
                                                            {/* Add / Remove buttons */}
                                                            <div className="flex items-center gap-1 ml-1 w-12">
                                                                {sched.enabled && sched.intervals.length > 1 && (
                                                                    <button type="button" onClick={() => removeInterval(day, idx)} className="text-gray-400 hover:text-red-500 p-1 transition-colors cursor-pointer" title="Remove shift">
                                                                        <X size={14} />
                                                                    </button>
                                                                )}
                                                                {sched.enabled && idx === sched.intervals.length - 1 && (
                                                                    <button type="button" onClick={() => addInterval(day)} className="text-gray-400 hover:text-[var(--brand-primary)] p-1 transition-colors cursor-pointer" title="Add another shift">
                                                                        <Plus size={14} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
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
