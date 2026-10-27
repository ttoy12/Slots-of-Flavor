"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { startGuestSession } from '../firebase/auth';
import { Button } from './ui';

// Starts a guest session and opens the app, so visitors can try a search
// before making an account. Falls back to sign-up if guest sign-in fails
// (e.g. Anonymous sign-in isn't enabled in Firebase).
export default function GuestStartButton() {
    const router = useRouter();
    const [pending, setPending] = useState(false);

    const start = async () => {
        setPending(true);
        try {
            await startGuestSession();
            router.push('/');
        } catch (error) {
            console.error('Guest sign-in failed', error);
            router.push('/sign-up');
        }
    };

    return (
        <Button size="lg" onClick={start} loading={pending}>
            Try it free {!pending && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
    );
}
