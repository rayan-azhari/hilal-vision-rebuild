import { MapPin, Loader2 } from "lucide-react";

interface AutoDetectButtonProps {
    onClick: () => void;
    loading?: boolean;
    /** Visual variant: "inline" = small gold text link, "button" = full-width gradient */
    variant?: "inline" | "button";
    className?: string;
}

/**
 * Unified "Auto-Detect" button used across all pages for GPS location detection.
 * Two variants:
 * - `inline`: small gold text (used next to Location label in headers/sidebars)
 * - `button`: full-width gradient button (standalone, e.g. HorizonPage)
 */
export function AutoDetectButton({
    onClick,
    loading = false,
    variant = "inline",
    className = "",
}: AutoDetectButtonProps) {
    if (variant === "button") {
        return (
            <button
                onClick={onClick}
                disabled={loading}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.02] ${className}`}
                style={{
                    background: "linear-gradient(135deg, var(--gold-glow), var(--gold))",
                    color: "var(--space)",
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <MapPin className="w-4 h-4" />
                )}
                {loading ? "Detecting…" : "Auto-Detect Location"}
            </button>
        );
    }

    // inline variant (default)
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider hover:opacity-80 transition-opacity ${className}`}
            style={{ color: "var(--gold)" }}
        >
            {loading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
                <MapPin className="w-3 h-3" />
            )}
            {loading ? "Detecting…" : "Auto-Detect"}
        </button>
    );
}
