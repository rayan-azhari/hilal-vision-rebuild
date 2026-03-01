import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useProTier } from "@/contexts/ProTierContext";

/**
 * Shared hook that encapsulates native (RevenueCat) and web (Stripe) plan selection.
 * Used by both UpgradeModal and SupportPage.
 *
 * @param onPurchaseSuccess  Optional callback invoked after a successful native purchase.
 */
export function usePlanSelection(onPurchaseSuccess?: () => void) {
    const { isNative, getNativeOfferings, purchaseNativePackage, startCheckout } = useProTier();
    const [nativePackages, setNativePackages] = useState<any[]>([]);

    useEffect(() => {
        if (isNative) {
            getNativeOfferings().then((offerings) => {
                if (offerings?.availablePackages) {
                    setNativePackages(offerings.availablePackages);
                }
            });
        }
    }, [isNative, getNativeOfferings]);

    const handleSelectPlan = async (planId: string) => {
        if (isNative) {
            let pkgToBuy = nativePackages.find(p => p.identifier.toLowerCase().includes(planId));
            if (!pkgToBuy && nativePackages.length > 0) {
                const map: Record<string, string> = { monthly: "MONTHLY", annual: "ANNUAL", lifetime: "LIFETIME" };
                pkgToBuy = nativePackages.find(p => p.packageType === map[planId]);
            }
            if (pkgToBuy) {
                const success = await purchaseNativePackage(pkgToBuy);
                if (success) onPurchaseSuccess?.();
            } else {
                toast.error("This package is not currently available in the app store.");
            }
        } else {
            startCheckout({ planId });
        }
    };

    return { nativePackages, handleSelectPlan };
}
