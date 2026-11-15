"use client";
import { useState } from 'react';
import Link from 'next/link';
import { Check, ThumbsDown, ThumbsUp, UtensilsCrossed, X } from 'lucide-react';
import { addDislikedPlace, addLikedPlace, addVisitedPlace, removedDislikedPlace, removedLikedPlace } from '../firebase/firestore';
import { clearLastPick, describePickDay, readDuePick } from '@/lib/lastPick';
import { Alert, Button, Card } from './ui';

type Step = 'ask' | 'rate' | 'done';

// Asks about the last spin on a later visit: "Did you make it to X?". A yes
// logs the place under Visited, then offers a quick like/dislike.
// Only rendered once the user is known, so it's safe to read storage up front.
export default function VisitPrompt({ userID }: { userID: string }) {
    const [pick, setPick] = useState(() => readDuePick(userID));
    const [whenText] = useState(() => (pick ? describePickDay(pick.pickedAt) : ''));
    const [step, setStep] = useState<Step>('ask');
    const [busy, setBusy] = useState(false);
    const [failed, setFailed] = useState(false);

    if (!pick) return null;
    const { business, pickedAt } = pick;

    const dismiss = () => {
        clearLastPick(userID, pickedAt);
        setPick(null);
    };

    const save = async (action: () => Promise<void>, next: Step) => {
        setBusy(true);
        setFailed(false);
        try {
            await action();
            setStep(next);
        } catch (err) {
            console.error(err);
            setFailed(true);
        } finally {
            setBusy(false);
        }
    };

    const confirmVisit = () => save(async () => {
        await addVisitedPlace(userID, business);
        clearLastPick(userID, pickedAt);
    }, 'rate');

    const rate = (liked: boolean) => save(async () => {
        if (liked) {
            await removedDislikedPlace(userID, business);
            await addLikedPlace(userID, business);
        } else {
            await removedLikedPlace(userID, business);
            await addDislikedPlace(userID, business);
        }
    }, 'done');

    return (
        <Card className="mb-6 p-4 sm:p-5 animate-in fade-in slide-in-from-top-2 duration-300" aria-live="polite">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
                        {step === 'ask' ? <UtensilsCrossed className="h-5 w-5" aria-hidden /> : <Check className="h-5 w-5 text-success" aria-hidden />}
                    </span>
                    <div className="min-w-0">
                        {step === 'ask' && (
                            <>
                                <h2 className="font-bold leading-snug">Did you make it to {business.name}?</h2>
                                <p className="text-sm text-muted-foreground">Your spin landed on it {whenText}.</p>
                            </>
                        )}
                        {step === 'rate' && (
                            <>
                                <h2 className="font-bold leading-snug">Added to Visited. How was {business.name}?</h2>
                                <p className="text-sm text-muted-foreground">Loved it saves it to Liked. Not for me keeps it out of your spins.</p>
                            </>
                        )}
                        {step === 'done' && (
                            <>
                                <h2 className="font-bold leading-snug">Got it, thanks!</h2>
                                <p className="text-sm text-muted-foreground">
                                    {business.name} is in <Link href="/profile" className="font-semibold underline">your spots</Link>.
                                </p>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {step === 'ask' && (
                        <>
                            <Button size="sm" onClick={confirmVisit} loading={busy}>Yes, I went</Button>
                            <Button size="sm" variant="ghost" onClick={dismiss} disabled={busy}>Not this time</Button>
                        </>
                    )}
                    {step === 'rate' && (
                        <>
                            <Button size="sm" variant="outline" onClick={() => rate(true)} disabled={busy}>
                                <ThumbsUp className="h-4 w-4" aria-hidden /> Loved it
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => rate(false)} disabled={busy}>
                                <ThumbsDown className="h-4 w-4" aria-hidden /> Not for me
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setPick(null)} disabled={busy}>Skip</Button>
                        </>
                    )}
                    {step === 'done' && (
                        <Button size="sm" variant="ghost" onClick={() => setPick(null)} aria-label="Dismiss">
                            <X className="h-4 w-4" aria-hidden />
                        </Button>
                    )}
                </div>
            </div>
            {failed && <div className="mt-3"><Alert>That didn&rsquo;t save. Check your connection and try again.</Alert></div>}
        </Card>
    );
}
