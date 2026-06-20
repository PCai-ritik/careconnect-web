"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest, getToken } from "@/lib/api";
import {
    Loader2,
    Building2,
    Users,
    Plus,
    Globe,
    Shield,
    Palette,
    Check,
    AlertCircle,
    X,
    Eye,
    EyeOff,
    Building,
    Edit,
    Trash2,
    Lock,
    Unlock,
    Upload,
    AlertTriangle,
    ChevronDown
} from "lucide-react";

interface Hospital {
    id: string;
    name: string;
    brand_color: string;
    logo_url: string | null;
    domain: string | null;
    subdomain: string | null;
    white_label_config: {
        platform_name?: string;
        primary_color?: string;
        logo_url?: string;
        [key: string]: any;
    };
    created_at: string;
}

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    hospital_id: string;
    role: string;
    is_active: boolean;
    created_at: string;
    affiliation_status: string;
}

export default function SuperControlsPage() {    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isEditPasswordVisible, setIsEditPasswordVisible] = useState(false);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter toggles
    const [activeTab, setActiveTab] = useState<"hospitals" | "admins">("hospitals");
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    
    // Lists state
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loadingLists, setLoadingLists] = useState(true);
    
    // Modal state (Create)
    const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
    const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

    // Modal state (Edit)
    const [isEditHospitalModalOpen, setIsEditHospitalModalOpen] = useState(false);
    const [isEditAdminModalOpen, setIsEditAdminModalOpen] = useState(false);
    const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
    const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);

    // Modal state (Delete)
    const [isDeleteHospitalModalOpen, setIsDeleteHospitalModalOpen] = useState(false);
    const [isDeleteAdminModalOpen, setIsDeleteAdminModalOpen] = useState(false);
    const [deletingHospital, setDeletingHospital] = useState<Hospital | null>(null);
    const [deletingAdmin, setDeletingAdmin] = useState<AdminUser | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    
    // Feedback messages
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Hospital form state (Create)
    const [hospName, setHospName] = useState("");
    const [hospBrandColor, setHospBrandColor] = useState("#4F46E5");
    const [hospDomain, setHospDomain] = useState("");
    const [hospSubdomain, setHospSubdomain] = useState("");
    const [hospPlatformName, setHospPlatformName] = useState("");
    const [hospLogoUrl, setHospLogoUrl] = useState("");
    const [submittingHospital, setSubmittingHospital] = useState(false);

    // Hospital form state (Edit)
    const [editHospName, setEditHospName] = useState("");
    const [editHospBrandColor, setEditHospBrandColor] = useState("#4F46E5");
    const [editHospDomain, setEditHospDomain] = useState("");
    const [editHospSubdomain, setEditHospSubdomain] = useState("");
    const [editHospPlatformName, setEditHospPlatformName] = useState("");
    const [editHospLogoUrl, setEditHospLogoUrl] = useState("");
    const [submittingEditHospital, setSubmittingEditHospital] = useState(false);

    // Admin form state (Create)
    const [adminEmail, setAdminEmail] = useState("");
    const [adminFullName, setAdminFullName] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [adminHospitalId, setAdminHospitalId] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [submittingAdmin, setSubmittingAdmin] = useState(false);

    // Admin form state (Edit)
    const [editAdminEmail, setEditAdminEmail] = useState("");
    const [editAdminFullName, setEditAdminFullName] = useState("");
    const [editAdminPassword, setEditAdminPassword] = useState("");
    const [editAdminHospitalId, setEditAdminHospitalId] = useState("");
    const [editAdminIsActive, setEditAdminIsActive] = useState(true);
    const [showEditPassword, setShowEditPassword] = useState(false);
    const [submittingEditAdmin, setSubmittingEditAdmin] = useState(false);

    // Delete submission states
    const [submittingDeleteHospital, setSubmittingDeleteHospital] = useState(false);
    const [submittingDeleteAdmin, setSubmittingDeleteAdmin] = useState(false);

    // Upload states
    const [createLogoUploading, setCreateLogoUploading] = useState(false);
    const [editLogoUploading, setEditLogoUploading] = useState(false);

    // Fetch lists
    const fetchData = async () => {
        setLoadingLists(true);
        setError(null);
        try {
            const fetchedHospitals = await apiRequest<Hospital[]>({
                method: "GET",
                path: "/admin/hospitals"
            });
            setHospitals(fetchedHospitals);

            const fetchedAdmins = await apiRequest<AdminUser[]>({
                method: "GET",
                path: "/admin/admins"
            });
            setAdmins(fetchedAdmins);
        } catch (err: any) {
            setError(err.message || "Failed to fetch platform configuration data.");
        } finally {
            setLoadingLists(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Logo Upload handler
    const handleLogoUpload = async (file: File, isEdit: boolean) => {
        const token = getToken();
        if (!token) {
            setError("Authentication token not found. Please log in.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        if (isEdit) {
            setEditLogoUploading(true);
        } else {
            setCreateLogoUploading(true);
        }
        setError(null);

        try {
            const data = await apiRequest<{ logo_url: string }>({
                method: "POST",
                path: "/admin/upload-logo",
                body: formData
            });

            if (isEdit) {
                setEditHospLogoUrl(data.logo_url);
            } else {
                setHospLogoUrl(data.logo_url);
            }
        } catch (err: any) {
            setError(err.message || "Logo upload failed.");
        } finally {
            setEditLogoUploading(false);
            setCreateLogoUploading(false);
        }
    };

    // Create Hospital Handler
    const handleCreateHospital = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!hospName.trim()) {
            setError("Hospital Name is required.");
            return;
        }

        setSubmittingHospital(true);
        setError(null);
        setSuccess(null);

        try {
            const body = {
                name: hospName.trim(),
                brand_color: hospBrandColor,
                logo_url: hospLogoUrl.trim() || null,
                domain: hospDomain.trim() || null,
                subdomain: hospSubdomain.trim() || null,
                white_label_config: {
                    platform_name: hospPlatformName.trim() || hospName.trim(),
                    primary_color: hospBrandColor,
                    logo_url: hospLogoUrl.trim() || null
                }
            };

            const newHosp = await apiRequest<Hospital>({
                method: "POST",
                path: "/admin/hospitals",
                body: body as any
            });

            setHospitals((prev) => [...prev, newHosp].sort((a, b) => a.name.localeCompare(b.name)));
            setSuccess(`Hospital "${newHosp.name}" created successfully!`);
            setIsHospitalModalOpen(false);
            
            // Reset form
            setHospName("");
            setHospBrandColor("#4F46E5");
            setHospDomain("");
            setHospSubdomain("");
            setHospPlatformName("");
            setHospLogoUrl("");

            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to create hospital.");
        } finally {
            setSubmittingHospital(false);
        }
    };

    // Edit Hospital Handler
    const handleUpdateHospital = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHospital) return;
        if (!editHospName.trim()) {
            setError("Hospital Name is required.");
            return;
        }

        setSubmittingEditHospital(true);
        setError(null);
        setSuccess(null);

        try {
            const body = {
                name: editHospName.trim(),
                brand_color: editHospBrandColor,
                logo_url: editHospLogoUrl.trim() || null,
                domain: editHospDomain.trim() || null,
                subdomain: editHospSubdomain.trim() || null,
                white_label_config: {
                    platform_name: editHospPlatformName.trim() || editHospName.trim(),
                    primary_color: editHospBrandColor,
                    logo_url: editHospLogoUrl.trim() || null
                }
            };

            const updatedHosp = await apiRequest<Hospital>({
                method: "PUT",
                path: `/admin/hospitals/${editingHospital.id}`,
                body: body as any
            });

            setHospitals((prev) => prev.map((h) => h.id === updatedHosp.id ? updatedHosp : h));
            setSuccess(`Hospital "${updatedHosp.name}" updated successfully!`);
            setIsEditHospitalModalOpen(false);
            setEditingHospital(null);

            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to update hospital.");
        } finally {
            setSubmittingEditHospital(false);
        }
    };

    // Delete Hospital Handler (Cascade)
    const handleDeleteHospital = async () => {
        if (!deletingHospital) return;

        setSubmittingDeleteHospital(true);
        setError(null);
        setSuccess(null);

        try {
            await apiRequest({
                method: "DELETE",
                path: `/admin/hospitals/${deletingHospital.id}`
            });

            setHospitals((prev) => prev.filter((h) => h.id !== deletingHospital.id));
            setAdmins((prev) => prev.filter((a) => a.hospital_id !== deletingHospital.id));
            setSuccess(`Hospital "${deletingHospital.name}" and all associated data deleted successfully!`);
            setIsDeleteHospitalModalOpen(false);
            setDeletingHospital(null);
            setDeleteConfirmText("");

            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to delete hospital.");
        } finally {
            setSubmittingDeleteHospital(false);
        }
    };

    // Create Admin Handler
    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminEmail.trim() || !adminFullName.trim() || !adminPassword.trim() || !adminHospitalId) {
            setError("All fields are required.");
            return;
        }
        if (adminPassword.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setSubmittingAdmin(true);
        setError(null);
        setSuccess(null);

        try {
            const body = {
                email: adminEmail.trim(),
                full_name: adminFullName.trim(),
                password: adminPassword,
                hospital_id: adminHospitalId
            };

            const newAdmin = await apiRequest<AdminUser>({
                method: "POST",
                path: "/admin/admins",
                body: body as any
            });

            setAdmins((prev) => [...prev, newAdmin].sort((a, b) => a.email.localeCompare(b.email)));
            setSuccess(`Administrator account for "${newAdmin.email}" created successfully!`);
            setIsAdminModalOpen(false);

            // Reset form
            setAdminEmail("");
            setAdminFullName("");
            setAdminPassword("");
            setAdminHospitalId("");
            setShowPassword(false);

            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to create administrator account.");
        } finally {
            setSubmittingAdmin(false);
        }
    };

    // Edit Admin Handler
    const handleUpdateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAdmin) return;
        if (!editAdminEmail.trim() || !editAdminFullName.trim() || !editAdminHospitalId) {
            setError("All fields except password are required.");
            return;
        }

        setSubmittingEditAdmin(true);
        setError(null);
        setSuccess(null);

        try {
            const body: any = {
                email: editAdminEmail.trim(),
                full_name: editAdminFullName.trim(),
                hospital_id: editAdminHospitalId,
                is_active: editAdminIsActive
            };
            if (editAdminPassword.trim()) {
                if (editAdminPassword.length < 6) {
                    setError("Password must be at least 6 characters.");
                    setSubmittingEditAdmin(false);
                    return;
                }
                body.password = editAdminPassword;
            }

            const updatedAdmin = await apiRequest<AdminUser>({
                method: "PUT",
                path: `/admin/admins/${editingAdmin.id}`,
                body
            });

            setAdmins((prev) => prev.map((a) => a.id === updatedAdmin.id ? updatedAdmin : a));
            setSuccess(`Administrator account for "${updatedAdmin.email}" updated successfully!`);
            setIsEditAdminModalOpen(false);
            setEditingAdmin(null);
            setEditAdminPassword("");

            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to update administrator account.");
        } finally {
            setSubmittingEditAdmin(false);
        }
    };

    // Revoke/Restore Admin Active state Handler
    const handleToggleAdminStatus = async (admin: AdminUser) => {
        setError(null);
        setSuccess(null);
        try {
            const body = {
                is_active: !admin.is_active
            };
            const updatedAdmin = await apiRequest<AdminUser>({
                method: "PUT",
                path: `/admin/admins/${admin.id}`,
                body
            });
            setAdmins((prev) => prev.map((a) => a.id === updatedAdmin.id ? updatedAdmin : a));
            setSuccess(`Administrator account for "${updatedAdmin.email}" ${updatedAdmin.is_active ? "restored" : "revoked"} successfully!`);
            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to toggle administrator status.");
        }
    };

    // Delete Admin Handler
    const handleDeleteAdmin = async () => {
        if (!deletingAdmin) return;

        setSubmittingDeleteAdmin(true);
        setError(null);
        setSuccess(null);

        try {
            await apiRequest({
                method: "DELETE",
                path: `/admin/admins/${deletingAdmin.id}`
            });

            setAdmins((prev) => prev.filter((a) => a.id !== deletingAdmin.id));
            setSuccess(`Administrator account deleted successfully!`);
            setIsDeleteAdminModalOpen(false);
            setDeletingAdmin(null);

            setTimeout(() => setSuccess(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to delete administrator account.");
        } finally {
            setSubmittingDeleteAdmin(false);
        }
    };

    const getHospitalName = (id: string) => {
        const h = hospitals.find((hosp) => hosp.id === id);
        return h ? h.name : "Unknown Hospital";
    };

    if (loadingLists) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Loading platform controls...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
                        Super Controls
                    </h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Global control center for platform administration. Register and configure hospitals and set up their tenant admins.
                    </p>
                </div>
                
                {/* Actions */}
                <div className="flex items-center gap-3 relative z-30">
                    <button
                        onClick={() => setIsDropdownOpen((prev) => !prev)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium shadow-md shadow-indigo-150 transition-all duration-200 cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Add New
                        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    <AnimatePresence>
                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setIsDropdownOpen(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-[110%] w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
                                >
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setIsHospitalModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                        New Hospital
                                    </button>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setIsAdminModalOpen(true);
                                            setIsDropdownOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                                    >
                                        <Users className="w-4 h-4 text-gray-400" />
                                        New Admin Account
                                    </button>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-sm text-red-700 flex items-center gap-2.5 animate-slide-down">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    <span><span className="font-semibold">Action Failed:</span> {error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
            {success && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl text-sm text-emerald-700 flex items-center gap-2.5 animate-slide-down">
                    <Check className="w-5 h-5 shrink-0 text-emerald-500" />
                    <span><span className="font-semibold">Success:</span> {success}</span>
                    <button onClick={() => setSuccess(null)} className="ml-auto text-emerald-400 hover:text-emerald-600 cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab("hospitals")}
                    className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-semibold text-sm transition-all duration-200 cursor-pointer ${
                        activeTab === "hospitals"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                >
                    <Building2 className="w-4 h-4" />
                    Hospital Tenants ({hospitals.length})
                </button>
                <button
                    onClick={() => setActiveTab("admins")}
                    className={`flex items-center gap-2 px-6 py-3.5 border-b-2 font-semibold text-sm transition-all duration-200 cursor-pointer ${
                        activeTab === "admins"
                            ? "border-indigo-600 text-indigo-600"
                            : "border-transparent text-gray-500 hover:text-gray-900"
                    }`}
                >
                    <Users className="w-4 h-4" />
                    Platform Admins ({admins.length})
                </button>
            </div>

            {/* Content Lists */}
            {activeTab === "hospitals" ? (
                <div className="bg-white border border-gray-200/80 rounded-2xl overflow-visible shadow-sm">
                    {hospitals.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-semibold text-gray-700">No Hospitals Registered</p>
                            <p className="text-sm mt-1">Get started by creating the first hospital tenant using the buttons above.</p>
                        </div>
                    ) : (
                        <div className="overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 rounded-tl-2xl">Hospital Name</th>
                                        <th className="px-6 py-4">Brand Config</th>
                                        <th className="px-6 py-4">Custom Domain</th>
                                        <th className="px-6 py-4">Subdomain</th>
                                        <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 text-sm text-gray-750">
                                    {hospitals.map((hosp) => (
                                        <tr key={hosp.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-gray-100 last:border-0">
                                            <td className="px-6 py-4 font-semibold text-gray-900">
                                                {hosp.name}
                                                {hosp.id === "00000000-0000-4000-8000-000000000001" && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100" title="CareConnect Platform">
                                                        CC
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span
                                                        className="w-3.5 h-3.5 rounded-full border border-black/10 inline-block shrink-0"
                                                        style={{ backgroundColor: hosp.brand_color }}
                                                    />
                                                    <span className="font-mono text-xs">{hosp.brand_color.toUpperCase()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {hosp.domain ? (
                                                    <span className="inline-flex items-center gap-1 text-slate-800 font-medium">
                                                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                                                        {hosp.domain}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Not configured</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {hosp.subdomain ? (
                                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded-md text-xs font-mono">
                                                        {hosp.subdomain}.careconnect.com
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs italic">Not configured</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {hosp.id !== "00000000-0000-4000-8000-000000000001" ? (
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            onClick={() => setOpenDropdownId(openDropdownId === hosp.id ? null : hosp.id)}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all"
                                                        >
                                                            Actions
                                                            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdownId === hosp.id ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        <AnimatePresence>
                                                            {openDropdownId === hosp.id && (
                                                                <>
                                                                    <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                                                                    <motion.div
                                                                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                        exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                        transition={{ duration: 0.15 }}
                                                                        className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-40 overflow-hidden origin-top-right divide-y divide-gray-100"
                                                                    >
                                                                        <div className="p-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenDropdownId(null);
                                                                                    setEditingHospital(hosp);
                                                                                    setEditHospName(hosp.name);
                                                                                    setEditHospBrandColor(hosp.brand_color);
                                                                                    setEditHospDomain(hosp.domain || "");
                                                                                    setEditHospSubdomain(hosp.subdomain || "");
                                                                                    setEditHospPlatformName(hosp.white_label_config.platform_name || hosp.name);
                                                                                    setEditHospLogoUrl(hosp.white_label_config.logo_url || "");
                                                                                    setIsEditHospitalModalOpen(true);
                                                                                }}
                                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                                                                            >
                                                                                <Edit className="w-4 h-4" /> Edit Tenant
                                                                            </button>
                                                                        </div>
                                                                        <div className="p-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenDropdownId(null);
                                                                                    setDeletingHospital(hosp);
                                                                                    setDeleteConfirmText("");
                                                                                    setIsDeleteHospitalModalOpen(true);
                                                                                }}
                                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" /> Delete Tenant
                                                                            </button>
                                                                        </div>
                                                                    </motion.div>
                                                                </>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                ) : (
                                                    <span className="p-1.5 text-gray-300 inline-flex items-center" title="Platform Tenant Cannot Be Modified">
                                                        <Lock className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white border border-gray-200/80 rounded-2xl overflow-visible shadow-sm">
                    {admins.length === 0 ? (
                        <div className="p-16 text-center text-gray-500">
                            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="font-semibold text-gray-700">No Administrators Configured</p>
                            <p className="text-sm mt-1">Create administrator accounts to link them with hospital tenants.</p>
                        </div>
                    ) : (
                        <div className="overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <th className="px-6 py-4 rounded-tl-2xl">Administrator</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Assigned Tenant Hospital</th>
                                        <th className="px-6 py-4">Account Status</th>
                                        <th className="px-6 py-4 text-right rounded-tr-2xl">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-150 text-sm text-gray-750">
                                    {admins.map((admin) => (
                                        <tr key={admin.id} className="hover:bg-slate-50 transition-colors duration-150 border-b border-gray-100 last:border-0">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{admin.full_name}</span>
                                                    <span className="text-xs text-gray-400 font-mono mt-0.5">{admin.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                                    admin.role === "SUPER_ADMIN"
                                                        ? "bg-purple-50 text-purple-700 border-purple-100"
                                                        : "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                }`}>
                                                    {admin.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 font-medium text-gray-800">
                                                    <Building className="w-3.5 h-3.5 text-slate-400" />
                                                    {getHospitalName(admin.hospital_id)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                                    admin.is_active ? "text-emerald-600" : "text-gray-400"
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${admin.is_active ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                                                    {admin.is_active ? "Active" : "Disabled"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative inline-block text-left">
                                                    <button
                                                        onClick={() => setOpenDropdownId(openDropdownId === admin.id ? null : admin.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg shadow-sm transition-all"
                                                    >
                                                        Actions
                                                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdownId === admin.id ? 'rotate-180' : ''}`} />
                                                    </button>
                                                    <AnimatePresence>
                                                        {openDropdownId === admin.id && (
                                                            <>
                                                                <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -5, scale: 0.95 }}
                                                                    transition={{ duration: 0.15 }}
                                                                    className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-40 overflow-hidden origin-top-right divide-y divide-gray-100"
                                                                >
                                                                    <div className="p-1">
                                                                        <button
                                                                            onClick={() => {
                                                                                setOpenDropdownId(null);
                                                                                setEditingAdmin(admin);
                                                                                setEditAdminEmail(admin.email);
                                                                                setEditAdminFullName(admin.full_name);
                                                                                setEditAdminHospitalId(admin.hospital_id);
                                                                                setEditAdminIsActive(admin.is_active);
                                                                                setEditAdminPassword("");
                                                                                setIsEditAdminModalOpen(true);
                                                                            }}
                                                                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition-colors"
                                                                        >
                                                                            <Edit className="w-4 h-4" /> Edit Admin
                                                                        </button>
                                                                    </div>
                                                                    {admin.email !== "admin@careconnect.com" && (
                                                                        <div className="p-1">
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenDropdownId(null);
                                                                                    handleToggleAdminStatus(admin);
                                                                                }}
                                                                                className={`flex w-full items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                                                                                    admin.is_active
                                                                                        ? "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
                                                                                        : "text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                                                                                }`}
                                                                            >
                                                                                {admin.is_active ? (
                                                                                    <><Lock className="w-4 h-4" /> Revoke Access</>
                                                                                ) : (
                                                                                    <><Unlock className="w-4 h-4" /> Restore Access</>
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    setOpenDropdownId(null);
                                                                                    setDeletingAdmin(admin);
                                                                                    setIsDeleteAdminModalOpen(true);
                                                                                }}
                                                                                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" /> Delete Admin
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </motion.div>
                                                            </>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ─── HOSPITAL CREATION MODAL ─── */}
            {isHospitalModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                Create Hospital Tenant
                            </h3>
                            <button
                                onClick={() => setIsHospitalModalOpen(false)}
                                className="p-1.5 hover:bg-gray-200/70 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateHospital} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={hospName}
                                    onChange={(e) => setHospName(e.target.value)}
                                    placeholder="e.g. St. Jude General Hospital"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={hospBrandColor}
                                            onChange={(e) => setHospBrandColor(e.target.value)}
                                            className="w-11 h-11 bg-transparent border-0 cursor-pointer shrink-0 rounded-xl overflow-hidden p-0"
                                        />
                                        <input
                                            type="text"
                                            value={hospBrandColor.toUpperCase()}
                                            onChange={(e) => setHospBrandColor(e.target.value)}
                                            placeholder="#4F46E5"
                                            maxLength={7}
                                            className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subdomain Prefix</label>
                                    <input
                                        type="text"
                                        value={hospSubdomain}
                                        onChange={(e) => setHospSubdomain(e.target.value)}
                                        placeholder="e.g. stjude"
                                        className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Domain (Optional)</label>
                                <input
                                    type="text"
                                    value={hospDomain}
                                    onChange={(e) => setHospDomain(e.target.value)}
                                    placeholder="e.g. patients.stjudehospital.org"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-mono"
                                />
                            </div>

                            <div className="border-t border-gray-150 pt-4 mt-2 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Palette className="w-3.5 h-3.5 text-indigo-500" />
                                    White Label Branding Config
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Title</label>
                                        <input
                                            type="text"
                                            value={hospPlatformName}
                                            onChange={(e) => setHospPlatformName(e.target.value)}
                                            placeholder="e.g. St. Jude Connect"
                                            className="w-full h-10 bg-slate-50 border border-gray-200/80 rounded-xl px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo Upload</label>
                                        {createLogoUploading ? (
                                            <div className="w-full h-10 bg-slate-50 border border-gray-200/80 border-dashed rounded-xl flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                                <span className="text-xs text-gray-400">Uploading logo...</span>
                                            </div>
                                        ) : hospLogoUrl ? (
                                            <div className="w-full h-10 bg-slate-50 border border-gray-200/80 rounded-xl px-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={hospLogoUrl} alt="Logo Preview" className="h-6 w-auto object-contain rounded" />
                                                    <span className="text-xs text-gray-500 font-mono truncate">{hospLogoUrl.split('/').pop()}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setHospLogoUrl("")}
                                                    className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-10 bg-slate-50 hover:bg-slate-100 border border-gray-200/80 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors">
                                                <Upload className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500 font-medium font-sans">Upload logo image</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleLogoUpload(file, false);
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsHospitalModalOpen(false)}
                                    className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingHospital}
                                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-75"
                                >
                                    {submittingHospital ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Tenant"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── HOSPITAL EDITING MODAL ─── */}
            {isEditHospitalModalOpen && editingHospital && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-indigo-600" />
                                Edit Hospital Tenant
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditHospitalModalOpen(false);
                                    setEditingHospital(null);
                                }}
                                className="p-1.5 hover:bg-gray-200/70 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateHospital} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Hospital Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editHospName}
                                    onChange={(e) => setEditHospName(e.target.value)}
                                    placeholder="e.g. St. Jude General Hospital"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Brand Color</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            value={editHospBrandColor}
                                            onChange={(e) => setEditHospBrandColor(e.target.value)}
                                            className="w-11 h-11 bg-transparent border-0 cursor-pointer shrink-0 rounded-xl overflow-hidden p-0"
                                        />
                                        <input
                                            type="text"
                                            value={editHospBrandColor.toUpperCase()}
                                            onChange={(e) => setEditHospBrandColor(e.target.value)}
                                            placeholder="#4F46E5"
                                            maxLength={7}
                                            className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subdomain Prefix</label>
                                    <input
                                        type="text"
                                        value={editHospSubdomain}
                                        onChange={(e) => setEditHospSubdomain(e.target.value)}
                                        placeholder="e.g. stjude"
                                        className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-mono"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Custom Domain (Optional)</label>
                                <input
                                    type="text"
                                    value={editHospDomain}
                                    onChange={(e) => setEditHospDomain(e.target.value)}
                                    placeholder="e.g. patients.stjudehospital.org"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-mono"
                                />
                            </div>

                            <div className="border-t border-gray-150 pt-4 mt-2 space-y-3">
                                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Palette className="w-3.5 h-3.5 text-indigo-500" />
                                    White Label Branding Config
                                </h4>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Platform Title</label>
                                        <input
                                            type="text"
                                            value={editHospPlatformName}
                                            onChange={(e) => setEditHospPlatformName(e.target.value)}
                                            placeholder="e.g. St. Jude Connect"
                                            className="w-full h-10 bg-slate-50 border border-gray-200/80 rounded-xl px-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Logo Upload</label>
                                        {editLogoUploading ? (
                                            <div className="w-full h-10 bg-slate-50 border border-gray-200/80 border-dashed rounded-xl flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                                                <span className="text-xs text-gray-400">Uploading logo...</span>
                                            </div>
                                        ) : editHospLogoUrl ? (
                                            <div className="w-full h-10 bg-slate-50 border border-gray-200/80 rounded-xl px-3 flex items-center justify-between">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <img src={editHospLogoUrl} alt="Logo Preview" className="h-6 w-auto object-contain rounded" />
                                                    <span className="text-xs text-gray-500 font-mono truncate">{editHospLogoUrl.split('/').pop()}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditHospLogoUrl("")}
                                                    className="p-1 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-full cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative w-full h-10 bg-slate-50 hover:bg-slate-100 border border-gray-200/80 border-dashed rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors">
                                                <Upload className="w-4 h-4 text-gray-400" />
                                                <span className="text-xs text-gray-500 font-medium font-sans">Upload logo image</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) handleLogoUpload(file, true);
                                                    }}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditHospitalModalOpen(false);
                                        setEditingHospital(null);
                                    }}
                                    className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingEditHospital}
                                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-75"
                                >
                                    {submittingEditHospital ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── HOSPITAL DELETION CONFIRMATION MODAL (RED ZONE GUARDRAIL) ─── */}
            {isDeleteHospitalModalOpen && deletingHospital && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-red-100 overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-red-50 bg-red-50/50">
                            <h3 className="font-bold text-red-900 text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Delete Hospital Tenant
                            </h3>
                            <button
                                onClick={() => {
                                    setIsDeleteHospitalModalOpen(false);
                                    setDeletingHospital(null);
                                    setDeleteConfirmText("");
                                }}
                                className="p-1.5 hover:bg-red-100 text-red-400 hover:text-red-700 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Danger warning box */}
                            <div className="p-4 bg-red-50 rounded-2xl border border-red-100 space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-red-900 text-sm">Critical: Red Zone Area</h4>
                                        <p className="text-xs text-red-700 mt-0.5 leading-relaxed">
                                            This action is permanent and cannot be undone. Deleting the hospital tenant <span className="font-semibold">{deletingHospital.name}</span> will immediately cascade and delete all associated data across the platform.
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-red-200/60 pt-3">
                                    <p className="text-xs font-extrabold text-red-800 uppercase tracking-wide mb-2">The following resources will be permanently destroyed:</p>
                                    <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-red-700 list-disc pl-4 font-medium">
                                        <li>Administrator & Staff Users</li>
                                        <li>Doctor Profiles & Schedules</li>
                                        <li>Caregiver Profiles</li>
                                        <li>Patient Records</li>
                                        <li>All Appointments & Availabilities</li>
                                        <li>Medical Records & History</li>
                                        <li>Prescriptions & Doctor Notes</li>
                                        <li>Video Sessions & Chat History</li>
                                        <li>AI Call Summaries</li>
                                        <li>Payment Transactions</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                                    To confirm deletion, type: <span className="text-red-600 font-mono select-all">I want to delete {deletingHospital.name}</span>
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder={`I want to delete ${deletingHospital.name}`}
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/10 focus:border-red-600 focus:bg-white transition-all font-mono"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDeleteHospitalModalOpen(false);
                                        setDeletingHospital(null);
                                        setDeleteConfirmText("");
                                    }}
                                    className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteHospital}
                                    disabled={deleteConfirmText !== `I want to delete ${deletingHospital.name}` || submittingDeleteHospital}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed shadow-md hover:shadow-red-100 disabled:shadow-none"
                                >
                                    {submittingDeleteHospital ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting Tenant...
                                        </>
                                    ) : (
                                        "Delete Hospital & All Data"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ─── ADMIN ACCOUNT CREATION MODAL ─── */}
            {isAdminModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Create Hospital Admin
                            </h3>
                            <button
                                onClick={() => setIsAdminModalOpen(false)}
                                className="p-1.5 hover:bg-gray-200/70 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Hospital *</label>
                                <select
                                    required
                                    value={adminHospitalId}
                                    onChange={(e) => setAdminHospitalId(e.target.value)}
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                >
                                    <option value="">-- Choose Hospital --</option>
                                    {hospitals.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name} {h.id === "00000000-0000-4000-8000-000000000001" ? "(CareConnect)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={adminFullName}
                                    onChange={(e) => setAdminFullName(e.target.value)}
                                    placeholder="e.g. Dr. Arthur Pendelton"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    value={adminEmail}
                                    onChange={(e) => setAdminEmail(e.target.value)}
                                    placeholder="e.g. arthur@stjudehospital.org"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-mono"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password *</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={adminPassword}
                                        onChange={(e) => setAdminPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsAdminModalOpen(false)}
                                    className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingAdmin}
                                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-75"
                                >
                                    {submittingAdmin ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Account"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── ADMIN ACCOUNT EDITING MODAL ─── */}
            {isEditAdminModalOpen && editingAdmin && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                Edit Hospital Admin
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditAdminModalOpen(false);
                                    setEditingAdmin(null);
                                }}
                                className="p-1.5 hover:bg-gray-200/70 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Select Hospital *</label>
                                <select
                                    required
                                    disabled={editingAdmin.email === "admin@careconnect.com"}
                                    value={editAdminHospitalId}
                                    onChange={(e) => setEditAdminHospitalId(e.target.value)}
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {hospitals.map((h) => (
                                        <option key={h.id} value={h.id}>
                                            {h.name} {h.id === "00000000-0000-4000-8000-000000000001" ? "(CareConnect)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={editAdminFullName}
                                    onChange={(e) => setEditAdminFullName(e.target.value)}
                                    placeholder="Dr. Arthur Pendelton"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address *</label>
                                <input
                                    type="email"
                                    required
                                    disabled={editingAdmin.email === "admin@careconnect.com"}
                                    value={editAdminEmail}
                                    onChange={(e) => setEditAdminEmail(e.target.value)}
                                    placeholder="arthur@stjudehospital.org"
                                    className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all font-mono disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                                    <span>New Password</span>
                                    <span className="text-xs text-gray-400 normal-case font-normal">(Leave blank to keep current)</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showEditPassword ? "text" : "password"}
                                        value={editAdminPassword}
                                        onChange={(e) => setEditAdminPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full h-11 bg-slate-50 border border-gray-200/80 rounded-xl pl-4 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/10 focus:border-indigo-600 focus:bg-white transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowEditPassword(!showEditPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    >
                                        {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <input
                                    type="checkbox"
                                    id="editAdminIsActiveCheckbox"
                                    disabled={editingAdmin.email === "admin@careconnect.com"}
                                    checked={editAdminIsActive}
                                    onChange={(e) => setEditAdminIsActive(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 disabled:opacity-75 disabled:cursor-not-allowed"
                                />
                                <label htmlFor="editAdminIsActiveCheckbox" className="text-sm font-semibold text-gray-700 select-none cursor-pointer disabled:opacity-75">
                                    Account Enabled (Active status)
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsEditAdminModalOpen(false);
                                        setEditingAdmin(null);
                                        setEditAdminPassword("");
                                    }}
                                    className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingEditAdmin}
                                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-75"
                                >
                                    {submittingEditAdmin ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── ADMIN DELETION CONFIRMATION MODAL ─── */}
            {isDeleteAdminModalOpen && deletingAdmin && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-scale-up">
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-slate-50">
                            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Delete Admin Account
                            </h3>
                            <button
                                onClick={() => {
                                    setIsDeleteAdminModalOpen(false);
                                    setDeletingAdmin(null);
                                }}
                                className="p-1.5 hover:bg-gray-200/70 rounded-full text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <p className="text-sm text-gray-650 leading-relaxed">
                                Are you sure you want to delete the administrator account for <span className="font-bold text-gray-900">{deletingAdmin.full_name}</span> (<span className="font-mono text-xs">{deletingAdmin.email}</span>)?
                            </p>
                            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-xl p-3 flex gap-2">
                                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <span>This will remove this user&apos;s administrative access and delete their linked user profile. This action cannot be undone.</span>
                            </p>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsDeleteAdminModalOpen(false);
                                        setDeletingAdmin(null);
                                    }}
                                    className="px-4 py-2 border border-gray-250 hover:bg-slate-50 text-gray-600 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteAdmin}
                                    disabled={submittingDeleteAdmin}
                                    className="flex items-center gap-2 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer disabled:opacity-75"
                                >
                                    {submittingDeleteAdmin ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        "Delete Account"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
