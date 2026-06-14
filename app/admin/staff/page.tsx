"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";
import { Loader2, Check, X, ShieldAlert, User, Mail, Calendar, ArrowRight, Activity } from "lucide-react";

interface PendingUser {
    id: string;
    email: string;
    full_name: string;
    hospital_id: string;
    role: string;
    is_active: boolean;
    created_at: string;
    affiliation_status: string;
}

export default function StaffAffiliationPage() {
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState<PendingUser[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    
    // Track processing status per user ID to disable buttons
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchPendingStaff = async () => {
        try {
            setLoading(true);
            const data = await apiRequest<PendingUser[]>({
                method: "GET",
                path: "/admin/pending-staff",
            });
            setStaff(data);
        } catch (err: any) {
            setError(err.message || "Failed to load pending staff affiliation requests.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingStaff();
    }, []);

    const handleApprove = async (userId: string) => {
        if (processingId) return;
        setProcessingId(userId);
        setError(null);
        setSuccessMsg(null);

        try {
            await apiRequest<any>({
                method: "POST",
                path: `/admin/approve-staff/${userId}`,
            });
            setSuccessMsg("Staff member approved successfully!");
            // Remove user from local state list
            setStaff((prev) => prev.filter((u) => u.id !== userId));
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to approve staff member.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: string) => {
        if (processingId) return;
        setProcessingId(userId);
        setError(null);
        setSuccessMsg(null);

        try {
            await apiRequest<any>({
                method: "POST",
                path: `/admin/reject-staff/${userId}`,
            });
            setSuccessMsg("Staff member affiliation rejected.");
            // Remove user from local state list
            setStaff((prev) => prev.filter((u) => u.id !== userId));
            setTimeout(() => setSuccessMsg(null), 4000);
        } catch (err: any) {
            setError(err.message || "Failed to reject staff member.");
        } finally {
            setProcessingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <div className="h-[calc(100vh-12rem)] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Loading affiliation queue...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            {/* Header section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Affiliations</h1>
                    <p className="text-sm text-gray-500 mt-2">
                        Manage doctors and caregivers requesting to access and update your hospital data space.
                    </p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl py-2 px-4 flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-700 font-mono">{staff.length}</span>
                    <span className="text-xs text-indigo-600 font-semibold uppercase tracking-wider">Pending</span>
                </div>
            </div>

            {/* Notifications */}
            {error && (
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl text-sm text-red-700 flex items-center gap-2">
                    <span className="font-semibold">Error:</span> {error}
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl text-sm text-emerald-700 flex items-center gap-2 animate-slide-down">
                    <span className="font-semibold">Success:</span> {successMsg}
                </div>
            )}

            {/* Request queue */}
            {staff.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center max-w-lg mx-auto space-y-4">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-gray-900">Affiliation Queue Clear</h3>
                        <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                            No doctors or caregivers are currently requesting affiliation with your hospital.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {staff.map((user) => {
                        const isUserProcessing = processingId === user.id;
                        return (
                            <div 
                                key={user.id} 
                                className="bg-white rounded-2xl border border-gray-200/85 hover:border-gray-300 shadow-sm hover:shadow-md transition-all p-5 flex flex-col md:flex-row md:items-center justify-between gap-6"
                            >
                                <div className="space-y-3">
                                    {/* User Details */}
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-gray-950">{user.full_name}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                                    user.role === "DOCTOR" 
                                                        ? "bg-blue-50 text-blue-700 border border-blue-100" 
                                                        : "bg-teal-50 text-teal-700 border border-teal-100"
                                                }`}>
                                                    {user.role}
                                                </span>
                                                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    {user.affiliation_status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata info */}
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-400">
                                        <span className="flex items-center gap-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            {user.email}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3.5 h-3.5" />
                                            Requested {formatDate(user.created_at)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                                    <button
                                        type="button"
                                        disabled={!!processingId}
                                        onClick={() => handleReject(user.id)}
                                        className="h-10 px-4 rounded-xl border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-100 disabled:opacity-50 text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer"
                                    >
                                        {isUserProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <X className="w-4 h-4" />
                                                Reject
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        disabled={!!processingId}
                                        onClick={() => handleApprove(user.id)}
                                        className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm hover:shadow active:translate-y-0.5 cursor-pointer"
                                    >
                                        {isUserProcessing ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="w-4 h-4" />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
