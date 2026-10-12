import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Logo } from './SiteHeader';
import SiteFooter from './SiteFooter';
import { Card } from './ui';
import { CONTACT_EMAIL, LEGAL_EFFECTIVE_DATE } from '@/lib/legal';

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mx-auto max-w-3xl px-4">
            <header className="flex items-center justify-between py-5">
                <Link href="/welcome"><Logo className="w-36 sm:w-44" /></Link>
                <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white">
                    <ArrowLeft className="h-4 w-4" aria-hidden /> Back to the app
                </Link>
            </header>
            <Card className="p-6 sm:p-10">
                <h1 className="text-3xl font-extrabold sm:text-4xl">{title}</h1>
                <p className="mt-2 text-sm text-muted-foreground">Effective {LEGAL_EFFECTIVE_DATE}</p>
                <div className="mt-8 space-y-8 text-[15px] leading-relaxed text-foreground/90">{children}</div>
            </Card>
            <SiteFooter />
        </div>
    );
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-xl font-bold text-foreground">{title}</h2>
            {children}
        </section>
    );
}

export function List({ children }: { children: React.ReactNode }) {
    return <ul className="list-disc space-y-2 pl-5 marker:text-primary">{children}</ul>;
}

export function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <a href={href} target="_blank" rel="noreferrer noopener" className="font-medium text-primary underline underline-offset-2">
            {children}
        </a>
    );
}

export function ContactLink() {
    return (
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-primary underline underline-offset-2">
            {CONTACT_EMAIL}
        </a>
    );
}
