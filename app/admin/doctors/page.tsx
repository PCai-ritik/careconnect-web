"use client";

import { useEffect, useState } from "react";
import { apiRequest, getStoredUser } from "@/lib/api";
import { Loader2, Plus, Stethoscope, Mail, X, CheckCircle, Clock, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Doctor {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    specialization: string;
    onboarding_completed: boolean;
    is_active: boolean;
    patient_count: number;
    created_at: string;
}

interface Hospital {
    id: string;
    name: string;
}

export default function DoctorsAdminPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Auth context
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<string>("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [email, setEmail] = useState("");
    const [fullName, setFullName] = useState("");
    const [password, setPassword] = useState("");
    const [specialization, setSpecialization] = useState("");

    useEffect(() => {
        const user = getStoredUser();
        if (user?.role === "SUPER_ADMIN") {
            setIsSuperAdmin(true);
            fetchHospitals();
        }
        fetchDoctors();
    }, []);

    useEffect(() => {
        fetchDoctors(selectedHospital);
    }, [selectedHospital]);

    const fetchHospitals = async () => {
        try {
            const data = await apiRequest<Hospital[]>({ method: "GET", path: "/admin/hospitals" });
            setHospitals(data);
        } catch (err) {
            console.error("Failed to load hospitals", err);
        }
    };

    const fetchDoctors = async (hospitalId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const path = hospitalId ? `/admin/doctors?hospital_id=${hospitalId}` : "/admin/doctors";
            const data = await apiRequest<Doctor[]>({ method: "GET", path });
            setDoctors(data);
        } catch (err: any) {
            setError(err.message || "Failed to load doctors");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            await apiRequest({
                method: "POST",
                path: "/admin/doctors",
                body: {
                    email,
                    full_name: fullName,
                    password,
                    specialization
                }
            });
            setIsModalOpen(false);
            // Reset form
            setEmail(""); setFullName(""); setPassword(""); setSpecialization("");
            // Refresh list
            fetchDoctors(selectedHospital);
        } catch (err: any) {
            setError(err.message || "Failed to create doctor");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Stethoscope className="text-[var(--brand-primary)]" size={26} />
                        Doctor Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and add doctors to the hospital platform.
                    </p>
                </div>
                
                <div className="flex items-center gap-3">
                    {isSuperAdmin && (
                        <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <select
                                value={selectedHospital}
                                onChange={(e) => setSelectedHospital(e.target.value)}
                                className="pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] shadow-sm appearance-none"
                            >
                                <option value="">All Hospitals</option>
                                {hospitals.map(h => (
                                    <option key={h.id} value={h.id}>{h.name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-[var(--brand-primary)] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                    >
                        <Plus size={18} />
                        Add Doctor
                    </button>
                </div>
            </div>

            {error && !isModalOpen && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm border border-red-100 flex items-center gap-2">
                    <X size={16} /> {error}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <Loader2 className="animate-spin text-[var(--brand-primary)] mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading doctors...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Specialization</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patients</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Added Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {doctors.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No doctors found. Click "Add Doctor" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    doctors.map((doctor) => (
                                        <tr key={doctor.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                                                        <span className="text-indigo-600 font-semibold text-sm">
                                                            {doctor.full_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{doctor.full_name}</p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail size={12} /> {doctor.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {doctor.specialization || <span className="text-gray-400 italic">Not set</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {doctor.onboarding_completed ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        <CheckCircle size={12} />
                                                        Onboarded
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                                        <Clock size={12} />
                                                        Pending Setup
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {doctor.patient_count}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(doctor.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900">Add New Doctor</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateDoctor} className="p-5">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                        {error}
                                    </div>
                                )}
                                
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                            placeholder="Dr. John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                            placeholder="doctor@hospital.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Temporary Password
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                            placeholder="Minimum 6 characters"
                                            minLength={6}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                            Specialization <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={specialization}
                                            onChange={(e) => setSpecialization(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                            placeholder="e.g. Cardiology"
                                        />
                                    </div>
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 py-2.5 bg-[var(--brand-primary)] text-white font-medium text-sm rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create Doctor"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
