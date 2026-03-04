"use client";

import Map, { NavigationControl } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useAppStore } from "@/store/useAppStore";

export function VisibilityMap() {
    const { isDarkMode } = useAppStore();

    // Map style depends on the theme
    const mapStyle = isDarkMode
        ? "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        : "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-foreground/10 shadow-2xl relative">
            <Map
                initialViewState={{
                    longitude: 39.8579, // Mecca
                    latitude: 21.3891,
                    zoom: 2,
                }}
                mapStyle={mapStyle}
                interactive={true}
            >
                <NavigationControl position="bottom-right" />

                {/* 
                  Here we will add the GeoJSON overlay for the visibility grid 
                  once the tRPC client is fully queried. 
                */}
            </Map>
        </div>
    );
}
