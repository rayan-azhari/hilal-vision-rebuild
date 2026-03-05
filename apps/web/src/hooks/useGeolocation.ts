"use client";

import { useState, useEffect } from "react";

interface GeolocationState {
    position: { lat: number; lng: number } | null;
    error: string | null;
    isLoading: boolean;
}

export function useGeolocation() {
    const [state, setState] = useState<GeolocationState>({
        position: null,
        error: null,
        isLoading: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState({ position: null, error: "Geolocation is not supported by your browser", isLoading: false });
            return;
        }

        const success = (position: GeolocationPosition) => {
            setState({
                position: {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                },
                error: null,
                isLoading: false,
            });
        };

        const error = (err: GeolocationPositionError) => {
            setState({
                position: null,
                error: err.message,
                isLoading: false,
            });
        };

        navigator.geolocation.getCurrentPosition(success, error, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
        });

        // Optional: watchPosition if continuous tracking needed
    }, []);

    return state;
}
