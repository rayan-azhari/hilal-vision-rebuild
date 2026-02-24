import React, { createContext, useContext, useState, ReactNode } from "react";
import { MAJOR_CITIES } from "@/lib/astronomy";
import { GeoLocation } from "@/components/LocationSearch";

interface GlobalStateContextType {
    location: GeoLocation;
    setLocation: (loc: GeoLocation) => void;
    date: Date;
    setDate: (date: Date) => void;
    visibilityCriterion: "yallop" | "odeh";
    setVisibilityCriterion: (criterion: "yallop" | "odeh") => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export function GlobalStateProvider({ children }: { children: ReactNode }) {
    // Default to Mecca and today initially
    const [location, setLocation] = useState<GeoLocation>(MAJOR_CITIES[0]);
    const [date, setDate] = useState<Date>(new Date());
    const [visibilityCriterion, setVisibilityCriterion] = useState<"yallop" | "odeh">("yallop");

    return (
        <GlobalStateContext.Provider value={{
            location, setLocation,
            date, setDate,
            visibilityCriterion, setVisibilityCriterion
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
}

export function useGlobalState() {
    const context = useContext(GlobalStateContext);
    if (!context) {
        throw new Error("useGlobalState must be used within a GlobalStateProvider");
    }
    return context;
}
