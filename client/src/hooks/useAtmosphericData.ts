import { useState, useEffect } from "react";

interface City {
    lat: number;
    lng: number;
}

interface AtmosphericData {
    tempOverride: number | "";
    setTempOverride: (v: number | "") => void;
    pressureOverride: number | "";
    setPressureOverride: (v: number | "") => void;
    elevationOverride: number | "";
    setElevationOverride: (v: number | "") => void;
    autoFetchWeather: boolean;
    setAutoFetchWeather: (v: boolean) => void;
}

/**
 * Fetches real-time atmospheric data (temperature, pressure, elevation) from
 * Open-Meteo for a given city location and exposes override state setters.
 * Shared between MapPage and GlobePage.
 */
export function useAtmosphericData(selectedCity: City): AtmosphericData {
    const [tempOverride, setTempOverride] = useState<number | "">("");
    const [pressureOverride, setPressureOverride] = useState<number | "">("");
    const [elevationOverride, setElevationOverride] = useState<number | "">("");
    const [autoFetchWeather, setAutoFetchWeather] = useState(true);

    useEffect(() => {
        if (!autoFetchWeather) return;

        let isMounted = true;
        const fetchWeather = async () => {
            try {
                const res = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.lat}&longitude=${selectedCity.lng}&current=temperature_2m,surface_pressure&elevation=nan`
                );
                if (!res.ok) throw new Error("Weather fetch failed");
                const data = await res.json();

                if (isMounted) {
                    if (data.current?.temperature_2m !== undefined) setTempOverride(data.current.temperature_2m);
                    if (data.current?.surface_pressure !== undefined) setPressureOverride(data.current.surface_pressure);
                    if (data.elevation !== undefined && !isNaN(data.elevation)) setElevationOverride(data.elevation);
                }
            } catch (err) {
                console.error("Failed to fetch atmospheric overrides from Open-Meteo:", err);
            }
        };

        fetchWeather();

        return () => { isMounted = false; };
    }, [selectedCity.lat, selectedCity.lng, autoFetchWeather]);

    return {
        tempOverride, setTempOverride,
        pressureOverride, setPressureOverride,
        elevationOverride, setElevationOverride,
        autoFetchWeather, setAutoFetchWeather,
    };
}
