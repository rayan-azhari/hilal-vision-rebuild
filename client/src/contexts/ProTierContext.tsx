import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import { Capacitor } from "@capacitor/core";
import { Purchases, LOG_LEVEL } from "@revenuecat/purchases-capacitor";

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
}

const ProTierContext = createContext<ProTierContextType | undefined>(undefined);

export function ProTierProvider({ children }: { children: ReactNode }) {
    const { user, isLoaded } = useUser();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);
    const [nativeHasPro, setNativeHasPro] = useState(false);

    const isNative = Capacitor.isNativePlatform();

    // Read Pro status from Clerk publicMetadata (Synced from Stripe webhook or RevenueCat webhook)
    const meta = user?.publicMetadata as { isPro?: boolean; isPatron?: boolean } | undefined;
    const clerkHasPro = isLoaded ? (meta?.isPro === true) : false;
    const isPatron = isLoaded ? (meta?.isPatron === true) : false;

    // Use either Clerk's truth OR the local RevenueCat cache truth
    const isPremium = clerkHasPro || nativeHasPro;

    useEffect(() => {
        if (!isNative) return;

        // Initialize RevenueCat
        const initRevenueCat = async () => {
            try {
                await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });

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

        setCheckoutLoading(true);
        try {
            const res = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    planId: opts.planId,
                    donationAmount: opts.donationAmount,
                    userId: user?.id ?? undefined,
                    userEmail: user?.primaryEmailAddress?.emailAddress ?? undefined,
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
            alert(`Could not start checkout: ${err.message ?? "Unknown error"}`);
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
                alert(`Purchase failed: ${err.message}`);
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
            isNative
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
