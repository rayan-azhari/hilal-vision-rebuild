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
        <div className="prose prose-invert prose-indigo max-w-4xl mx-auto py-12 px-6">
            <Component />
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
