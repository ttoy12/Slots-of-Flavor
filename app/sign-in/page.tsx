"use client"

import { useState, useEffect } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';

const SignIn: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [signInWithEmailAndPassword, userCred, loading, error] = useSignInWithEmailAndPassword(auth);
    const router = useRouter()

    const handleSignIn = async () => {
        try {
            const res = await signInWithEmailAndPassword(email, password);
            if (res?.user) {
                console.log({ res });
                Cookies.set('user', JSON.stringify({ email }), { expires: 7 }); // Expires in 7 days
                setEmail('');
                setPassword('');
                router.push('/');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            // https://www.reddit.com/r/Firebase/comments/1doskev/signinwithredirect_is_not_signing_in_but/ 
            // sign in with redirect not working on local
            // const res = await signInWithRedirect(auth, new GoogleAuthProvider());
            // console.log({ res });
            const res = await signInWithPopup(auth, new GoogleAuthProvider());
            console.log({ res });
            if (res?.user) {
                Cookies.set('user', JSON.stringify({ email: res.user.email }), { expires: 7 });
                router.push('/');
            }

        } catch (error) {
            console.error("Error initiating Google sign-in: ", error);
        }
    };

    // useEffect(() => {
    //     const fetchRedirectResult = async () => {
    //         const result = await getRedirectResult(auth);
    //         console.log(result);
    //         if (result?.user) {
    //             Cookies.set('user', JSON.stringify({ email: result.user.email }), { expires: 7 });
    //             router.push('/');
    //         }
    //     };

    //     fetchRedirectResult();
    // }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                <h1 className="text-white text-2xl mb-5">Sign In</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                />
                <button
                    onClick={handleSignIn}
                    className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
                    disabled={loading} // Optional: disable button while loading
                >
                    Sign In
                </button>
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full p-3 mt-4 bg-white rounded flex items-center justify-center border border-gray-300 hover:bg-gray-100"
                >
                    <Image
                        src="/google-icon.png"
                        alt="Google Logo"
                        width={20}
                        height={20}
                        className="mr-2"
                    />
                    <span className="text-gray-800 font-medium">Sign in with Google</span>
                </button>
                {error && <p className="text-red-500 mt-3">{error.message}</p>}
                <p className="text-center text-gray-400 mt-4">
                    Don't have an account?&nbsp;
                    <Link href="/sign-up" className="text-indigo-500 hover:underline">
                        Click here to sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignIn;
