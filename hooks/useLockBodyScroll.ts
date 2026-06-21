"use client";

import { useEffect } from "react";

export function useLockBodyScroll(isLocked: boolean) {
    useEffect(() => {
        if (typeof document === "undefined") return;
        
        if (isLocked) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isLocked]);
}
