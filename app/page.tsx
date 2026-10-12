"use client";
import React, { useEffect, useRef, useState } from 'react';
import { Dices, History, RotateCw, SlidersHorizontal, X } from 'lucide-react';
import AuthWrapper from './components/AuthWrapper';
import useFetchLikedAndDislikedPlaces from './hooks/useFetchLikedAndDislikedPlaces';
import { Business, getSearchesRemaining } from './firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase/firebaseConfig';
import LocationAutocomplete from './components/LocationAutocomplete';
import SlotMachine, { MachineStatus, Spin } from './components/SlotMachine';
import { Button, Card, Chip, Field, Input } from './components/ui';
import useIsMobile from './hooks/useIsMobile';
import { cn } from '@/lib/utils';
import { DAILY_SEARCH_LIMIT, SearchError } from '@/lib/searchLimit';

const CRAVINGS = ['Pizza', 'Sushi', 'Tacos', 'Burgers', 'Ramen', 'Thai', 'Brunch', 'Bar'];

const DISTANCES = [
  { label: 'Any', value: '' },
  { label: '1 mi', value: '1610' },
  { label: '5 mi', value: '8047' },
  { label: '10 mi', value: '16094' },
  { label: '25 mi', value: '40234' },
];

const PRICES = ['1', '2', '3', '4'];

const networkError = (): SearchError => ({
  code: 'NETWORK',
  title: navigator.onLine ? 'Couldn’t reach Slots of Flavor' : 'You’re offline',
  hint: 'Check your connection and try again.',
  retryable: true,
});

const unknownError = (): SearchError => ({
  code: 'UPSTREAM',
  title: 'Something went wrong',
  hint: 'The search failed for an unexpected reason. Try again in a moment.',
  retryable: true,
});
const REEL_LENGTH = 16;

// Picks a random business, avoiding `exclude` so "Spin again" always changes.
const pickRandom = (list: Business[], exclude?: Business | null) => {
  const candidates = list.length > 1 && exclude ? list.filter(b => b.id !== exclude.id) : list;
  return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
};

// Builds the names the reel rolls through before landing on `business`.
const buildSpin = (list: Business[], business: Business): Spin => {
  const others = list.filter(b => b.id !== business.id).map(b => b.name);
  const filler = others.length ? others : ['…'];
  const strip = Array.from({ length: REEL_LENGTH }, () => filler[Math.floor(Math.random() * filler.length)]);
  return { id: Date.now(), business, strip: [...strip, business.name] };
};

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [location, setLocation] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [price, setPrice] = useState<string[]>([]);
  const [spin, setSpin] = useState<Spin | null>(null);
  const [status, setStatus] = useState<MachineStatus>('idle');
  const [error, setError] = useState<SearchError | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isMobile = useIsMobile();
  // On phones the machine lives in a full-screen sheet so the reel is always in view.
  const showSheet = isMobile && sheetOpen;

  useEffect(() => {
    if (!showSheet) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSheetOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showSheet]);
  const [user] = useAuthState(auth);
  const { likedPlaces, dislikedPlaces } = useFetchLikedAndDislikedPlaces(user?.uid);
  const outOfSearches = remaining === 0;

  useEffect(() => {
    if (!user) return;
    getSearchesRemaining().then(setRemaining);
  }, [user]);

  const getBusinessList = async (location: string) => {
    if (!user) {
      setError({ code: 'UNAUTHENTICATED', title: 'Your session has expired', hint: 'Sign in again to keep searching.', retryable: false });
      setStatus('error');
      return;
    }
    const params = new URLSearchParams({ location });
    if (term.trim()) params.set('term', term.trim());
    if (price.length) params.set('price', price.join(','));
    if (distance) params.set('distance', distance);

    setStatus('loading');
    setError(null);

    let response: Response;
    try {
      response = await fetch(`/api/places?${params}`, {
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
      });
    } catch (err) {
      console.error(err);
      setError(networkError());
      setStatus('error');
      return;
    }

    // A crashed or timed-out function can return HTML instead of JSON.
    const data = await response.json().catch(() => null);
    if (!response.ok || !data) {
      const searchError: SearchError = data?.error?.title ? data.error : unknownError();
      if (searchError.code === 'DAILY_LIMIT') setRemaining(0);
      // Keep any earlier results so "Spin again" still works.
      setError(searchError);
      setStatus('error');
      return;
    }

    if (typeof data.remaining === 'number') setRemaining(data.remaining);
    const filteredData = (data.places as Business[]).filter(business => !dislikedPlaces.some(disliked => disliked.id === business.id));
    setBusinesses(filteredData);
    const pick = pickRandom(filteredData);
    setSpin(pick ? buildSpin(filteredData, pick) : null);
    setStatus(pick ? 'result' : 'empty');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (location.trim() && !outOfSearches) {
      setSheetOpen(true);
      getBusinessList(location.trim());
    }
  };

  const handleSpinAgain = () => {
    const pick = pickRandom(businesses, spin?.business);
    if (pick) {
      setSpin(buildSpin(businesses, pick));
      setStatus('result');
    }
    // The reel is at the top of the sheet; scroll back up so the spin is visible.
    sheetRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // After a failed search the last results are kept, so any of them is fair game.
  const canSpinAgain = status === 'error' ? businesses.length > 0 : businesses.some(b => b.id !== spin?.business.id);
  const canRetry = status === 'error' && !!error?.retryable;
  const handleRetry = () => {
    if (location.trim()) getBusinessList(location.trim());
  };

  // Disliked places drop out of this search's pool so "Spin again" skips them.
  const handleDisliked = (business: Business) => {
    setBusinesses(prev => prev.filter(b => b.id !== business.id));
  };

  const togglePrice = (value: string) => {
    setPrice((prev) =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value].sort()
    );
  };

  return (
    <AuthWrapper>
      {(user) => (
        <div className="pt-4">
          <div className="mb-8 text-white">
            <p className="text-sm text-white/70">Hey {user.displayName?.split(' ')[0] ?? user.email?.split('@')[0]} 👋</p>
            <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl text-balance">Where are we eating tonight?</h1>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[380px_1fr]">
            <Card className="p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Field label="Where" htmlFor="location">
                  <LocationAutocomplete id="location" location={location} setLocation={setLocation} />
                </Field>

                <Field label="Craving" htmlFor="term">
                  <Input
                    id="term"
                    placeholder="Anything (or type a cuisine)"
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {CRAVINGS.map((craving) => (
                      <Chip
                        key={craving}
                        selected={term.toLowerCase() === craving.toLowerCase()}
                        onClick={() => setTerm(term.toLowerCase() === craving.toLowerCase() ? '' : craving)}
                        className="h-8 px-3 text-xs"
                      >
                        {craving}
                      </Chip>
                    ))}
                  </div>
                </Field>

                <fieldset className="space-y-1.5">
                  <legend className="mb-1.5 text-sm font-semibold">How far</legend>
                  <div className="grid grid-cols-5 gap-1 rounded-full bg-secondary p-1">
                    {DISTANCES.map(({ label, value }) => (
                      <button
                        key={label}
                        type="button"
                        aria-pressed={distance === value}
                        onClick={() => setDistance(value)}
                        className={`h-8 rounded-full text-xs font-semibold transition-colors ${distance === value ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <fieldset className="space-y-1.5">
                  <legend className="mb-1.5 text-sm font-semibold">
                    Price <span className="font-normal text-muted-foreground">{price.length ? '' : '· any'}</span>
                  </legend>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRICES.map((value) => (
                      <Chip key={value} selected={price.includes(value)} onClick={() => togglePrice(value)}>
                        {'$'.repeat(Number(value))}
                      </Chip>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-2">
                  <Button type="submit" size="lg" className="w-full" loading={status === 'loading'} disabled={outOfSearches}>
                    {status !== 'loading' && <Dices className="h-5 w-5" aria-hidden />}
                    {status === 'loading' ? 'Spinning…' : outOfSearches ? 'Out of searches today' : 'Pull the lever'}
                  </Button>
                  {remaining !== null && (
                    <p className={cn('text-center text-xs', outOfSearches ? 'text-destructive' : 'text-muted-foreground')} aria-live="polite">
                      {outOfSearches
                        ? 'Searches reset at midnight Pacific. You can still use "Spin again" on results you already have.'
                        : `${remaining} of ${DAILY_SEARCH_LIMIT} searches left today`}
                    </p>
                  )}
                </div>
                {isMobile && status !== 'idle' && (
                  <Button type="button" variant="ghost" className="-mt-3 w-full" onClick={() => setSheetOpen(true)}>
                    <History className="h-4 w-4" aria-hidden /> Back to your last spin
                  </Button>
                )}
              </form>
            </Card>

            <div
              ref={sheetRef}
              role={showSheet ? 'dialog' : undefined}
              aria-modal={showSheet || undefined}
              aria-label={showSheet ? 'Your spin' : undefined}
              className={cn(
                isMobile && !sheetOpen && 'hidden',
                showSheet && 'fixed inset-0 z-40 flex flex-col overflow-y-auto bg-background/95 backdrop-blur-md animate-in fade-in slide-in-from-bottom-10 duration-300'
              )}
            >
              {showSheet && (
                <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur">
                  <span className="font-display text-lg font-bold text-white">Your spin</span>
                  <button
                    ref={closeRef}
                    onClick={() => setSheetOpen(false)}
                    aria-label="Close"
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className={cn(showSheet && 'flex-1 px-3 pb-3')}>
                <SlotMachine
                  status={status}
                  error={error}
                  spin={spin}
                  likedPlaces={likedPlaces}
                  poolSize={businesses.length}
                  canSpinAgain={canSpinAgain && !isMobile}
                  onSpinAgain={handleSpinAgain}
                  onRetry={isMobile ? undefined : handleRetry}
                  onDisliked={handleDisliked}
                />
              </div>
              {showSheet && (
                <div className="sticky bottom-0 grid grid-cols-2 gap-2 bg-background/90 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
                  <Button variant="glass" size="lg" onClick={() => setSheetOpen(false)}>
                    <SlidersHorizontal className="h-4 w-4" aria-hidden /> Edit search
                  </Button>
                  {canRetry ? (
                    <Button size="lg" onClick={handleRetry}>
                      <RotateCw className="h-4 w-4" aria-hidden /> Try again
                    </Button>
                  ) : (
                    <Button size="lg" onClick={handleSpinAgain} disabled={status === 'loading' || !canSpinAgain}>
                      <Dices className="h-5 w-5" aria-hidden /> Spin again
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
}
