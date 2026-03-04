import { Moon, Github, Twitter, Mail } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-foreground/5 py-12 px-4 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center p-1.5">
                                <Moon className="w-full h-full text-white" />
                            </div>
                            <span className="font-display font-bold text-xl tracking-tight">
                                Hilal Vision
                            </span>
                        </div>
                        <p className="text-foreground/60 max-w-sm leading-relaxed mb-6">
                            Empowering the global community with precise lunar visibility data,
                            integrating centuries of astronomical methodology with modern tech.
                        </p>
                        <div className="flex items-center gap-4">
                            <SocialLink href="#" icon={<Twitter className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Github className="w-5 h-5" />} />
                            <SocialLink href="#" icon={<Mail className="w-5 h-5" />} />
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 font-display">Product</h4>
                        <ul className="space-y-2 text-sm text-foreground/60">
                            <li><Link href="/visibility" className="hover:text-primary-400 transition-colors">Visibility Maps</Link></li>
                            <li><Link href="/calendar" className="hover:text-primary-400 transition-colors">Hijri Calendar</Link></li>
                            <li><Link href="/weather" className="hover:text-primary-400 transition-colors">Weather Grid</Link></li>
                            <li><Link href="/api" className="hover:text-primary-400 transition-colors">Public API</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 font-display">Resources</h4>
                        <ul className="space-y-2 text-sm text-foreground/60">
                            <li><Link href="/about" className="hover:text-primary-400 transition-colors">About Project</Link></li>
                            <li><Link href="/methodology" className="hover:text-primary-400 transition-colors">Methodology</Link></li>
                            <li><Link href="/docs" className="hover:text-primary-400 transition-colors">Documentation</Link></li>
                            <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-foreground/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/40">
                    <p>© {new Date().getFullYear()} Hilal Vision. All rights reserved.</p>
                    <p>Designed with excellence for observers worldwide.</p>
                </div>
            </div>
        </footer>
    );
}

function SocialLink({ href, icon }: { href: string; icon: React.ReactNode }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-xl bg-foreground/[0.03] flex items-center justify-center hover:bg-primary-600/10 hover:text-primary-400 transition-all"
        >
            {icon}
        </a>
    );
}
