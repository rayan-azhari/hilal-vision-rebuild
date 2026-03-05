import React from "react";
import { Header } from "@/components/Header";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-12 lg:py-16">
                <article className="prose prose-invert prose-amber max-w-3xl mx-auto">
                    {children}
                </article>
            </main>
            {/* Simple footer for marketing pages */}
            <footer className="border-t border-white/10 py-8 text-center text-sm text-white/50">
                <p>&copy; {new Date().getFullYear()} Hilal Vision. All rights reserved.</p>
            </footer>
        </div>
    );
}
