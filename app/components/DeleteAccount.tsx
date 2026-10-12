"use client";
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { Trash2 } from 'lucide-react';
import { deleteAccount, reauthMethod } from '../firebase/auth';
import { authErrorMessage } from '@/lib/authErrors';
import { PasswordInput, GoogleMark } from './AuthShell';
import { Alert, Button, Card, Field } from './ui';

export default function DeleteAccount({ user, likedCount, dislikedCount }: {
    user: User;
    likedCount: number;
    dislikedCount: number;
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [password, setPassword] = useState('');
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const cancelRef = useRef<HTMLButtonElement>(null);
    const method = reauthMethod(user);

    useEffect(() => {
        if (!open) return;
        cancelRef.current?.focus();
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !deleting) setOpen(false);
        };
        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, deleting]);

    const close = () => {
        if (deleting) return;
        setOpen(false);
        setPassword('');
        setError(null);
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();
        setDeleting(true);
        setError(null);
        try {
            await deleteAccount(user, password);
            router.replace('/welcome?deleted=1');
        } catch (err) {
            console.error(err);
            setError(authErrorMessage(err) ?? (method === 'google' ? 'The Google confirmation was cancelled.' : null));
            setDeleting(false);
        }
    };

    return (
        <>
            <Card className="mt-12 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-lg font-bold">Delete account</h2>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Permanently delete your account and everything saved with it. This can&rsquo;t be undone.
                        </p>
                    </div>
                    <Button variant="outline" className="shrink-0 border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => setOpen(true)}>
                        <Trash2 className="h-4 w-4" aria-hidden /> Delete my account
                    </Button>
                </div>
            </Card>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-3 backdrop-blur-sm sm:items-center animate-in fade-in" onClick={close}>
                    <Card
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="delete-title"
                        aria-describedby="delete-description"
                        className="w-full max-w-md p-6 animate-in slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                            <Trash2 className="h-6 w-6" aria-hidden />
                        </span>
                        <h2 id="delete-title" className="mt-4 text-2xl font-bold">Delete your account?</h2>
                        <div id="delete-description" className="mt-2 space-y-2 text-sm text-muted-foreground">
                            <p>This permanently deletes:</p>
                            <ul className="list-disc space-y-1 pl-5">
                                <li>your account ({user.email})</li>
                                <li>{likedCount} liked and {dislikedCount} disliked {likedCount + dislikedCount === 1 ? 'place' : 'places'}</li>
                            </ul>
                            <p>You can&rsquo;t undo this. You&rsquo;re welcome to sign up again later.</p>
                        </div>

                        <form onSubmit={handleDelete} className="mt-5 space-y-4">
                            {method === 'password' && (
                                <Field label="Enter your password to confirm" htmlFor="delete-password">
                                    <PasswordInput
                                        id="delete-password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Field>
                            )}
                            {error && <Alert>{error}</Alert>}
                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                <Button ref={cancelRef} type="button" variant="ghost" onClick={close} disabled={deleting}>Cancel</Button>
                                <Button type="submit" loading={deleting} className="bg-destructive shadow-none hover:bg-destructive/90">
                                    {method === 'google' && !deleting && <GoogleMark />}
                                    {method === 'google' ? 'Confirm with Google & delete' : 'Delete forever'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}
