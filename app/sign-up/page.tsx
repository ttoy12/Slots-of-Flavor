"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithGoogle, signUpWithEmail } from '@/app/firebase/auth';
import { AuthShell, Divider, GoogleMark, PasswordInput } from '../components/AuthShell';
import { Alert, Button, Field, Input } from '../components/ui';
import { authErrorMessage } from '@/lib/authErrors';
import { USER_DAILY_SEARCH_LIMIT } from '@/lib/searchLimit';

const SignUp: React.FC = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [pending, setPending] = useState<'email' | 'google' | null>(null);
    const [error, setError] = useState<string | null>(null);

    const run = async (kind: 'email' | 'google', action: () => Promise<void>) => {
        setPending(kind);
        setError(null);
        try {
            await action();
            router.push('/');
        } catch (e) {
            console.error(e);
            setError(authErrorMessage(e));
        } finally {
            setPending(null);
        }
    };

    const handleSignUp = (e: React.FormEvent) => {
        e.preventDefault();
        run('email', async () => { await signUpWithEmail(email, password); });
    };

    return (
        <AuthShell
            title="Create your account"
            subtitle={`Get ${USER_DAILY_SEARCH_LIMIT} searches a day, keep the spots you like and never see the ones you don't.`}
            footer={<>Already have an account? <Link href="/sign-in" className="font-semibold text-white hover:underline">Sign in</Link></>}
        >
            <Button variant="outline" className="w-full" onClick={() => run('google', async () => { await signInWithGoogle(); })} loading={pending === 'google'} disabled={pending !== null}>
                {pending !== 'google' && <GoogleMark />}
                Sign up with Google
            </Button>

            <Divider label="or" />

            <form onSubmit={handleSignUp} className="space-y-4">
                <Field label="Email" htmlFor="email">
                    <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label="Password" htmlFor="password" hint="At least 6 characters.">
                    <PasswordInput id="password" autoComplete="new-password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
                </Field>
                {error && <Alert>{error}</Alert>}
                <Button type="submit" className="w-full" loading={pending === 'email'} disabled={pending !== null}>Create account</Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link href="/terms" className="font-medium text-foreground underline underline-offset-2">Terms of Service</Link> and{' '}
                <Link href="/privacy" className="font-medium text-foreground underline underline-offset-2">Privacy Policy</Link>.
            </p>
        </AuthShell>
    );
};

export default SignUp;
