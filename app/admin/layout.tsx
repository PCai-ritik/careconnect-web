"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Shield, Palette, Users, LogOut, Settings, Stethoscope, Heart, HandHeart } from "lucide-react";
import { getToken } from "@/lib/api";
import { getMe } from "@/lib/auth";
import LogoutModal from "@/components/dashboard/LogoutModal";
import ThemeInitializer from "@/components/ThemeInitializer";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [checked, setChecked] = useState(false);
    const [isLogoutOpen, setIsLogoutOpen] = useState(false);
    const [adminName, setAdminName] = useState("Admin");
    const [userRole, setUserRole] = useState("");

    useEffect(() => {
        const checkAdmin = async () => {
            const token = getToken();
            if (!token) {
                router.replace("/login");
                return;
            }

            try {
                const user = await getMe();
                if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {
                    router.replace("/login");
                    return;
                }
                setAdminName(user.full_name || "Admin");
                setUserRole(user.role);
                setChecked(true);
            } catch (err) {
                router.replace("/login");
            }
        };

        checkAdmin();
    }, [router]);

    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--brand-primary)] rounded-full animate-spin" />
                    <span className="text-sm text-gray-500 font-medium">Verifying admin access...</span>
                </div>
            </div>
        );
    }

    const navLinks = [
        { label: "Branding Config", icon: Palette, href: "/admin/branding" },
        { label: "Staff Affiliations", icon: Users, href: "/admin/staff" },
        { label: "Doctors", icon: Stethoscope, href: "/admin/doctors" },
    ];

    if (userRole === "SUPER_ADMIN") {
        navLinks.push({ label: "Super Controls", icon: Settings, href: "/admin/super" });
    }

    return (
        <>
            <ThemeInitializer />
            <div className="flex min-h-screen bg-[#F8FAFC] ">
                {/* ── Admin Sidebar ── */}
                <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-20">
                    <div className="flex items-center gap-2.5 px-6 pt-6 pb-4 overflow-hidden">
                        <div className="h-8 w-8 rounded-lg bg-[var(--brand-primary)] flex items-center justify-center shrink-0">
                            <Shield className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-semibold text-gray-900 leading-tight break-words">
                            {userRole === "SUPER_ADMIN" ? "Platform Admin" : "Hospital Admin"}
                        </span>
                    </div>

                    <nav className="flex-1 flex flex-col space-y-1.5 mt-6 px-4">
                        {navLinks.map(({ label, icon: Icon, href }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                                        isActive
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

                    <div className="mt-auto border-t border-gray-200/60 pt-4 p-4">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{adminName}</p>
                                <p className="text-xs text-gray-400 truncate">
                                    {userRole === "SUPER_ADMIN" ? "Platform Administrator" : "Hospital Administrator"}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsLogoutOpen(true)}
                                className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 cursor-pointer"
                                title="Log out"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </aside>

                {/* ── Main Workspace ── */}
                <div className="flex-1 ml-64 flex flex-col">
                    <header className="h-16 backdrop-blur-md bg-white/80 border-b border-gray-200/80 flex items-center justify-between px-8 fixed top-0 right-0 z-10 w-[calc(100%-16rem)]">
                        <p className="text-sm text-gray-500 font-medium">Administration Panel</p>
                    </header>

                    <main className="flex-1 mt-16 p-8 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>

            <LogoutModal isOpen={isLogoutOpen} onClose={() => setIsLogoutOpen(false)} />
        </>
    );
}
