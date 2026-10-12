"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/app/firebase/firebaseConfig';
import { addUser } from '../firebase/firestore';
import { setSessionCookie, signInWithGoogle } from '@/app/firebase/auth';
import { AuthShell, Divider, GoogleMark, PasswordInput } from '../components/AuthShell';
import { Alert, Button, Field, Input } from '../components/ui';
import { authErrorMessage } from '@/lib/authErrors';

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
        run('email', async () => {
            const { user } = await createUserWithEmailAndPassword(auth, email, password);
            await addUser(user.uid, email);
            setSessionCookie(user);
        });
    };

    return (
        <AuthShell
            title="Create your account"
            subtitle="Keep the spots you like and never see the ones you don't."
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
        </AuthShell>
    );
};

export default SignUp;
