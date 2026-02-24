import { useState, useCallback, useEffect } from "react";

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

                // Try fetching elevation data
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
