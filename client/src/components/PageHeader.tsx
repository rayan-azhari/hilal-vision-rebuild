interface PageHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

export function PageHeader({ icon, title, subtitle, children }: PageHeaderProps) {
    return (
        <div
            className="border-b px-6 py-4 flex items-center justify-between"
            style={{
                borderColor: "color-mix(in oklch, var(--gold) 12%, transparent)",
                background: "var(--space-mid)",
            }}
        >
            <div className="flex items-center gap-3">
                <div style={{ color: "var(--gold)" }} className="w-5 h-5 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
                    {icon}
                </div>
                <div>
                    <h1
                        className="text-base font-semibold"
                        style={{ fontFamily: "Cinzel, serif", color: "var(--foreground)" }}
                    >
                        {title}
                    </h1>
                    <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        {subtitle}
                    </p>
                </div>
            </div>
            {children && <div className="flex items-center gap-4">{children}</div>}
        </div>
    );
}
