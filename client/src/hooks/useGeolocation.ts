import { useState, useCallback } from "react";

export interface GeoPosition {
    lat: number;
    lng: number;
    name?: string;
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
 */
export function useGeolocation(): UseGeolocationReturn {
    const [position, setPosition] = useState<GeoPosition | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const detect = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const loc: GeoPosition = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };

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

    return { position, loading, error, detect };
}
