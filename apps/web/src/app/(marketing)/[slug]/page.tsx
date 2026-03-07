import { notFound } from 'next/navigation';
import dynamic from 'next/dynamic';

const getMdxComponent = (slug: string) => {
    switch (slug) {
        case 'about':
            return dynamic(() => import('../../../../content/about.mdx'));
        case 'methodology':
            return dynamic(() => import('../../../../content/methodology.mdx'));
        // Placeholders for future pages
        case 'privacy':
            return dynamic(() => import('../../../../content/privacy.mdx').catch(() => {
                const Fallback = () => <div>Privacy Policy Coming Soon</div>;
                return Fallback;
            }));
        case 'terms':
            return dynamic(() => import('../../../../content/terms.mdx').catch(() => {
                const Fallback = () => <div>Terms of Service Coming Soon</div>;
                return Fallback;
            }));
        case 'support':
            return dynamic(() => import('../../../../content/support.mdx').catch(() => {
                const Fallback = () => <div>Support Us Coming Soon</div>;
                return Fallback;
            }));
        default:
            return null;
    }
}

export default async function MarketingPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const Component = getMdxComponent(slug);

    if (!Component) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto px-6 pt-6 pb-16">
            <div className="prose dark:prose-invert max-w-none
                prose-headings:font-display prose-headings:tracking-tight prose-headings:text-foreground
                prose-h1:text-3xl prose-h1:md:text-4xl prose-h1:font-medium prose-h1:mb-6
                prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-3
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-hr:border-border/20
                prose-table:text-sm
                prose-th:text-foreground prose-th:font-semibold
                prose-td:text-muted-foreground
                prose-code:bg-foreground/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-foreground">
                <Component />
            </div>
        </div>
    );
}

export function generateStaticParams() {
    return [
        { slug: 'about' },
        { slug: 'methodology' },
        { slug: 'privacy' },
        { slug: 'terms' },
        { slug: 'support' },
    ];
}
