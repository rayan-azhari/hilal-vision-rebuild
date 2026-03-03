import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Search, MapPin, Loader2 } from "lucide-react";

export interface GeoLocation {
    name: string;
    lat: number;
    lng: number;
    country: string;
    admin1?: string; // State / Province
}

interface LocationSearchProps {
    selectedCity: GeoLocation;
    onSelect: (city: GeoLocation) => void;
    className?: string;
}

export function LocationSearch({ selectedCity, onSelect, className = "" }: LocationSearchProps) {
    const { t } = useTranslation();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GeoLocation[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Sync internal input value with selected prop when it safely changes from the outside
    useEffect(() => {
        if (!isOpen) {
            setQuery(selectedCity.name);
        }
    }, [selectedCity.name, isOpen]);

    // Debounced search
    useEffect(() => {
        if (query.length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }

        // Don't search if the query is just exactly the selected item we just clicked
        if (query === selectedCity.name) {
            return;
        }

        setIsSearching(true);
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await fetch(
                    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
                );
                if (!res.ok) throw new Error("Search failed");

                const data = await res.json();

                if (data.results) {
                    const formatted = data.results.map((r: any) => ({
                        name: r.name,
                        lat: r.latitude,
                        lng: r.longitude,
                        country: r.country || "",
                        admin1: r.admin1,
                    }));
                    setResults(formatted);
                    setIsOpen(true);
                } else {
                    setResults([]);
                }
            } catch (err) {
                console.error("Geocoding failed", err);
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    return (
        <div className={`relative ${className}`} ref={wrapperRef}>
            <div className="relative flex items-center">
                <span className="absolute left-3 opacity-50 pointer-events-none">
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </span>
                <input
                    type="text"
                    value={query}
                    onFocus={() => {
                        setQuery(""); // Clear on focus to allow fresh searching
                        if (results.length > 0) setIsOpen(true);
                    }}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("locationSearch.placeholder")}
                    className="w-full pl-9 pr-3 py-2 rounded-lg text-sm appearance-none"
                    style={{
                        background: "var(--space-light)",
                        border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                        color: "var(--foreground)",
                    }}
                />
            </div>

            {/* Flyout Results */}
            {isOpen && results.length > 0 && (
                <div
                    className="absolute top-11 left-0 w-full rounded-lg shadow-xl z-[9999] max-h-60 overflow-y-auto"
                    style={{
                        background: "var(--background)",
                        border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                    }}
                >
                    {results.map((loc, idx) => (
                        <button
                            key={`${loc.lat}-${loc.lng}-${idx}`}
                            onClick={() => {
                                onSelect(loc);
                                setQuery(loc.name);
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm flex flex-col hover:-translate-y-px transition-transform"
                            style={{
                                borderBottom: idx < results.length - 1 ? "1px solid var(--space-light)" : "none",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "var(--space-light)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                            }}
                        >
                            <span className="font-medium text-[var(--foreground)]">{loc.name}</span>
                            <span className="text-[10px] text-[var(--muted-foreground)]">
                                {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country} • {loc.lat.toFixed(2)}°, {loc.lng.toFixed(2)}°
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.length >= 2 && results.length === 0 && !isSearching && (
                <div
                    className="absolute top-11 left-0 w-full rounded-lg shadow-xl z-[9999] px-4 py-3 text-sm italic opacity-50"
                    style={{
                        background: "var(--background)",
                        border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                    }}
                >
                    {t("locationSearch.noLocations")}
                </div>
            )}
        </div>
    );
}
