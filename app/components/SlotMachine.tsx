"use client";
import { useEffect, useRef, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import Link from 'next/link';
import { AlertTriangle, Check, Clock, Dices, LogIn, MapPin, MapPinOff, Navigation, RotateCw, SearchX, Share2, Star, ThumbsDown, ThumbsUp, UserPlus, UtensilsCrossed, WifiOff, type LucideIcon } from 'lucide-react';
import { auth } from '../firebase/firebaseConfig';
import { addLikedPlace, addDislikedPlace, removedLikedPlace, removedDislikedPlace, formatAddress, Business } from '@/app/firebase/firestore';
import { cn } from '@/lib/utils';
import type { SearchError } from '@/lib/searchLimit';
import { Button, buttonClasses, Card } from './ui';

export interface Spin {
    id: number;
    business: Business;
    // Names the reel scrolls through; the last one is `business.name`.
    strip: string[];
}

export type MachineStatus = 'idle' | 'loading' | 'error' | 'empty' | 'result';

const ITEM_HEIGHT = 80;
const SPIN_MS = 1800;
const IDLE_WORDS = ['Tacos', 'Ramen', 'Pizza', 'Sushi', 'Burgers', 'Pho', 'Curry', 'BBQ', 'Dim sum', 'Falafel'];

function ReelWindow({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative h-20 overflow-hidden rounded-2xl bg-black/50 ring-2 ring-accent/70 shadow-inner">
            {children}
            {/* fade the edges so names look like they roll past a window */}
            <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-black/60" />
        </div>
    );
}

function ReelText({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn('flex h-20 items-center justify-center truncate px-5 text-center font-display text-2xl font-bold text-white sm:text-3xl', className)}>
            <span className="truncate">{children}</span>
        </div>
    );
}

function SpinningReel({ strip, onLanded }: { strip: string[]; onLanded: () => void }) {
    const ref = useRef<HTMLDivElement>(null);
    const landed = useRef(onLanded);
    useEffect(() => { landed.current = onLanded; });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const end = `translateY(-${(strip.length - 1) * ITEM_HEIGHT}px)`;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            el.style.transform = end;
            landed.current();
            return;
        }
        // Wait a frame so the browser paints the start position before transitioning.
        let inner = 0;
        const outer = requestAnimationFrame(() => {
            inner = requestAnimationFrame(() => {
                el.style.transition = `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.8, 0.2, 1)`;
                el.style.transform = end;
            });
        });
        // transitionend can be skipped (e.g. background tabs), so land on a timer too.
        const fallback = setTimeout(() => landed.current(), SPIN_MS + 200);
        return () => {
            cancelAnimationFrame(outer);
            cancelAnimationFrame(inner);
            clearTimeout(fallback);
        };
    }, [strip]);

    return (
        <div ref={ref} onTransitionEnd={() => landed.current()}>
            {strip.map((name, i) => (
                <ReelText key={i} className={i === strip.length - 1 ? 'text-accent' : undefined}>{name}</ReelText>
            ))}
        </div>
    );
}

function Lights() {
    return (
        <div className="mb-3 flex justify-center gap-2" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
                <span key={i} className={cn('h-1.5 w-1.5 rounded-full', i % 2 ? 'bg-primary' : 'bg-accent')} />
            ))}
        </div>
    );
}

function ResultDetails({ business, likedPlaces, onDisliked, demo }: {
    business: Business;
    likedPlaces: Business[];
    onDisliked: (business: Business) => void;
    demo?: boolean;
}) {
    const [user] = useAuthState(auth);
    // This component is keyed by business id, so these reset on each spin.
    // `liked` falls back to the saved likes until the user toggles it.
    const [likedOverride, setLiked] = useState<boolean | null>(null);
    const [disliked, setDisliked] = useState<boolean>(false);
    const [imageFailed, setImageFailed] = useState(false);
    const [copied, setCopied] = useState(false);
    const liked = likedOverride ?? likedPlaces.some((place) => place.id === business.id);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({ title: business.name, url: business.url });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            await navigator.clipboard.writeText(business.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleLiked = async () => {
        if (!user) return;
        if (liked) {
            await removedLikedPlace(user.uid, business);
        } else {
            if (disliked) {
                await removedDislikedPlace(user.uid, business);
                setDisliked(false);
            }
            await addLikedPlace(user.uid, business);
        }
        setLiked(!liked);
    };

    const handleDislike = async () => {
        if (!user) return;
        if (disliked) {
            await removedDislikedPlace(user.uid, business);
        } else {
            if (liked) {
                await removedLikedPlace(user.uid, business);
                setLiked(false);
            }
            await addDislikedPlace(user.uid, business);
            onDisliked(business);
        }
        setDisliked((prev) => !prev);
    };

    return (
        <div className={cn('grid gap-5 p-5 sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500', !demo && 'sm:grid-cols-[180px_1fr]')}>
            {!demo && (
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-secondary sm:aspect-square">
                    {business.image_url && !imageFailed ? (
                        // eslint-disable-next-line @next/next/no-img-element -- served via our signed photo redirect
                        <img src={business.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" onError={() => setImageFailed(true)} />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            <UtensilsCrossed className="h-10 w-10" aria-hidden />
                        </div>
                    )}
                </div>
            )}

            <div className="flex min-w-0 flex-col">
                {demo ? (
                    <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{business.name}</h2>
                ) : (
                    <a href={business.url} target="_blank" rel="noreferrer noopener" className="w-fit hover:underline">
                        <h2 className="text-2xl font-bold leading-tight sm:text-3xl">{business.name}</h2>
                    </a>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {business.rating ? (
                        <span className="inline-flex items-center gap-1 font-semibold">
                            <Star className="h-4 w-4 fill-accent text-accent" aria-hidden />
                            {business.rating.toFixed(1)}
                            {business.review_count ? <span className="font-normal text-muted-foreground">({business.review_count.toLocaleString()})</span> : null}
                        </span>
                    ) : null}
                    {business.price && <span className="rounded-full bg-secondary px-2 py-0.5 font-semibold">{business.price}</span>}
                    <span className="inline-flex items-center gap-1 font-medium text-success">
                        <span className="h-2 w-2 rounded-full bg-success" /> Open now
                    </span>
                </div>

                <p className="mt-3 flex gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    {formatAddress(business)}
                </p>

                {business.photo_attribution && (
                    <a href={business.photo_attribution.uri} target="_blank" rel="noreferrer noopener" className="mt-1 text-xs text-muted-foreground/80 hover:underline">
                        Photo: {business.photo_attribution.name}
                    </a>
                )}

                {demo ? (
                    <p className="mt-auto pt-5 text-sm text-muted-foreground">
                        In the real app you can like it to save it, dislike it to never see it again, or get directions.
                    </p>
                ) : (
                    <div className="mt-auto flex flex-wrap gap-2 pt-5">
                        <Button variant={liked ? 'primary' : 'outline'} size="sm" onClick={handleLiked} aria-pressed={liked}
                            className={liked ? 'bg-success shadow-none hover:bg-success/90' : undefined}>
                            <ThumbsUp className="h-4 w-4" aria-hidden /> {liked ? 'Liked' : 'Like'}
                        </Button>
                        <Button variant={disliked ? 'primary' : 'outline'} size="sm" onClick={handleDislike} aria-pressed={disliked}
                            className={disliked ? 'bg-destructive shadow-none hover:bg-destructive/90' : undefined}>
                            <ThumbsDown className="h-4 w-4" aria-hidden /> {disliked ? 'Disliked' : 'Dislike'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare}>
                            {copied ? <Check className="h-4 w-4" aria-hidden /> : <Share2 className="h-4 w-4" aria-hidden />}
                            {copied ? 'Link copied' : 'Share'}
                        </Button>
                        <a href={business.url} target="_blank" rel="noreferrer noopener" className={buttonClasses('outline', 'sm')}>
                            <Navigation className="h-4 w-4" aria-hidden /> Directions
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}

function StatusPanel({ icon: Icon, title, hint, tone = 'muted', children }: {
    icon: LucideIcon;
    title: string;
    hint: string;
    tone?: 'muted' | 'error';
    children?: React.ReactNode;
}) {
    return (
        <div className="flex flex-col items-center px-6 py-10 text-center" role={tone === 'error' ? 'alert' : undefined}>
            <span className={cn(
                'flex h-12 w-12 items-center justify-center rounded-2xl',
                tone === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-muted-foreground'
            )}>
                <Icon className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-4 text-xl font-bold">{title}</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{hint}</p>
            {children && <div className="mt-5 flex flex-wrap justify-center gap-2">{children}</div>}
        </div>
    );
}

const ERROR_ICONS: Partial<Record<SearchError['code'], LucideIcon>> = {
    DAILY_LIMIT: Clock,
    GUEST_LIMIT: UserPlus,
    LOCATION_NOT_FOUND: MapPinOff,
    NETWORK: WifiOff,
    UNAUTHENTICATED: LogIn,
};

export default function SlotMachine({ status, error, spin, likedPlaces, poolSize, canSpinAgain, onSpinAgain, onRetry, onDisliked, demo }: {
    status: MachineStatus;
    error?: SearchError | null;
    spin: Spin | null;
    likedPlaces: Business[];
    poolSize: number;
    canSpinAgain: boolean;
    onSpinAgain: () => void;
    // Omitted when the caller shows its own retry button (the mobile sheet's bottom bar).
    onRetry?: () => void;
    onDisliked: (business: Business) => void;
    // The welcome page's sample spin: no saving, sharing or outbound links.
    demo?: boolean;
}) {
    const [landedId, setLandedId] = useState<number | null>(null);
    const landed = spin !== null && landedId === spin.id;

    return (
        <Card className="overflow-hidden">
            <div className="bg-background p-5 sm:p-6">
                <Lights />
                <ReelWindow>
                    {status === 'loading' ? (
                        <div className="animate-reel-idle blur-[1px]">
                            {[...IDLE_WORDS, ...IDLE_WORDS].map((word, i) => <ReelText key={i}>{word}</ReelText>)}
                        </div>
                    ) : status === 'result' && spin ? (
                        <SpinningReel key={spin.id} strip={spin.strip} onLanded={() => setLandedId(spin.id)} />
                    ) : status === 'error' || status === 'empty' ? (
                        <ReelText className="text-red-300">No luck</ReelText>
                    ) : (
                        <ReelText className="tracking-[0.3em] text-accent">? ? ?</ReelText>
                    )}
                </ReelWindow>
                <p className="mt-3 text-center text-sm text-white/60" aria-live="polite">
                    {status === 'idle' && 'Set your filters and pull the lever.'}
                    {status === 'loading' && 'Finding places open right now…'}
                    {status === 'error' && 'The search didn’t go through.'}
                    {status === 'empty' && 'The search worked, but nothing came up.'}
                    {status === 'result' && (landed ? `Picked from ${poolSize} open ${poolSize === 1 ? 'spot' : 'spots'}` : 'Spinning…')}
                </p>
            </div>

            {status === 'result' && spin && landed ? (
                <>
                    <ResultDetails key={spin.business.id} business={spin.business} likedPlaces={likedPlaces} onDisliked={onDisliked} demo={demo} />
                    <div className="flex flex-col items-center gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-between sm:px-6">
                        <p className="text-xs text-muted-foreground">{demo ? 'Sample restaurants for the demo' : 'Restaurant data from Google Maps'}</p>
                        {canSpinAgain && (
                            <Button variant="secondary" size="sm" onClick={onSpinAgain}>
                                <Dices className="h-4 w-4" aria-hidden /> Spin again
                            </Button>
                        )}
                    </div>
                </>
            ) : status === 'error' && error ? (
                <StatusPanel icon={ERROR_ICONS[error.code] ?? AlertTriangle} title={error.title} hint={error.hint} tone="error">
                    {error.retryable && onRetry && (
                        <Button onClick={onRetry}>
                            <RotateCw className="h-4 w-4" aria-hidden /> Try again
                        </Button>
                    )}
                    {canSpinAgain && (
                        <Button variant="secondary" onClick={onSpinAgain}>
                            <Dices className="h-4 w-4" aria-hidden /> Spin last results
                        </Button>
                    )}
                    {error.code === 'GUEST_LIMIT' && (
                        <Link href="/sign-up" className={buttonClasses('primary')}>Create a free account</Link>
                    )}
                    {error.code === 'UNAUTHENTICATED' && (
                        <Link href="/sign-in" className={buttonClasses('primary')}>Sign in again</Link>
                    )}
                </StatusPanel>
            ) : status === 'empty' ? (
                <StatusPanel
                    icon={SearchX}
                    title="Nothing open matches"
                    hint="Try a wider distance, fewer price filters, or a different craving, then pull the lever again."
                />
            ) : (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center text-muted-foreground">
                    <UtensilsCrossed className="h-8 w-8" aria-hidden />
                    <p className="max-w-xs text-sm">
                        {status === 'result' ? 'Hold tight…' : 'Your next meal shows up here.'}
                    </p>
                </div>
            )}
        </Card>
    );
}
