"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Activity, Home, Calendar, Users, CreditCard, Settings, LogOut, User,
} from "lucide-react";
import LogoutModal from "@/components/dashboard/LogoutModal";
import { getDoctorProfile, type DoctorProfile } from "@/lib/dashboard";
import { useBranding } from "@/hooks/useBranding";

const navLinks = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Schedule", icon: Calendar, href: "/dashboard/schedule" },
    { label: "Patients", icon: Users, href: "/dashboard/patients" },
    // { label: "Earnings", icon: CreditCard, href: "/dashboard/earnings" },  // Hidden until Razorpay integration
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const branding = useBranding();

    useEffect(() => {
        getDoctorProfile()
            .then(setProfile)
            .catch(() => { }); // Keep defaults on error
    }, []);

    const displayName = profile?.full_name || "Doctor";
    const specialization = profile?.specialization || "—";

    return (
        <>
            <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-20">
                {/* ── Brand Header ── */}
                <div className="flex items-center gap-2.5 px-6 pt-6 pb-4">
                    <div className="h-8 w-8 bg-transparent flex items-center justify-center shrink-0">
                        <div 
                            className="w-full h-full object-contain bg-center bg-contain bg-no-repeat"
                            style={{ 
                                backgroundImage: "var(--brand-logo)",
                                display: "var(--show-custom-logo, none)"
                            }}
                        />
                        <Activity 
                            className="h-5 w-5 text-indigo-600"
                            style={{ display: "var(--show-default-logo, block)" }}
                        />
                    </div>
                    <span 
                        className="text-lg font-semibold text-gray-900 leading-tight break-words after:content-[var(--brand-name-content,'CareConnect')]" 
                        title={branding.name}
                    ></span>
                </div>

                {/* ── Navigation Links ── */}
                <nav className="flex-1 flex flex-col space-y-1.5 mt-2 px-4">
                    {navLinks.map(({ label, icon: Icon, href }) => {
                        const isActive =
                            pathname === href ||
                            (href !== "/dashboard" && pathname.startsWith(href + "/"));

                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${isActive
                                    ? "bg-[var(--brand-primary)] text-white shadow-md rounded-xl font-medium"
                                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-100/80 rounded-xl"
                                    }`}
                            >
                                <Icon className="h-5 w-5" />
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── User Profile Snippet ── */}
                <div className="mt-auto border-t border-gray-200/60 pt-4 p-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-[rgba(var(--brand-primary-rgb),0.1)] flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                            <User size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">Dr. {displayName}</p>
                            <p className="text-xs text-gray-400 truncate">{specialization}</p>
                        </div>
                        {/* Logout button — opens LogoutModal */}
                        <button
                            type="button"
                            onClick={() => setIsLogoutOpen(true)}
                            className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                            title="Log out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* LogoutModal rendered outside aside so z-index works correctly */}
            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
        </>
    );
}
