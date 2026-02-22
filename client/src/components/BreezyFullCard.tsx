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
}

export function BreezyFullCard({
    icon, title, titleAr, tabs, activeTab, onTabChange, children, className,
}: BreezyFullCardProps) {
    return (
        <div className={`breezy-card-full ${className ?? ""}`}>
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    {icon && (
                        <span style={{ color: "var(--gold-dim)" }} className="w-4 h-4 flex items-center justify-center">{icon}</span>
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
}
