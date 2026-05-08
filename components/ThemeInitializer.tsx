"use client";

/**
 * CareConnect — Theme Initializer
 *
 * Client component that applies default branding CSS variables on mount.
 * When a hospital context is available (after login), it fetches
 * and applies the hospital's branding via `initBranding()`.
 *
 * Place this component inside layouts that need white-label theming.
 */

import { useEffect } from "react";
import { applyDefaultBranding, initBranding } from "@/lib/theme";
import { getStoredUser } from "@/lib/api";

export default function ThemeInitializer() {
    useEffect(() => {
        const user = getStoredUser();

        if (user?.hospital_id) {
            // Logged-in user with hospital context — fetch real branding
            initBranding(user.hospital_id);
        } else {
            // No hospital context — apply defaults
            applyDefaultBranding();
        }
    }, []);

    // This component renders nothing — it's purely a side-effect runner
    return null;
}
