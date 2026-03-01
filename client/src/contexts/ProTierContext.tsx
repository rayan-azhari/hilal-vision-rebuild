import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser, useClerk, useAuth } from "@clerk/clerk-react";
import { Capacitor } from "@capacitor/core";
import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";
import { toast } from "sonner";

interface ProTierContextType {
    /** Whether the current user has an active Pro subscription (from Clerk metadata or RevenueCat) */
    isPremium: boolean;
    /** Whether the current user has a Patron badge ($10+ donor) */
    isPatron: boolean;
    /** Show the upgrade modal */
    showUpgradeModal: boolean;
    setShowUpgradeModal: (show: boolean) => void;
    /** Initiate a Stripe checkout for a plan or donation (Web only) */
    startCheckout: (opts: { planId?: string; donationAmount?: string }) => Promise<void>;
    /** Loading state for checkout redirect or native purchase */
    checkoutLoading: boolean;
    /** Fetch RevenueCat offerings (Native only) */
    getNativeOfferings: () => Promise<any | null>;
    /** Purchase a Native package via RevenueCat (Native only) */
    purchaseNativePackage: (pkg: any) => Promise<boolean>;
    /** True if running as a native Android/iOS app */
    isNative: boolean;
    /** Local dev helper */
    togglePremium: () => void;
}

const ProTierContext = createContext<ProTierContextType | undefined>(undefined);

export function ProTierProvider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();
    const { getToken } = useAuth();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [nativeHasPro, setNativeHasPro] = useState(false);

    const isNative = Capacitor.isNativePlatform();

    // Read Pro status from Clerk publicMetadata (Synced from Stripe webhook or RevenueCat webhook)
    const meta = user?.publicMetadata as { isPro?: boolean; isPatron?: boolean } | undefined;
    const clerkHasPro = isLoaded ? (meta?.isPro === true) : false;
    const isPatron = isLoaded ? (meta?.isPatron === true) : false;

    // Use either Clerk's truth OR the local RevenueCat cache truth
    // Give admin bypass to users with isAdmin flag in Clerk publicMetadata
    const isAdmin = (user?.publicMetadata as { isAdmin?: boolean } | undefined)?.isAdmin === true;

    const TESTING_DISABLE_PRO_GATE = false;

    const isPremium = TESTING_DISABLE_PRO_GATE || clerkHasPro || nativeHasPro || isAdmin;

    // Warn in dev if RevenueCat keys are missing on native
    useEffect(() => {
        if (!isNative) return;
        if (!import.meta.env.VITE_REVENUECAT_APPLE_KEY && !import.meta.env.VITE_REVENUECAT_GOOGLE_KEY) {
            console.warn("[ProTierContext] RevenueCat API keys are not set. Set VITE_REVENUECAT_APPLE_KEY and VITE_REVENUECAT_GOOGLE_KEY.");
        }
    }, [isNative]);

    useEffect(() => {
        if (!isNative) return;

        // Initialize RevenueCat
        const initRevenueCat = async () => {
            try {
                await Purchases.setLogLevel({ level: LOG_LEVEL.WARN });

                // Note: Real keys would be injected via environment variables at build time
                // For capacitor, these usually need to be public or injected into the native project directly.
                // We'll initialize if keys are present.
                if (Capacitor.getPlatform() === 'ios') {
                    await Purchases.configure({ apiKey: import.meta.env.VITE_REVENUECAT_APPLE_KEY || "" });
                } else if (Capacitor.getPlatform() === 'android') {
                    await Purchases.configure({ apiKey: import.meta.env.VITE_REVENUECAT_GOOGLE_KEY || "" });
                }

                if (user?.id) {
                    await Purchases.logIn({ appUserID: user.id });
                }

                const info = await Purchases.getCustomerInfo();
                setNativeHasPro(typeof info.customerInfo.entitlements.active['pro'] !== 'undefined');
            } catch (err) {
                console.error("[ProTierContext] RevenueCat init failed:", err);
            }
        };

        if (isLoaded && user) {
            initRevenueCat();
        }
    }, [isNative, isLoaded, user]);

    /** Redirect user to Stripe Checkout (Web) */
    const startCheckout = async (opts: { planId?: string; donationAmount?: string }) => {
        if (isNative) {
            console.warn("startCheckout called on native platform. Use purchaseNativePackage instead.");
            return;
        }

        if (!user) {
            openSignIn({ redirectUrl: window.location.href });
            return;
        }

        setCheckoutLoading(true);
        try {
            const sessionToken = await getToken();
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
                },
                body: JSON.stringify({
                    planId: opts.planId,
                    donationAmount: opts.donationAmount,
                }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error ?? "Checkout failed");
            }

            const { url } = await res.json();
            if (url) {
                window.location.href = url;
            }
        } catch (err: any) {
            console.error("[ProTierContext] Checkout error:", err);
            toast.error(`Could not start checkout: ${err.message ?? "Unknown error"}`);
        } finally {
            setCheckoutLoading(false);
        }
    };

    /** Get RevenueCat Offerings (Native) */
    const getNativeOfferings = async () => {
        if (!isNative) return null;
        try {
            const offerings = await Purchases.getOfferings();
            return offerings.current;
        } catch (err) {
            console.error("[ProTierContext] Failed to get offerings:", err);
            return null;
        }
    };

    /** Purchase RevenueCat Package (Native) */
    const purchaseNativePackage = async (pkg: any) => {
        if (!isNative) return false;
        setCheckoutLoading(true);
        try {
            const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
            if (typeof customerInfo.entitlements.active['pro'] !== 'undefined') {
                setNativeHasPro(true);
                return true;
            }
            return false;
        } catch (err: any) {
            if (!err.userCancelled) {
                console.error("[ProTierContext] Purchase error:", err);
                toast.error(`Purchase failed: ${err.message}`);
            }
            return false;
        } finally {
            setCheckoutLoading(false);
        }
    };

    return (
        <ProTierContext.Provider value={{
            isPremium,
            isPatron,
            showUpgradeModal,
            setShowUpgradeModal,
            startCheckout,
            checkoutLoading,
            getNativeOfferings,
            purchaseNativePackage,
            isNative,
            togglePremium: () => setNativeHasPro(!nativeHasPro)
        }}>
            {children}
        </ProTierContext.Provider>
    );
}

export function useProTier() {
    const context = useContext(ProTierContext);
    if (!context) {
        throw new Error("useProTier must be used within a ProTierProvider");
    }
    return context;
}
