import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Location } from "@hilal/types";

interface AppState {
    // Current user location (defaults to Mecca if not granted/detectable)
    location: Location;
    setLocation: (loc: Location) => void;

    // Current selected date for visibility calculations
    date: Date;
    setDate: (date: Date) => void;

    // Visibility Criterion
    visibilityCriterion: "yallop" | "odeh";
    setVisibilityCriterion: (criterion: "yallop" | "odeh") => void;

    // UI State
    isDarkMode: boolean;
    toggleDarkMode: () => void;

    // Search / Filter
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    // Map Controls
    resolution: number;
    setResolution: (res: number) => void;
    showVisibility: boolean;
    setShowVisibility: (show: boolean) => void;
    showClouds: boolean;
    setShowClouds: (show: boolean) => void;
    hourOffset: number;
    setHourOffset: (offset: number) => void;
    autoFetchWeather: boolean;
    setAutoFetchWeather: (auto: boolean) => void;
    tempOverride: number | "";
    setTempOverride: (temp: number | "") => void;
    pressureOverride: number | "";
    setPressureOverride: (pres: number | "") => void;

    // Pro Tier (Auth/Payments)
    clerkHasPro: boolean;
    nativeHasPro: boolean;
    isAdmin: boolean;
    isPatron: boolean;
    showUpgradeModal: boolean;
    checkoutLoading: boolean;
    showSightingModal: boolean;
    setClerkPro: (val: boolean) => void;
    setNativePro: (val: boolean) => void;
    setIsAdmin: (val: boolean) => void;
    setIsPatron: (val: boolean) => void;
    setShowUpgradeModal: (show: boolean) => void;
    setCheckoutLoading: (loading: boolean) => void;
    setShowSightingModal: (show: boolean) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set) => ({
            location: {
                lat: 21.3891,
                lng: 39.8579,
                name: "Mecca, Saudi Arabia",
                elevation: 277,
            },
            setLocation: (location) => set({ location }),

            date: new Date(),
            setDate: (date) => set({ date }),

            visibilityCriterion: "yallop",
            setVisibilityCriterion: (visibilityCriterion) => set({ visibilityCriterion }),

            isDarkMode: true,
            toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

            searchQuery: "",
            setSearchQuery: (searchQuery) => set({ searchQuery }),

            resolution: 4,
            setResolution: (resolution) => set({ resolution }),
            showVisibility: true,
            setShowVisibility: (showVisibility) => set({ showVisibility }),
            showClouds: false,
            setShowClouds: (showClouds) => set({ showClouds }),
            hourOffset: 0,
            setHourOffset: (hourOffset) => set({ hourOffset }),
            autoFetchWeather: true,
            setAutoFetchWeather: (autoFetchWeather) => set({ autoFetchWeather }),
            tempOverride: "",
            setTempOverride: (tempOverride) => set({ tempOverride }),
            pressureOverride: "",
            setPressureOverride: (pressureOverride) => set({ pressureOverride }),

            clerkHasPro: false,
            nativeHasPro: false,
            isAdmin: false,
            isPatron: false,
            showUpgradeModal: false,
            checkoutLoading: false,
            showSightingModal: false,
            setClerkPro: (clerkHasPro) => set({ clerkHasPro }),
            setNativePro: (nativeHasPro) => set({ nativeHasPro }),
            setIsAdmin: (isAdmin) => set({ isAdmin }),
            setIsPatron: (isPatron) => set({ isPatron }),
            setShowUpgradeModal: (showUpgradeModal) => set({ showUpgradeModal }),
            setCheckoutLoading: (checkoutLoading) => set({ checkoutLoading }),
            setShowSightingModal: (showSightingModal) => set({ showSightingModal }),
        }),
        {
            name: "hilal-app-storage",
            // Date objects need custom hydration from string
            onRehydrateStorage: () => (state) => {
                if (state && state.date) {
                    state.date = new Date(state.date);
                }
            },
            partialize: (state) => ({
                location: state.location,
                visibilityCriterion: state.visibilityCriterion,
                isDarkMode: state.isDarkMode,
                resolution: state.resolution,
                showVisibility: state.showVisibility,
                showClouds: state.showClouds,
                autoFetchWeather: state.autoFetchWeather,
            }),
        }
    )
);
