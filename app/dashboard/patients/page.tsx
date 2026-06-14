"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Search, User, ChevronRight, UserPlus, Video, Loader2 } from "lucide-react";
import PatientProfileSheet from "@/components/dashboard/PatientProfileSheet";
import AddPatientSheet from "@/components/dashboard/AddPatientSheet";
import NewPrescriptionSheet from "@/components/dashboard/NewPrescriptionSheet";
import type { PrescriptionPatient } from "@/components/dashboard/NewPrescriptionSheet";
import { getPatients, getDoctorProfile, createAppointment, type PatientResponse } from "@/lib/dashboard";
import { getMe } from "@/lib/auth";

/* ── Avatar Color Palette ────────────────────────────────────────────── */

const avatarColors = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-purple-50 text-purple-600",
    "bg-rose-50 text-rose-600",
    "bg-amber-50 text-amber-600",
];

/* ── Mock Fallback Data ──────────────────────────────────────────────── */

const MOCK_PATIENTS = [
    { id: "pt-001", name: "Sarah Johnson", age: 34, gender: "Female", condition: "Hypertension", lastVisit: "2 days ago" },
    { id: "pt-002", name: "Michael Brown", age: 52, gender: "Male", condition: "Type 2 Diabetes", lastVisit: "5 days ago" },
    { id: "pt-003", name: "Emily Davis", age: 28, gender: "Female", condition: "Anxiety Disorder", lastVisit: "1 week ago" },
    { id: "pt-004", name: "James Wilson", age: 45, gender: "Male", condition: "Chronic Back Pain", lastVisit: "Mar 10, 2026" },
    { id: "pt-005", name: "Emma Smith", age: 31, gender: "Female", condition: "Migraine", lastVisit: "Mar 8, 2026" },
    { id: "pt-006", name: "David Lee", age: 60, gender: "Male", condition: "High Cholesterol", lastVisit: "Mar 5, 2026" },
    { id: "pt-007", name: "Olivia Martinez", age: 22, gender: "Female", condition: "Seasonal Allergies", lastVisit: "Feb 28, 2026" },
    { id: "pt-008", name: "Robert Taylor", age: 41, gender: "Male", condition: "Asthma", lastVisit: "Feb 20, 2026" },
    { id: "pt-009", name: "Sophia Anderson", age: 38, gender: "Female", condition: "Thyroid Disorder", lastVisit: "Feb 15, 2026" },
    { id: "pt-010", name: "Daniel Thomas", age: 55, gender: "Male", condition: "Arthritis", lastVisit: "Feb 10, 2026" },
];

/* ── Helpers ──────────────────────────────────────────────────────────── */

function calcAge(dob: string | null): number {
    if (!dob) return 0;
    return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
}

function formatLastVisit(iso: string): string {
    const d = new Date(iso);
    const diffMs = Date.now() - d.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return "1 week ago";
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type DisplayPatient = { id: string; name: string; age: number; gender: string; condition: string; lastVisit: string };

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function PatientsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPatient, setSelectedPatient] = useState<PatientResponse | null>(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
    const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
    const [prescriptionPatient, setPrescriptionPatient] = useState<PrescriptionPatient | null>(null);
    const [useMock, setUseMock] = useState(false);
    const [rawPatients, setRawPatients] = useState<PatientResponse[]>([]);
    const [profileRefreshKey, setProfileRefreshKey] = useState(0);
    const [startingCallFor, setStartingCallFor] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function load() {
            try {
                const data = await getPatients();
                setRawPatients(data);
            } catch {
                setUseMock(true);
            }
        }
        load();
    }, []);

    const patients = useMock
        ? MOCK_PATIENTS
        : rawPatients.map(p => ({
            id: p.id,
            name: p.full_name,
            age: calcAge(p.date_of_birth),
            gender: p.gender || '—',
            condition: p.existing_conditions?.[0] || '—',
            lastVisit: formatLastVisit(p.created_at),
        }));

    const filteredPatients = patients.filter(
        (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.condition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openProfile = (patientId: string) => {
        const raw = rawPatients.find(p => p.id === patientId);
        if (raw) {
            setSelectedPatient(raw);
            setIsProfileOpen(true);
        }
    };

    return (
        <>
            <div className="max-w-7xl mx-auto  pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    className="space-y-6"
                >
                    {/* ── Page Header + Controls ── */}
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Patients</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage your patient directory and medical records.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="relative w-full sm:w-72">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or condition..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all bg-white shadow-sm"
                            />
                        </div>

                        <button
                            onClick={() => setIsAddPatientOpen(true)}
                            className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                            <UserPlus size={16} />
                            Add Patient
                        </button>
                    </div>

                    {/* ── The Table Card ── */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[500px]">
                        {/* Table Header */}
                        <div className="hidden sm:grid grid-cols-5 gap-4 px-6 py-4 border-b border-gray-200 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            <div>Patient</div>
                            <div className="text-center">Demographics</div>
                            <div className="text-center">Condition</div>
                            <div className="text-center">Last Visit</div>
                            <div className="text-right">Actions</div>
                        </div>

                        {/* Data Rows */}
                        {filteredPatients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <Search size={40} className="mb-3 opacity-50" />
                                <p className="text-sm font-semibold">No patients found</p>
                                <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                            </div>
                        ) : (
                            filteredPatients.map((patient, index) => (
                                <div
                                    key={patient.id}
                                    className="grid grid-cols-1 sm:grid-cols-5 gap-4 px-6 py-4 border-b border-gray-100 last:border-0 items-center hover:bg-gray-50 transition-colors group"
                                >
                                    {/* Col 1 — Patient — click opens profile */}
                                    <button
                                        onClick={() => openProfile(patient.id)}
                                        className="flex items-center gap-3 text-left cursor-pointer"
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                                            <User size={18} />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[var(--brand-primary)] transition-colors">
                                            {patient.name}
                                        </p>
                                    </button>

                                    {/* Col 2 — Demographics */}
                                    <div className="text-sm text-gray-600 text-center">
                                        Age: {patient.age} • {patient.gender}
                                    </div>

                                    {/* Col 3 — Condition */}
                                    <div className="flex justify-center">
                                        <span className="text-xs text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-0.5 rounded-md font-medium">
                                            {patient.condition}
                                        </span>
                                    </div>

                                    {/* Col 4 — Last Visit */}
                                    <div className="text-sm text-gray-500 text-center">{patient.lastVisit}</div>

                                    {/* Col 5 — Actions */}
                                    <div className="flex justify-end items-center gap-2">
                                        {/* Start Video Call */}
                                        <button
                                            onClick={async (e) => {
                                                e.stopPropagation();
                                                if (startingCallFor) return;
                                                setStartingCallFor(patient.id);
                                                try {
                                                    const rawPt = rawPatients.find(p => p.id === patient.id);
                                                    if (!rawPt) throw new Error('Patient not found');
                                                    const [profile, me] = await Promise.all([
                                                        getDoctorProfile(),
                                                        getMe(),
                                                    ]);
                                                    if (!profile || !me?.hospital_id) throw new Error('Missing info');
                                                    const appt = await createAppointment({
                                                        doctor_id: profile.id,
                                                        patient_id: rawPt.id,
                                                        hospital_id: me.hospital_id,
                                                        scheduled_time: new Date().toISOString(),
                                                        duration_minutes: 30,
                                                        appointment_type: 'VIDEO',
                                                    });
                                                    router.push(`/consultation/${appt.id}`);
                                                } catch (err) {
                                                    console.error('Failed to start call:', err);
                                                    setStartingCallFor(null);
                                                }
                                            }}
                                            disabled={startingCallFor === patient.id}
                                            className="opacity-0 group-hover:opacity-100 transition-all border border-gray-200 hover:border-[var(--brand-primary)]/30 hover:bg-indigo-50 text-gray-500 hover:text-[var(--brand-primary)] p-1.5 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Start Video Call"
                                        >
                                            {startingCallFor === patient.id ? (
                                                <Loader2 size={15} className="animate-spin" />
                                            ) : (
                                                <Video size={15} />
                                            )}
                                        </button>
                                        {/* View Profile */}
                                        <button
                                            onClick={() => openProfile(patient.id)}
                                            className="opacity-0 group-hover:opacity-100 transition-all text-gray-400 group-hover:text-[var(--brand-primary)] cursor-pointer"
                                            title="View Profile"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Slide-Overs ── */}
            <PatientProfileSheet
                patient={selectedPatient}
                isOpen={isProfileOpen}
                onClose={() => setIsProfileOpen(false)}
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
                    setIsProfileOpen(false);
                    setIsPrescriptionOpen(true);
                }}
                key={profileRefreshKey}
            />
            <AddPatientSheet
                isOpen={isAddPatientOpen}
                onClose={() => setIsAddPatientOpen(false)}
            />
            <NewPrescriptionSheet
                isOpen={isPrescriptionOpen}
                onClose={() => { setIsPrescriptionOpen(false); setPrescriptionPatient(null); }}
                patient={prescriptionPatient}
                onPrescriptionCreated={() => setProfileRefreshKey(k => k + 1)}
            />
        </>
    );
}
