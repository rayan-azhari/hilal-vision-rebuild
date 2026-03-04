import { useState, useCallback, useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@capacitor/geolocation";

export interface GeoPosition {
    lat: number;
    lng: number;
    name?: string;
    elevation?: number;
}

interface UseGeolocationReturn {
    position: GeoPosition | null;
    loading: boolean;
    error: string | null;
    detect: () => void;
}

/**
 * Hook to auto-detect user location via the browser Geolocation API.
 * Falls back gracefully with an error message if denied or unavailable.
 *
 * @param autoDetect  If true, triggers detection on mount (default: false)
 */
export function useGeolocation(autoDetect = false): UseGeolocationReturn {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detect = useCallback(async () => {
        setLoading(true);
        setError(null);

        // Native Capacitor Geolocation logic
        if (Capacitor.isNativePlatform()) {
            try {
                const check = await Geolocation.checkPermissions();
                if (check.location !== "granted") {
                    const req = await Geolocation.requestPermissions();
                    if (req.location !== "granted") {
                        setError("Location access denied. Please allow location permissions.");
                        setLoading(false);
                        return;
                    }
                }

                const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 10000 });
                const loc: GeoPosition = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                if (pos.coords.altitude !== null) {
                    loc.elevation = pos.coords.altitude;
                }

                // Reverse geocoding fallback
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&zoom=10`, { headers: { "User-Agent": "HilalVision/1.0" } });
                    if (res.ok) {
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
                        const country = data.address?.country;
                        loc.name = city ? `${city}, ${country}` : country || "Your Location";
                    }
                } catch {
                    loc.name = "Your Location";
                }

                setPosition(loc);
                setLoading(false);
                return;
            } catch (err: any) {
                console.error("Native Geolocation error", err);
                setError("Unable to detect your location via device GPS.");
                setLoading(false);
                return;
            }
        }

        // Web/Browser fallback logic
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const loc: GeoPosition = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };

                // If the device GPS has hardware altitude (e.g. mobile phones), use it natively.
                if (pos.coords.altitude !== null) {
                    loc.elevation = pos.coords.altitude;
                }

                // Try reverse-geocoding the position for a human-readable name
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&zoom=10`,
                        { headers: { "User-Agent": "HilalVision/1.0" } }
                    );
                    if (res.ok) {
                        const data = await res.json();
                        const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
                        const country = data.address?.country;
                        loc.name = city ? `${city}, ${country}` : country || "Your Location";
                    }
                } catch {
                    loc.name = "Your Location";
                }

                // Try fetching elevation data as a fallback if hardware altitude is missing
                if (loc.elevation === undefined) {
                    try {
                        const elRes = await fetch(
                            `https://api.open-meteo.com/v1/elevation?latitude=${loc.lat}&longitude=${loc.lng}`
                        );
                        if (elRes.ok) {
                            const elData = await elRes.json();
                            if (elData.elevation && elData.elevation.length > 0) {
                                loc.elevation = elData.elevation[0];
                            }
                        }
                    } catch {
                        // Ignore elevation errors
                    }
                }

                setPosition(loc);
                setLoading(false);
            },
            (err) => {
                setLoading(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Location access denied. Please select a city manually.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("Location information is unavailable.");
                        break;
                    case err.TIMEOUT:
                        setError("Location request timed out.");
                        break;
                    default:
                        setError("Unable to detect your location.");
                }
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
        );
    }, []);

    // Auto-detect on mount if requested
    useEffect(() => {
        if (autoDetect) {
            detect();
        }
    }, [autoDetect, detect]);

    return { position, loading, error, detect };
}
