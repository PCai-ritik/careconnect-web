"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, getStoredUser } from "@/lib/api";
import { getMe } from "@/lib/auth";

/**
 * Auth guard — checks for an access token on mount and on focus.
 * If no token is found, redirects to /login.
 * If the user is an admin, redirects to /admin.
 * Renders nothing — just acts as a side-effect.
 */
export default function AuthGuard() {
    const router = useRouter();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        const check = async () => {
            const token = getToken();
            const user = getStoredUser();
            if (!token) {
                router.replace("/login");
            } else if (user && (user.role === "ADMIN" || user.role === "SUPER_ADMIN")) {
                router.replace("/admin");
            } else if (user && user.role === "DOCTOR") {
                try {
                    const me = await getMe();
                    if (me.onboarding_completed === false) {
                        router.replace("/doctor-onboarding");
                    } else {
                        setChecked(true);
                    }
                } catch (e) {
                    router.replace("/login");
                }
            } else {
                setChecked(true);
            }
        };

        check();

        // Also re-check when user tabs back (token may have been cleared)
        const handleFocus = () => check();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [router]);

    // Don't render children until check passes (prevents flash of dashboard)
    if (!checked) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="w-8 h-8 border-3 border-gray-200 border-t-[var(--brand-primary)] rounded-full animate-spin" />
            </div>
        );
    }

    return null;
}
