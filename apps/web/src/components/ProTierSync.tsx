"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useAppStore } from "@/store/useAppStore";

/**
 * Empty component that sits inside the ClerkProvider tree and automatically
 * syncs the current user's public metadata (isPro, isPatron, isAdmin)
 * to the global Zustand store so the rest of the app can react instantly.
 */
export function ProTierSync() {
    const { user, isLoaded } = useUser();

    // Select setters from the store
    const setClerkPro = useAppStore((s) => s.setClerkPro);
    const setIsPatron = useAppStore((s) => s.setIsPatron);
    const setIsAdmin = useAppStore((s) => s.setIsAdmin);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            setClerkPro(false);
            setIsPatron(false);
            setIsAdmin(false);
            return;
        }

        const meta = user.publicMetadata as { isPro?: boolean; isPatron?: boolean; isAdmin?: boolean } | undefined;

        // Ensure booleans (default false if missing)
        setClerkPro(meta?.isPro === true);
        setIsPatron(meta?.isPatron === true);
        setIsAdmin(meta?.isAdmin === true);
    }, [user, isLoaded, setClerkPro, setIsPatron, setIsAdmin]);

    return null;
}
