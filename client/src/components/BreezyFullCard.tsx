import { ReactNode } from "react";

export interface TabType {
    value: string;
    label: string;
    labelAr?: string;
}

interface BreezyFullCardProps {
    icon?: ReactNode;
    title: string;
    titleAr?: string;
    tabs?: TabType[];
    activeTab?: string;
    onTabChange?: (value: string) => void;
    children: ReactNode;
    className?: string;
    expandableContent?: ReactNode;
}

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function BreezyFullCard({
    icon, title, titleAr, tabs, activeTab, onTabChange, children, className, expandableContent,
}: BreezyFullCardProps) {
    const cardContent = (
        <div className={`breezy-card-full ${className ?? ""}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span style={{ color: "var(--gold-dim)" }} className="w-4 h-4 flex items-center justify-center shrink-0 [&>svg]:w-full [&>svg]:h-full">{icon}</span>
                    )}
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                        {title}
                    </span>
                    {titleAr && (
                        <span className="text-xs font-arabic" style={{ color: "var(--gold-subtle)" }}>
                            {titleAr}
                        </span>
                    )}
                </div>

                {/* Tab chips */}
                {tabs && tabs.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {tabs.map(tab => (
                            <button
                                key={tab.value}
                                className="breezy-chip"
                                data-active={activeTab === tab.value ? "true" : "false"}
                                onClick={() => onTabChange?.(tab.value)}
                            >
                                {tab.label}
                                {tab.labelAr && (
                                    <span className="font-arabic text-[9px] ml-1.5 opacity-80">{tab.labelAr}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="w-full relative">
                {children}
            </div>
        </div>
    );

    if (expandableContent) {
        return (
            <Dialog>
                <DialogTrigger asChild>
                    <div className="cursor-pointer group">{cardContent}</div>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" style={{
                    background: "var(--card)",
                    border: "1px solid color-mix(in oklch, var(--gold) 20%, transparent)",
                }}>
                    {expandableContent}
                </DialogContent>
            </Dialog>
        );
    }

    return cardContent;
}
