"use client";

import { useEffect, useState } from "react";
import { apiRequest, getStoredUser } from "@/lib/api";
import { Loader2, Plus, Heart, Phone, X, Building, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Patient {
    id: string;
    full_name: string;
    whatsapp_number: string;
    doctor_name: string | null;
    caregiver_name: string | null;
    hospital_name: string | null;
    created_at: string;
}

interface Doctor {
    id: string;
    full_name: string;
}

interface Caregiver {
    id: string;
    full_name: string;
}

interface Hospital {
    id: string;
    name: string;
}

export default function PatientsAdminPage() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [caregivers, setCaregivers] = useState<Caregiver[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Auth context
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [selectedHospital, setSelectedHospital] = useState<string>("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    
    // Form state
    const [fullName, setFullName] = useState("");
    const [whatsappNumber, setWhatsappNumber] = useState("");
    const [doctorId, setDoctorId] = useState("");
    const [caregiverId, setCaregiverId] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        const user = getStoredUser();
        if (user?.role === "SUPER_ADMIN") {
            setIsSuperAdmin(true);
            fetchHospitals();
        }
        fetchPatients();
        fetchDoctorsAndCaregivers();
    }, []);

    useEffect(() => {
        fetchPatients(selectedHospital);
        fetchDoctorsAndCaregivers(selectedHospital);
    }, [selectedHospital]);

    const fetchHospitals = async () => {
        try {
            const data = await apiRequest<Hospital[]>({ method: "GET", path: "/admin/hospitals" });
            setHospitals(data);
        } catch (err) {
            console.error("Failed to load hospitals", err);
        }
    };

    const fetchDoctorsAndCaregivers = async (hospitalId?: string) => {
        try {
            const pathDocs = hospitalId ? `/admin/doctors?hospital_id=${hospitalId}` : "/admin/doctors";
            const docs = await apiRequest<Doctor[]>({ method: "GET", path: pathDocs });
            setDoctors(docs);

            const pathCgs = hospitalId ? `/admin/caregivers?hospital_id=${hospitalId}` : "/admin/caregivers";
            const cgs = await apiRequest<Caregiver[]>({ method: "GET", path: pathCgs });
            setCaregivers(cgs);
        } catch (err) {
            console.error("Failed to load doctors or caregivers", err);
        }
    };

    const fetchPatients = async (hospitalId?: string) => {
        try {
            setLoading(true);
            setError(null);
            const path = hospitalId ? `/admin/patients?hospital_id=${hospitalId}` : "/admin/patients";
            const data = await apiRequest<Patient[]>({ method: "GET", path });
            setPatients(data);
        } catch (err: any) {
            setError(err.message || "Failed to load patients");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePatient = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const body: any = {
                full_name: fullName,
                whatsapp_number: whatsappNumber,
                doctor_id: doctorId,
            };
            if (caregiverId) body.caregiver_id = caregiverId;
            if (dob) body.date_of_birth = dob;
            if (gender) body.gender = gender;
            if (bloodGroup) body.blood_group = bloodGroup;
            if (address) body.address = address;

            await apiRequest({
                method: "POST",
                path: "/admin/patients",
                body
            });
            setIsModalOpen(false);
            // Reset form
            setFullName(""); setWhatsappNumber(""); setDoctorId(""); setCaregiverId("");
            setDob(""); setGender(""); setBloodGroup(""); setAddress("");
            // Refresh list
            fetchPatients(selectedHospital);
        } catch (err: any) {
            setError(err.message || "Failed to create patient");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Heart className="text-[var(--brand-primary)]" size={26} />
                        Patient Management
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        View and add patients to the hospital platform.
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
                        Add Patient
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
                    <p className="text-gray-500 font-medium">Loading patients...</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Patient Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">WhatsApp</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Caregiver</th>
                                    {isSuperAdmin && (
                                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hospital</th>
                                    )}
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Added Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {patients.length === 0 ? (
                                    <tr>
                                        <td colSpan={isSuperAdmin ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                                            No patients found. Click "Add Patient" to create one.
                                        </td>
                                    </tr>
                                ) : (
                                    patients.map((patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                                                        <span className="text-rose-600 font-semibold text-sm">
                                                            {patient.full_name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{patient.full_name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Phone size={14} className="text-gray-400" />
                                                    {patient.whatsapp_number}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {patient.doctor_name ? (
                                                    <div className="flex items-center gap-1.5 text-sm font-medium text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full w-max">
                                                        <User size={14} />
                                                        {patient.doctor_name}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {patient.caregiver_name ? (
                                                    <span className="text-sm text-gray-700 font-medium">{patient.caregiver_name}</span>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">—</span>
                                                )}
                                            </td>
                                            {isSuperAdmin && (
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {patient.hospital_name}
                                                </td>
                                            )}
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(patient.created_at).toLocaleDateString()}
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
                                <h3 className="text-lg font-bold text-gray-900">Add New Patient</h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-5">
                                <form id="create-patient-form" onSubmit={handleCreatePatient} className="space-y-4">
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
                                                placeholder="Jane Doe"
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

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Assign Doctor
                                            </label>
                                            <select
                                                required
                                                value={doctorId}
                                                onChange={(e) => setDoctorId(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select a doctor</option>
                                                {doctors.map(d => (
                                                    <option key={d.id} value={d.id}>{d.full_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Link Caregiver <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                                            </label>
                                            <select
                                                value={caregiverId}
                                                onChange={(e) => setCaregiverId(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all appearance-none"
                                            >
                                                <option value="">No caregiver</option>
                                                {caregivers.map(cg => (
                                                    <option key={cg.id} value={cg.id}>{cg.full_name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Date of Birth <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={dob}
                                                onChange={(e) => setDob(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all"
                                            />
                                        </div>

                                        <div className="col-span-2 sm:col-span-1">
                                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                                                Gender <span className="text-gray-400 normal-case font-normal">(Optional)</span>
                                            </label>
                                            <select
                                                value={gender}
                                                onChange={(e) => setGender(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]/20 focus:border-[var(--brand-primary)] transition-all appearance-none"
                                            >
                                                <option value="" disabled>Select gender</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                                <option value="Other">Other</option>
                                            </select>
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
                                    form="create-patient-form"
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-2.5 bg-[var(--brand-primary)] text-white font-medium text-sm rounded-xl shadow-sm hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting ? <Loader2 size={16} className="animate-spin" /> : "Create Patient"}
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
