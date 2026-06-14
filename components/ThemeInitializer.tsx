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
import { getMe } from "@/lib/auth";

export const DEFAULT_HOSPITAL_ID = "00000000-0000-4000-8000-000000000001";

export default function ThemeInitializer() {
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const user = await getMe();
                if (
                    user &&
                    user.affiliation_status === "APPROVED" &&
                    user.hospital_id !== DEFAULT_HOSPITAL_ID
                ) {
                    await initBranding(user.hospital_id);
                } else {
                    applyDefaultBranding();
                }
            } catch (err) {
                applyDefaultBranding();
            }
        };

        loadTheme();
    }, []);

    // This component renders nothing — it's purely a side-effect runner
    return null;
}
