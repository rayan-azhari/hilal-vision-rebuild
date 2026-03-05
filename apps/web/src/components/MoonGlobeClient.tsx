"use client";

import dynamic from "next/dynamic";

const Globe = dynamic(() => import("@/components/MoonGlobe"), { ssr: false });

export default function MoonGlobeClient() {
    return <Globe />;
}
