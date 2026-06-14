"use client";

import { useState, useEffect } from "react";
import { getCurrentBranding, type HospitalBranding, DEFAULT_BRANDING } from "@/lib/theme";

export function useBranding() {
    const [branding, setBranding] = useState<HospitalBranding>(DEFAULT_BRANDING);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setBranding(getCurrentBranding());

        const handleUpdate = (e: Event) => {
            const customEvent = e as CustomEvent<HospitalBranding>;
            setBranding(customEvent.detail);
        };

        window.addEventListener("brandingUpdated", handleUpdate);
        return () => window.removeEventListener("brandingUpdated", handleUpdate);
    }, []);

    if (!isMounted) {
        return DEFAULT_BRANDING;
    }

    return branding;
}
