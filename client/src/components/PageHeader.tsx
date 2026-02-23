interface PageHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

export function PageHeader({ icon, title, subtitle, children }: PageHeaderProps) {
    return (
        <div
            className="px-6 py-5 flex items-center justify-between"
            style={{
                background: "transparent",
            }}
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center"
                    style={{
                        background: "color-mix(in oklch, var(--primary) 8%, transparent)",
                        color: "var(--foreground)",
                    }}
                >
                    <div className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
                        {icon}
                    </div>
                </div>
                <div>
                    <h1
                        className="text-lg font-semibold tracking-tight"
                        style={{ color: "var(--foreground)" }}
                    >
                        {title}
                    </h1>
                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                        {subtitle}
                    </p>
                </div>
            </div>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
}
