interface PageHeaderProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

export function PageHeader({ icon, title, subtitle, children }: PageHeaderProps) {
    return (
        <div className="w-full" style={{ background: "transparent" }}>
            <div className="container py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                            background: "color-mix(in oklch, var(--primary) 8%, transparent)",
                            color: "var(--foreground)",
                        }}
                    >
                        <div className="w-4 h-4 flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
                            {icon}
                        </div>
                    </div>
                    <div>
                        <h1
                            className="text-[15px] font-semibold tracking-tight"
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
        </div>
    );
}
