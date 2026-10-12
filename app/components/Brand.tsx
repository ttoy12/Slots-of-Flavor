import { cn } from '@/lib/utils';

// Brand colors, matching the theme tokens in globals.css.
export const BRAND = {
    plum: '#1d1226',
    plumLight: '#3a2148',
    coral: '#e0531f',
    coralDark: '#b63e12',
    gold: '#f5b82e',
    cream: '#fff6ea',
};

// The slot-machine mark: a coral cabinet with a gold marquee, three reels
// (the middle one shows a fork) and a gold-knobbed lever.
export function SlotMark({ className, title }: { className?: string; title?: string }) {
    return (
        <svg viewBox="0 0 64 64" className={className} role={title ? 'img' : undefined} aria-hidden={title ? undefined : true}>
            {title && <title>{title}</title>}
            {/* lever */}
            <path d="M49 38h5V17" fill="none" stroke={BRAND.plum} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M49 38h5V17" fill="none" stroke={BRAND.cream} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="54" cy="13" r="5" fill={BRAND.gold} stroke={BRAND.plum} strokeWidth="1.5" />
            <circle cx="52.5" cy="11.5" r="1.6" fill="#fff" opacity="0.7" />
            {/* marquee */}
            <rect x="15" y="6" width="26" height="12" rx="6" fill={BRAND.gold} />
            <circle cx="22" cy="12" r="1.6" fill={BRAND.coralDark} />
            <circle cx="28" cy="12" r="1.6" fill={BRAND.coralDark} />
            <circle cx="34" cy="12" r="1.6" fill={BRAND.coralDark} />
            {/* cabinet */}
            <rect x="7" y="15" width="42" height="43" rx="9" fill={BRAND.coral} />
            {/* reel window */}
            <rect x="12" y="23" width="32" height="18" rx="5" fill={BRAND.plum} />
            <rect x="14.5" y="25.5" width="8" height="13" rx="2.5" fill={BRAND.cream} />
            <rect x="24" y="25.5" width="8" height="13" rx="2.5" fill={BRAND.cream} />
            <rect x="33.5" y="25.5" width="8" height="13" rx="2.5" fill={BRAND.cream} />
            <circle cx="18.5" cy="32" r="2.4" fill={BRAND.coral} />
            {/* fork */}
            <path d="M26.4 28v3.2M28 28v3.2M29.6 28v3.2M26.4 31.2q1.6 1.6 3.2 0M28 32v4" fill="none" stroke={BRAND.plum} strokeWidth="0.9" strokeLinecap="round" />
            <circle cx="37.5" cy="32" r="2.4" fill={BRAND.gold} />
            {/* payout tray */}
            <rect x="16" y="46" width="24" height="6" rx="3" fill={BRAND.plum} opacity="0.85" />
        </svg>
    );
}

const SIZES = {
    sm: { mark: 'h-9 w-9', text: 'text-lg', tagline: false },
    md: { mark: 'h-11 w-11', text: 'text-xl sm:text-2xl', tagline: false },
    lg: { mark: 'h-16 w-16', text: 'text-3xl', tagline: true },
};

// Mark + wordmark. Text is real text in the display font, so it stays crisp.
export function Logo({ size = 'md', compact, className }: {
    size?: keyof typeof SIZES;
    // Show only the mark below the `sm` breakpoint (for tight headers).
    compact?: boolean;
    className?: string;
}) {
    const s = SIZES[size];
    return (
        <span className={cn('inline-flex items-center gap-2.5 text-white', className)}>
            <SlotMark className={cn('shrink-0 drop-shadow-[0_4px_10px_rgba(224,83,31,0.45)]', s.mark)} />
            <span className={cn('flex flex-col leading-none', compact && 'sr-only sm:not-sr-only')}>
                <span className={cn('whitespace-nowrap font-display font-extrabold tracking-tight', s.text)}>
                    Slots <span className="pr-[0.12em] font-semibold italic text-accent">of</span> Flavor
                </span>
                {s.tagline && (
                    <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                        Unlock hidden gems
                    </span>
                )}
            </span>
        </span>
    );
}
