"use client";

import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import { useAppStore } from "@/store/useAppStore";

export default function MoonGlobe() {
    const globeRef = useRef<HTMLDivElement>(null);
    const { isDarkMode } = useAppStore();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [globeInstance, setGlobeInstance] = useState<any>(null);

    useEffect(() => {
        const container = globeRef.current;
        if (!container) return;

        // @ts-expect-error - globe.gl typings expect a constructor but it is called as a function in their docs
        const globe = Globe()(container)
            .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-water.png')
            .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
            .backgroundColor('rgba(0,0,0,0)')
            .showAtmosphere(true)
            .atmosphereColor('#4a5568')
            .atmosphereAltitude(0.15);

        // Customize controls
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.5;
        globe.controls().enableZoom = false;

        setGlobeInstance(globe);

        // Resize handler
        const handleResize = () => {
            if (container) {
                globe.width(container.clientWidth);
                globe.height(container.clientWidth);
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial size
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            // Cleanup WebGL context
            if (container) container.innerHTML = "";
        };
    }, []);

    // Effect to update styling based on theme
    useEffect(() => {
        if (globeInstance) {
            globeInstance.atmosphereColor(isDarkMode ? '#3b82f6' : '#2563eb');
        }
    }, [isDarkMode, globeInstance]);

    return (
        <div
            ref={globeRef}
            className="w-full aspect-square max-w-[500px] mx-auto opacity-0 animate-fade-in transition-opacity duration-1000"
            style={{ opacity: globeInstance ? 1 : 0 }}
        />
    );
}
