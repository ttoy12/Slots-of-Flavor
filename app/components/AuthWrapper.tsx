"use client";
import React from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import type { User } from 'firebase/auth';
import { auth } from '../firebase/firebaseConfig';
import SiteHeader from './SiteHeader';
import { buttonClasses, Spinner } from './ui';
import SiteFooter from './SiteFooter';

interface AuthWrapperProps {
    children: (user: User) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [user, loading] = useAuthState(auth);

    return (
        <>
            <SiteHeader email={user?.email} />
            <main className="mx-auto max-w-6xl px-4 pb-16">
                {loading ? (
                    <div className="flex justify-center py-24"><Spinner className="h-8 w-8" /></div>
                ) : user ? (
                    children(user)
                ) : (
                    <div className="py-24 text-center text-white">
                        <p className="mb-4 text-lg">Your session has ended.</p>
                        <Link href="/sign-in" className={buttonClasses('primary')}>Sign in again</Link>
                    </div>
                )}
            </main>
            <SiteFooter className="-mt-8" />
        </>
    );
};

export default AuthWrapper;
