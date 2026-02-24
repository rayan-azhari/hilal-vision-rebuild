import { useState, useEffect } from "react";
import { Link } from "wouter";
import { X, Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieConsent() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if the user has already made a choice
        const consent = localStorage.getItem("cookieConsent");

        if (consent === "granted") {
            // If previously granted, update Google Tag Manager consent to granted
            if (typeof (window as any).gtag === "function") {
                (window as any).gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted',
                    'ad_user_data': 'granted',
                    'ad_personalization': 'granted'
                });
            }
        } else if (consent === "denied") {
            // Do nothing, default is already denied
        } else {
            // Show the banner if no choice has been made
            // Small timeout to not show it exactly on page initial render instantly 
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem("cookieConsent", "granted");
        setIsVisible(false);

        // Update consent dynamically
        if (typeof (window as any).gtag === "function") {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': 'granted',
                'ad_storage': 'granted',
                'ad_user_data': 'granted',
                'ad_personalization': 'granted'
            });
        }
    };

    const handleDecline = () => {
        localStorage.setItem("cookieConsent", "denied");
        setIsVisible(false);
        // Explicitly update to denied just in case
        if (typeof (window as any).gtag === "function") {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': 'denied',
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied'
            });
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 150, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 md:pb-6 pointer-events-none"
                >
                    <div className="mx-auto max-w-4xl bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-amber-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
                        <div className="flex flex-col sm:flex-row items-center justify-between p-5 md:p-6 gap-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-amber-400/10 shrink-0 hidden sm:block">
                                    <Cookie className="w-6 h-6 text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="text-[17px] font-semibold text-zinc-100 flex items-center gap-2 mb-1.5">
                                        <Cookie className="w-5 h-5 text-amber-400 sm:hidden" />
                                        We Value Your Privacy
                                    </h3>
                                    <p className="text-[14px] leading-relaxed text-zinc-400 max-w-2xl">
                                        We use optional cookies to improve your experience on Hilal Vision and analyze site traffic via Google Analytics.
                                        You can choose to accept all cookies or decline non-essential ones. For more details, please review our{" "}
                                        <Link href="/privacy" className="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">
                                            Privacy Policy
                                        </Link>.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-row w-full sm:w-auto items-center gap-3 shrink-0">
                                <button
                                    onClick={handleDecline}
                                    className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-600 rounded-lg transition-colors"
                                >
                                    Decline
                                </button>
                                <button
                                    onClick={handleAccept}
                                    className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-amber-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all"
                                >
                                    Accept All
                                </button>
                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="p-2 text-zinc-500 hover:text-zinc-300 bg-transparent rounded-lg hover:bg-zinc-800 transition-colors ml-1 hidden sm:block"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
