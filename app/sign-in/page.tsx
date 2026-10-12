"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/firebase/firebaseConfig';
import { setSessionCookie, signInWithGoogle } from '@/app/firebase/auth';
import { AuthShell, Divider, GoogleMark, PasswordInput } from '../components/AuthShell';
import { Alert, Button, Field, Input } from '../components/ui';
import { authErrorMessage } from '@/lib/authErrors';

const SignIn: React.FC = () => {
    const router = useRouter();
    const [mode, setMode] = useState<'sign-in' | 'reset'>('sign-in');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [pending, setPending] = useState<'email' | 'google' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

    const run = async (kind: 'email' | 'google', action: () => Promise<void>) => {
        setPending(kind);
        setError(null);
        setNotice(null);
        try {
            await action();
        } catch (e) {
            console.error(e);
            setError(authErrorMessage(e));
        } finally {
            setPending(null);
        }
    };

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault();
        run('email', async () => {
            const { user } = await signInWithEmailAndPassword(auth, email, password);
            setSessionCookie(user);
            router.push('/');
        });
    };

    const handleGoogleSignIn = () => run('google', async () => {
        await signInWithGoogle();
        router.push('/');
    });

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        run('email', async () => {
            await sendPasswordResetEmail(auth, email);
            setNotice(`If ${email} has an account, a reset link is on its way.`);
        });
    };

    const switchMode = (next: 'sign-in' | 'reset') => {
        setMode(next);
        setError(null);
        setNotice(null);
    };

    if (mode === 'reset') {
        return (
            <AuthShell
                title="Reset password"
                subtitle="We'll email you a link to choose a new one."
                footer={<button onClick={() => switchMode('sign-in')} className="font-semibold text-white hover:underline">Back to sign in</button>}
            >
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <Field label="Email" htmlFor="reset-email">
                        <Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                    </Field>
                    {error && <Alert>{error}</Alert>}
                    {notice && <Alert tone="success">{notice}</Alert>}
                    <Button type="submit" className="w-full" loading={pending === 'email'}>Send reset link</Button>
                </form>
            </AuthShell>
        );
    }

    return (
        <AuthShell
            title="Welcome back"
            subtitle="Sign in to keep spinning."
            footer={<>New here? <Link href="/sign-up" className="font-semibold text-white hover:underline">Create an account</Link></>}
        >
            <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} loading={pending === 'google'} disabled={pending !== null}>
                {pending !== 'google' && <GoogleMark />}
                Continue with Google
            </Button>

            <Divider label="or" />

            <form onSubmit={handleSignIn} className="space-y-4">
                <Field label="Email" htmlFor="email">
                    <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between">
                        <label htmlFor="password" className="text-sm font-semibold">Password</label>
                        <button type="button" onClick={() => switchMode('reset')} className="text-xs font-medium text-primary hover:underline">
                            Forgot password?
                        </button>
                    </div>
                    <PasswordInput id="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                {error && <Alert>{error}</Alert>}
                <Button type="submit" className="w-full" loading={pending === 'email'} disabled={pending !== null}>Sign in</Button>
            </form>
        </AuthShell>
    );
};

export default SignIn;
