import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function SiteFooter({ className }: { className?: string }) {
    return (
        <footer className={cn('flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-8 text-xs text-white/60', className)}>
            <span>© {new Date().getFullYear()} Slots of Flavor</span>
            <Link href="/terms" className="hover:text-white hover:underline">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white hover:underline">Privacy Policy</Link>
        </footer>
    );
}
