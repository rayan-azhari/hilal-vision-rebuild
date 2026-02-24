import { useState, useEffect, useRef } from "react";

export interface VisibilityQData {
    qValues: Float32Array;
    width: number;
    height: number;
}

export function useVisibilityWorker(
    dateTs: number,
    resolution: number,
    isMercator: boolean,
    enabled: boolean = true,
    criterion: "yallop" | "odeh" = "yallop",
    highContrast: boolean = false
) {
    const [textureUrl, setTextureUrl] = useState<string | null>(null);
    const [qData, setQData] = useState<VisibilityQData | null>(null);
    const [isComputing, setIsComputing] = useState(false);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        if (!enabled) return;

        if (!workerRef.current) {
            workerRef.current = new Worker(
                new URL("../workers/visibility.worker.ts", import.meta.url),
                { type: "module" }
            );
        }

        const worker = workerRef.current;
        setIsComputing(true);

        worker.onmessage = (e: MessageEvent) => {
            const { pixels, qValues, width, height } = e.data;

            setQData({ qValues, width, height });

            const offCanvas = document.createElement("canvas");
            offCanvas.width = width;
            offCanvas.height = height;
            const offCtx = offCanvas.getContext("2d");
            if (!offCtx) return;

            const imageData = offCtx.createImageData(width, height);
            imageData.data.set(pixels);
            offCtx.putImageData(imageData, 0, 0);

            const canvas = document.createElement("canvas");
            canvas.width = 1024;
            canvas.height = 512;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;

            // Smooth the boundaries between the low-res computed pixels
            ctx.filter = "blur(12px)";
            // Draw 3 times to wrap the edges seamlessly across the dateline
            ctx.drawImage(offCanvas, -canvas.width, 0, canvas.width, canvas.height);
            ctx.drawImage(offCanvas, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(offCanvas, canvas.width, 0, canvas.width, canvas.height);

            setTextureUrl(canvas.toDataURL());
            setIsComputing(false);
        };

        worker.postMessage({ dateTs, resolution, isMercator, criterion, highContrast });

    }, [dateTs, resolution, isMercator, enabled, criterion, highContrast]);

    useEffect(() => {
        return () => {
            workerRef.current?.terminate();
            workerRef.current = null;
        };
    }, []);

    return { textureUrl, qData, isComputing };
}
