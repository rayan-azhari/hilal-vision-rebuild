"use client";

import { MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { Location } from "@hilal/types";

interface AutoDetectButtonProps {
    onDetect: (loc: Location) => void;
    className?: string;
}

export function AutoDetectButton({ onDetect, className = "" }: AutoDetectButtonProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDetect = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude: lat, longitude: lng } = position.coords;

                try {
                    // Try to reverse geocode to get a nice name
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
                    if (!res.ok) throw new Error("Reverse geocoding failed");
                    const data = await res.json();

                    const name = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Current Location";
                    const country = data.address?.country || "";

                    onDetect({
                        lat,
                        lng,
                        name: `${name}${country ? `, ${country}` : ""}`,
                    });
                } catch (err) {
                    // Fallback to coordinates
                    onDetect({
                        lat,
                        lng,
                        name: "GPS Location",
                    });
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Error getting location: ", error);
                setError(error.message);
                setLoading(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <button
            onClick={handleDetect}
            disabled={loading}
            className={`flex items-center justify-center p-2 rounded-xl border border-foreground/10 bg-foreground/5 hover:bg-foreground/10 hover:border-primary-500/30 transition-all text-foreground/70 hover:text-primary-400 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            title={error || "Auto-detect location"}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <MapPin className="w-4 h-4" />
            )}
        </button>
    );
}
