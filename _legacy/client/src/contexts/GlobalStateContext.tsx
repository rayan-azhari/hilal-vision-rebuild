import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
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

const LS_LOCATION = "hilal_location";
const LS_CRITERION = "hilal_criterion";

function loadLocation(): GeoLocation {
    try {
        const raw = localStorage.getItem(LS_LOCATION);
        if (raw) return JSON.parse(raw) as GeoLocation;
    } catch { /* ignore */ }
    return MAJOR_CITIES[0];
}

function loadCriterion(): "yallop" | "odeh" {
    const raw = localStorage.getItem(LS_CRITERION);
    return raw === "odeh" ? "odeh" : "yallop";
}

export function GlobalStateProvider({ children }: { children: ReactNode }) {
    const [location, setLocationState] = useState<GeoLocation>(loadLocation);
    const [date, setDate] = useState<Date>(new Date());
    const [visibilityCriterion, setVisibilityCriterionState] = useState<"yallop" | "odeh">(loadCriterion);

    const setLocation = useCallback((loc: GeoLocation) => {
        setLocationState(loc);
        try { localStorage.setItem(LS_LOCATION, JSON.stringify(loc)); } catch { /* ignore */ }
    }, []);

    const setVisibilityCriterion = useCallback((criterion: "yallop" | "odeh") => {
        setVisibilityCriterionState(criterion);
        try { localStorage.setItem(LS_CRITERION, criterion); } catch { /* ignore */ }
    }, []);

    // Keep date fresh when the day rolls over (e.g. browser left open overnight)
    useEffect(() => {
        const id = setInterval(() => {
            const now = new Date();
            setDate(prev => {
                if (prev.toDateString() !== now.toDateString()) return now;
                return prev;
            });
        }, 60_000);
        return () => clearInterval(id);
    }, []);

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
