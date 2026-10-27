"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Dices, MapPin, Navigation, Star, ThumbsDown, ThumbsUp, Trash2, UserPlus, UtensilsCrossed } from 'lucide-react';
import type { User } from 'firebase/auth';
import AuthWrapper from '../components/AuthWrapper';
import DeleteAccount from '../components/DeleteAccount';
import { buttonClasses, Card, Spinner } from '../components/ui';
import useFetchLikedAndDislikedPlaces from '../hooks/useFetchLikedAndDislikedPlaces';
import { addDislikedPlace, addLikedPlace, Business, formatAddress, removedDislikedPlace, removedLikedPlace } from '../firebase/firestore';
import { cn } from '@/lib/utils';
import { USER_DAILY_SEARCH_LIMIT } from '@/lib/searchLimit';

type Tab = 'liked' | 'disliked';

function PlaceCard({ place, tab, userID, onUpdate }: { place: Business; tab: Tab; userID: string; onUpdate: () => void }) {
    const [busy, setBusy] = useState(false);
    const [imageFailed, setImageFailed] = useState(false);

    const act = async (action: () => Promise<void>) => {
        setBusy(true);
        try {
            await action();
            onUpdate();
        } finally {
            setBusy(false);
        }
    };

    const remove = () => act(() => (tab === 'liked' ? removedLikedPlace : removedDislikedPlace)(userID, place));
    const move = () => act(async () => {
        if (tab === 'liked') {
            await addDislikedPlace(userID, place);
            await removedLikedPlace(userID, place);
        } else {
            await addLikedPlace(userID, place);
            await removedDislikedPlace(userID, place);
        }
    });

    const iconButton = 'flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50';

    return (
        <Card className={cn('flex flex-col overflow-hidden shadow-lg transition-opacity', busy && 'opacity-60')}>
            <div className="relative aspect-16/10 overflow-hidden bg-secondary">
                {place.image_url && !imageFailed ? (
                    // eslint-disable-next-line @next/next/no-img-element -- served via our signed photo redirect
                    <img src={place.image_url} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" onError={() => setImageFailed(true)} />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        <UtensilsCrossed className="h-8 w-8" aria-hidden />
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-lg font-bold leading-snug">{place.name}</h3>
                {(place.rating || place.price) && (
                    <p className="mt-1 flex items-center gap-2 text-sm">
                        {place.rating ? (
                            <span className="inline-flex items-center gap-1 font-semibold">
                                <Star className="h-3.5 w-3.5 fill-accent text-accent" aria-hidden /> {place.rating.toFixed(1)}
                            </span>
                        ) : null}
                        {place.price && <span className="text-muted-foreground">{place.price}</span>}
                    </p>
                )}
                <p className="mt-2 flex gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="line-clamp-2">{formatAddress(place)}</span>
                </p>
                <div className="mt-auto flex items-center gap-1 pt-4">
                    <a href={place.url} target="_blank" rel="noreferrer noopener" className={buttonClasses('outline', 'sm', 'mr-auto')}>
                        <Navigation className="h-4 w-4" aria-hidden /> Open
                    </a>
                    <button onClick={move} disabled={busy} className={iconButton}
                        title={tab === 'liked' ? 'Move to Disliked' : 'Move to Liked'} aria-label={tab === 'liked' ? 'Move to Disliked' : 'Move to Liked'}>
                        {tab === 'liked' ? <ThumbsDown className="h-4 w-4" /> : <ThumbsUp className="h-4 w-4" />}
                    </button>
                    <button onClick={remove} disabled={busy} className={cn(iconButton, 'hover:text-destructive')} title="Remove" aria-label="Remove">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </Card>
    );
}

// Guests have no account to delete; their spots carry over when they sign up.
function GuestSignUpPrompt() {
    return (
        <Card className="mt-12 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
                <h2 className="text-lg font-bold">You&rsquo;re spinning as a guest</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Create a free account to keep these spots and get {USER_DAILY_SEARCH_LIMIT} searches a day.
                </p>
            </div>
            <Link href="/sign-up" className={buttonClasses('primary', 'md', 'shrink-0')}>
                <UserPlus className="h-4 w-4" aria-hidden /> Create account
            </Link>
        </Card>
    );
}

function MyPlaces({ user }: { user: User }) {
    const userID = user.uid;
    const [tab, setTab] = useState<Tab>('liked');
    const { likedPlaces, dislikedPlaces, loading, handleUpdate } = useFetchLikedAndDislikedPlaces(userID);
    const places = tab === 'liked' ? likedPlaces : dislikedPlaces;

    const tabs: { id: Tab; label: string; count: number }[] = [
        { id: 'liked', label: 'Liked', count: likedPlaces.length },
        { id: 'disliked', label: 'Disliked', count: dislikedPlaces.length },
    ];

    return (
        <>
            <div role="tablist" aria-label="Liked and disliked places" className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-sm">
                {tabs.map(({ id, label, count }) => (
                    <button
                        key={id}
                        role="tab"
                        aria-selected={tab === id}
                        onClick={() => setTab(id)}
                        className={cn(
                            'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                            tab === id ? 'bg-white text-foreground' : 'text-white/80 hover:text-white'
                        )}
                    >
                        {label}
                        <span className={cn('rounded-full px-2 py-0.5 text-xs', tab === id ? 'bg-secondary' : 'bg-white/15')}>{count}</span>
                    </button>
                ))}
            </div>

            {tab === 'disliked' && dislikedPlaces.length > 0 && (
                <p className="-mt-3 mb-5 text-sm text-white/75">
                    These won&rsquo;t come up in your spins. Tap 👍 to move one back to Liked, or the trash can to give it another chance.
                </p>
            )}

            {loading ? (
                <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div>
            ) : places.length === 0 ? (
                <Card className="mx-auto max-w-md p-8 text-center">
                    <UtensilsCrossed className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden />
                    <h2 className="mt-4 text-xl font-bold">{tab === 'liked' ? 'No liked spots yet' : 'No disliked spots yet'}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {tab === 'liked'
                            ? 'Tap Like on a spin you enjoy and it lands here.'
                            : 'Places you dislike show up here and won’t come up in your spins.'}
                    </p>
                    <Link href="/" className={buttonClasses('primary', 'md', 'mt-6')}>
                        <Dices className="h-4 w-4" aria-hidden /> Go spin
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {places.map((place) => (
                        <PlaceCard key={place.id} place={place} tab={tab} userID={userID} onUpdate={handleUpdate} />
                    ))}
                </div>
            )}

            {!loading && (user.isAnonymous
                ? <GuestSignUpPrompt />
                : <DeleteAccount user={user} likedCount={likedPlaces.length} dislikedCount={dislikedPlaces.length} />)}
        </>
    );
}

export default function Profile() {
    return (
        <AuthWrapper>
            {(user) => (
                <div className="pt-4">
                    <div className="mb-6 text-white">
                        <p className="text-sm text-white/70">{user.email ?? 'Guest'}</p>
                        <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">Your spots</h1>
                    </div>
                    <MyPlaces user={user} />
                </div>
            )}
        </AuthWrapper>
    );
}
