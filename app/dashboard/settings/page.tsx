"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
    User, Edit2, Lock, HelpCircle, FileText, LogOut, ChevronRight, Calendar,
    Building2, AlertCircle, CheckCircle2, Loader2
} from "lucide-react";
import EditProfileSheet from "@/components/dashboard/EditProfileSheet";
import LogoutModal from "@/components/dashboard/LogoutModal";
import HelpCenterSheet from "@/components/dashboard/HelpCenterSheet";
import TermsOfServiceSheet from "@/components/dashboard/TermsOfServiceSheet";
import ScheduleEditorSheet from "@/components/dashboard/ScheduleEditorSheet";
import { getDoctorProfile, type DoctorProfile } from "@/lib/dashboard";
import { apiRequest } from "@/lib/api";
import { getMe, type MeResponse } from "@/lib/auth";
import { useBranding } from "@/hooks/useBranding";

const DEFAULT_HOSPITAL_ID = "00000000-0000-4000-8000-000000000001";

interface HospitalItem {
    id: string;
    name: string;
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function SettingsPage() {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);
    const [isTosOpen, setIsTosOpen] = useState(false);
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [me, setMe] = useState<MeResponse | null>(null);
    const [hospitals, setHospitals] = useState<HospitalItem[]>([]);
    const [selectedHospitalId, setSelectedHospitalId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [affiliationError, setAffiliationError] = useState<string | null>(null);
    const [affiliationSuccess, setAffiliationSuccess] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const branding = useBranding();

    const loadProfile = useCallback(() => {
        getDoctorProfile()
            .then(setProfile)
            .catch(() => { });
        getMe()
            .then((data) => {
                setMe(data);
                if (data.hospital_id) {
                    setSelectedHospitalId(data.hospital_id);
                }
            })
            .catch(() => { });
    }, []);

    useEffect(() => {
        loadProfile();
        apiRequest<HospitalItem[]>({ method: "GET", path: "/hospitals" })
            .then(setHospitals)
            .catch(() => { });
    }, [loadProfile, refreshKey]);

    const handleRequestAffiliation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHospitalId || selectedHospitalId === me?.hospital_id) return;

        setIsSubmitting(true);
        setAffiliationError(null);
        setAffiliationSuccess(false);

        try {
            const updatedUser = await apiRequest<MeResponse>({
                method: "POST",
                path: "/api/users/request-affiliation",
                body: { hospital_id: selectedHospitalId }
            });
            setMe(updatedUser);
            setAffiliationSuccess(true);
            setRefreshKey((k) => k + 1);
        } catch (err: any) {
            setAffiliationError(err.message || "Failed to submit affiliation request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const displayName = profile?.full_name || "Doctor";
    const specialization = profile?.specialization || "—";
    const licenseNumber = profile?.license_number || null;
    const phone = profile?.phone_number || "—";
    const videoFee = profile?.video_consultation_fee
        ? `${profile.currency === 'INR' ? '₹' : '$'} ${profile.video_consultation_fee}`
        : "—";
    const inPersonFee = profile?.in_person_consultation_fee
        ? `${profile.currency === 'INR' ? '₹' : '$'} ${profile.in_person_consultation_fee}`
        : "—";
    const clinicName = profile?.clinic_name || "—";
    const clinicAddress = profile?.clinic_address || "—";
    const hospital = hospitals.find(h => h.id === me?.hospital_id)?.name || branding.name || "—";

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="max-w-7xl mx-auto space-y-6  pb-12"
            >
                {/* ── Page Header ── */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                        Profile &amp; Settings
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your personal information, practice details, and security preferences.
                    </p>
                </div>

                {/* ── Split Layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ════ LEFT COLUMN (Col-Span-2) ════ */}
                    <div className="col-span-2 space-y-6">
                        {/* Card 1: Personal Information */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900">
                                Personal Information
                            </div>
                            <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                {/* Identity */}
                                <div className="flex items-center gap-5">
                                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <User size={32} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Dr. {displayName}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {specialization}
                                            {licenseNumber && ` • Reg No: ${licenseNumber}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Edit Profile — opens EditProfileSheet */}
                                <button
                                    onClick={() => setIsEditOpen(true)}
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                                >
                                    <Edit2 size={14} />
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* Card 2: Practice Details */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900">
                                Practice Details
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Phone / WhatsApp</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {phone}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Video Consultation Fee</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {videoFee}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">In-Person Fee</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {inPersonFee}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Clinic / Hospital Name</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {clinicName}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-500 block mb-2">Clinic / Hospital Address</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                        {clinicAddress}
                                    </div>
                                </div>

                                {licenseNumber && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 block mb-2">License Number</label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-900 font-medium">
                                            {licenseNumber}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Card 2b: Weekly Schedule */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">Weekly Schedule</span>
                                <button
                                    onClick={() => setIsScheduleOpen(true)}
                                    className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                                >
                                    <Calendar size={12} />
                                    Edit Schedule
                                </button>
                            </div>
                            <div className="p-6">
                                {profile?.availability_slots && profile.availability_slots.filter(s => s.is_enabled).length > 0 ? (
                                    <div className="space-y-2">
                                        {profile.availability_slots
                                            .filter((s) => s.is_enabled)
                                            .map((slot, idx) => (
                                                <div
                                                    key={`${slot.day_of_week}-${idx}`}
                                                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {slot.day_of_week.charAt(0).toUpperCase() + slot.day_of_week.slice(1).toLowerCase()}
                                                        </span>
                                                        <span className="text-[10px] font-bold tracking-wider uppercase bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-500">
                                                            {slot.appointment_type === 'IN_PERSON' ? 'In-Person' : 'Video'}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500 font-mono">
                                                        {slot.start_time.substring(0, 5)} — {slot.end_time.substring(0, 5)}
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 text-center py-4">
                                        No availability set. Click &quot;Edit Schedule&quot; to configure.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Card 2c: Hospital Affiliation */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-gray-500" />
                                Hospital &amp; Clinic Affiliation
                            </div>
                            <div className="p-6">
                                {me && (
                                    <div className="space-y-4">
                                        {/* Current Status Banner */}
                                        {me.affiliation_status === "PENDING" && (
                                            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-sm text-amber-800">
                                                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block mb-0.5">Affiliation Request Pending</span>
                                                    Your request to affiliate with <strong className="font-medium text-amber-900">{hospitals.find(h => h.id === me.hospital_id)?.name || "the selected hospital"}</strong> is awaiting administrator approval.
                                                    <p className="mt-1 text-xs text-amber-700">
                                                        Until approved, your data access remains sandboxed under the default hospital context.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {me.affiliation_status === "APPROVED" && me.hospital_id !== DEFAULT_HOSPITAL_ID && (
                                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex gap-3 text-sm text-emerald-800">
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block mb-0.5">Affiliation Approved</span>
                                                    You are successfully affiliated with <strong className="font-medium text-emerald-900">{hospitals.find(h => h.id === me.hospital_id)?.name || "your hospital"}</strong>.
                                                </div>
                                            </div>
                                        )}

                                        {me.affiliation_status === "REJECTED" && (
                                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 text-sm text-red-800">
                                                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block mb-0.5">Affiliation Request Rejected</span>
                                                    Your request to affiliate with <strong className="font-medium text-red-900">{hospitals.find(h => h.id === me.hospital_id)?.name || "the selected hospital"}</strong> was rejected.
                                                    <p className="mt-1 text-xs text-red-700">
                                                        You can select another hospital below to submit a new affiliation request.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {me.hospital_id === DEFAULT_HOSPITAL_ID && me.affiliation_status === "APPROVED" && (
                                            <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex gap-3 text-sm text-blue-800">
                                                <Building2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="font-semibold block mb-0.5">Default Hospital Session</span>
                                                    You are currently using the default {branding.name} hospital workspace.
                                                </div>
                                            </div>
                                        )}

                                        {/* Change / Request Form (Only if NOT pending) */}
                                        {me.affiliation_status !== "PENDING" && (
                                            <form onSubmit={handleRequestAffiliation} className="space-y-4 pt-4 border-t border-gray-100">
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                                        Select Hospital / Clinic for Affiliation
                                                    </label>
                                                    <select
                                                        value={selectedHospitalId}
                                                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                                                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                                    >
                                                        <option value="" disabled>-- Choose a Hospital --</option>
                                                        {hospitals.map((h) => (
                                                            <option key={h.id} value={h.id}>
                                                                {h.name} {h.id === DEFAULT_HOSPITAL_ID ? "(Default)" : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {affiliationError && (
                                                    <p className="text-xs text-red-600 font-medium">{affiliationError}</p>
                                                )}

                                                {affiliationSuccess && (
                                                    <p className="text-xs text-emerald-600 font-medium">Affiliation request submitted successfully!</p>
                                                )}

                                                {selectedHospitalId !== me.hospital_id && (
                                                    <button
                                                        type="submit"
                                                        disabled={isSubmitting}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer w-full"
                                                    >
                                                        {isSubmitting ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                Submitting Request...
                                                            </>
                                                        ) : (
                                                            "Request Affiliation"
                                                        )}
                                                    </button>
                                                )}
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ════ RIGHT COLUMN (Col-Span-1) ════ */}
                    <div className="col-span-1 space-y-6">
                        {/* Card 3: Privacy & Security */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-sm font-semibold text-gray-900">
                                Privacy &amp; Security
                            </div>
                            <div className="p-5 bg-gray-50 text-xs text-gray-500 flex gap-3 leading-relaxed">
                                <Lock size={16} className="text-gray-400 shrink-0 mt-0.5" />
                                All patient data is end-to-end encrypted and our platform is fully HIPAA compliant.
                            </div>
                        </div>

                        {/* Card 4: Support & Legal */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <button
                                type="button"
                                onClick={() => setIsHelpOpen(true)}
                                className="w-full px-5 py-4 border-b border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <HelpCircle size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Help Center</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsTosOpen(true)}
                                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium text-gray-900">Terms of Service</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[var(--brand-primary)] transition-colors" />
                            </button>
                        </div>

                        {/* Log Out — opens LogoutModal */}
                        <button
                            onClick={() => setIsLogoutOpen(true)}
                            className="w-full py-3.5 px-4 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-300 rounded-xl font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <LogOut size={18} />
                            Log Out
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* ── Sheets & Modals ── */}
            <EditProfileSheet
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                onSaved={() => setRefreshKey((k) => k + 1)}
            />
            <ScheduleEditorSheet
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                onSaved={() => setRefreshKey((k) => k + 1)}
            />
            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
            <HelpCenterSheet isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
            <TermsOfServiceSheet isOpen={isTosOpen} onClose={() => setIsTosOpen(false)} />
        </>
    );
}

