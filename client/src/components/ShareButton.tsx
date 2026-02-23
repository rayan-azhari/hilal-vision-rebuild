import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    /** The title to share */
    title?: string;
    /** The text/description to share */
    text?: string;
    /** The URL to share — defaults to current page */
    url?: string;
    /** Compact mode — just an icon */
    compact?: boolean;
}

/**
 * ShareButton — uses navigator.share() when available (mobile + modern browsers),
 * falls back to clipboard copy.
 */
export function ShareButton({
    title = "Hilal Vision — Moon Visibility",
    text = "Check out the crescent moon visibility predictions on Hilal Vision!",
    url,
    compact = false,
}: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "");

    const handleShare = async () => {
        // Try native share API first (mobile, modern Chrome/Edge/Safari)
        if (navigator.share) {
            try {
                await navigator.share({ title, text, url: shareUrl });
                return;
            } catch (err) {
                // User cancelled — fall through to clipboard
                if ((err as Error).name === "AbortError") return;
            }
        }

        // Fallback: copy URL to clipboard
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Final fallback
            const textarea = document.createElement("textarea");
            textarea.value = shareUrl;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (compact) {
        return (
            <button
                onClick={handleShare}
                className="p-2 rounded-lg transition-all hover:scale-105"
                style={{
                    background: "color-mix(in oklch, var(--gold) 10%, transparent)",
                    color: "var(--gold)",
                    border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                }}
                aria-label="Share this page"
            >
                {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            </button>
        );
    }

    return (
        <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-[1.02]"
            style={{
                background: "color-mix(in oklch, var(--gold) 12%, transparent)",
                color: "var(--gold)",
                border: "1px solid color-mix(in oklch, var(--gold) 25%, transparent)",
            }}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    Copied!
                </>
            ) : (
                <>
                    <Share2 className="w-4 h-4" />
                    Share
                </>
            )}
        </button>
    );
}
