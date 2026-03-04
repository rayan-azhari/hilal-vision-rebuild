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
        }),
        {
            name: "hilal-app-storage",
            // Date objects need custom hydration from string
            onRehydrateStorage: () => (state) => {
                if (state && state.date) {
                    state.date = new Date(state.date);
                }
            },
        }
    )
);
