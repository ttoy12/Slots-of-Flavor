"use client"

import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { addUser } from '../firebase/firestore';
import { useRouter } from 'next/navigation';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [createUserWithEmailAndPassword, userCred, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter();

    const handleSignUp = async () => {
        try {
            const res = await createUserWithEmailAndPassword(email, password);
            // console.log({ res });
            if (res?.user) {
                await addUser(res.user.uid, email);
                Cookies.set('user', JSON.stringify({ email }), { expires: 7 }); // Expires in 7 days
                setEmail('');
                setPassword('');
                router.push('/sign-in')
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 w-full">
            <div className="bg-gray-800 p-10 rounded-lg shadow-xl w-96">
                <h1 className="text-white text-2xl mb-5">Sign Up</h1>
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
                    onClick={handleSignUp}
                    className="w-full p-3 bg-indigo-600 rounded text-white hover:bg-indigo-500"
                    disabled={loading} // Optional: disable button while loading
                >
                    Sign Up
                </button>
                {error && <p className="text-red-500 mt-3">{error.message}</p>}
                <p className="text-center text-gray-400 mt-4">
                    Already have an account?&nbsp;
                    <Link href="/sign-in" className="text-indigo-500 hover:underline">
                        Click here to log in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;
