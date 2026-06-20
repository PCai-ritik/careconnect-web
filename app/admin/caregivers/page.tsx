"use client";

import { useEffect, useState } from "react";
import { apiRequest, getStoredUser } from "@/lib/api";
import { Loader2, Plus, HandHeart, Phone, Mail, X, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Caregiver {
    id: string;
    user_id: string;
    full_name: string;
    email: string;
    whatsapp_number: string;
    is_active: boolean;
    patient_count: number;
    created_at: string;
}

interface Patient {
    id: string;
    full_name: string;
}

interface Hospital {
    id: string;
    name: string;
}

export default function CaregiversAdminPage() {
    const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
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
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);

    useEffect(() => {
        const user = getStoredUser();
        if (user?.role === "SUPER_ADMIN") {
            setIsSuperAdmin(true);
            fetchHospitals();
        }
        fetchCaregivers();
        fetchPatients();
    }, []);

    useEffect(() => {
        fetchCaregivers(selectedHospital);
        fetchPatients(selectedHospital);
    }, [selectedHospital]);

    const fetchHospitals = async () => {
        try {
            const data = await apiRequest<Hospital[]>({ method: "GET", path: "/admin/hospitals" });
            setHospitals(data);
        } catch (err) {
            console.error("Failed to load hospitals", err);
        }
    };

    const fetchPatients = async (hospitalId?: string) => {
        try {
            const path = hospitalId ? `/admin/patients?hospital_id=${hospitalId}` : "/admin/patients";
            const data = await apiRequest<Patient[]>({ method: "GET", path });
            setPatients(data);
        } catch (err) {
            console.error("Failed to load patients", err);
        }
    };

    const fetchCaregivers = async (hospitalId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const path = hospitalId ? `/admin/caregivers?hospital_id=${hospitalId}` : "/admin/caregivers";
            const data = await apiRequest<Caregiver[]>({ method: "GET", path });
            setCaregivers(data);
        } catch (err: any) {
            setError(err.message || "Failed to load caregivers");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCaregiver = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const body: any = {
                email,
                full_name: fullName,
                password,
                whatsapp_number: whatsappNumber,
            };
            if (selectedPatientIds.length > 0) {
                body.patient_ids = selectedPatientIds;
            }

            await apiRequest({
                method: "POST",
                path: "/admin/caregivers",
                body
            });
            setIsModalOpen(false);
            // Reset form
            setEmail(""); setFullName(""); setPassword(""); setWhatsappNumber(""); setSelectedPatientIds([]);
            // Refresh list
            fetchCaregivers(selectedHospital);
        } catch (err: any) {
            setError(err.message || "Failed to create caregiver");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePatientSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.options);
        const selected = options.filter(option => option.selected).map(option => option.value);
        setSelectedPatientIds(selected);
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <HandHeart className="text-[var(--brand-primary)]" size={26} />
                        Caregiver Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and add caregivers to the hospital platform.
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
                        Add Caregiver
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
                    <p className="text-gray-500 font-medium">Loading caregivers...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Caregiver</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Patients</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Added Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {caregivers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No caregivers found. Click "Add Caregiver" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    caregivers.map((caregiver) => (
                                        <tr key={caregiver.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
                                                        <span className="text-teal-600 font-semibold text-sm">
                                                            {caregiver.full_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{caregiver.full_name}</p>
                                                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                                            <Mail size={12} /> {caregiver.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {caregiver.whatsapp_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {caregiver.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 font-medium">
                                                {caregiver.patient_count}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(caregiver.created_at).toLocaleDateString()}
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
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
                                <h3 className="text-lg font-bold text-gray-900">Add New Caregiver</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-5">
                                <form id="create-caregiver-form" onSubmit={handleCreateCaregiver} className="space-y-4">
                                    {error && (
                                        <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                                placeholder="Caregiver Name"
                                            />
                                        </div>
                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                                placeholder="caregiver@hospital.com"
                                            />
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
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

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                WhatsApp Number
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={whatsappNumber}
                                                onChange={(e) => setWhatsappNumber(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                                placeholder="+1234567890"
                                            />
                                        </div>

                                        <div className="col-span-2">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Link Patients <span className="text-gray-400 normal-case font-normal">(Optional, Multi-select)</span>
                                            </label>
                                            <select
                                                multiple
                                                value={selectedPatientIds}
                                                onChange={handlePatientSelection}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all h-32"
                                            >
                                                {patients.map(p => (
                                                    <option key={p.id} value={p.id}>{p.full_name}</option>
                                                ))}
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1.5">Hold Ctrl (Windows) or Cmd (Mac) to select multiple patients.</p>
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-5 border-t border-gray-100 flex gap-3 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 text-gray-600 font-medium text-sm hover:bg-gray-100 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    form="create-caregiver-form"
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-[var(--brand-primary)] text-white font-medium text-sm rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create Caregiver"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
