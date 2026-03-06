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
        </div>
    );
}
