"use client"

import { useState } from 'react';
import { useSignInWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig';
import { useRouter } from 'next/navigation';
import { GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup, sendPasswordResetEmail } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { getDoc, doc } from 'firebase/firestore';
import { addUser } from '../firebase/firestore';
import { db } from '@/app/firebase/firebaseConfig';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';


const SignIn: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [signInWithEmailAndPassword, userCred, loading, error] = useSignInWithEmailAndPassword(auth);
    const router = useRouter();
    const [showResetModal, setShowResetModal] = useState<boolean>(false);
    const [resetEmail, setResetEmail] = useState<string>('');
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSignIn = async () => {
        try {
            const res = await signInWithEmailAndPassword(email, password);
            if (res?.user) {
                // console.log(res?.user?.email);
                Cookies.set('user', JSON.stringify({ email: email }), { expires: 7 }); // Expires in 7 days
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
            if (res?.user) {
                const email = res.user.email;
                if (email) {
                    const userDocRef = doc(db, 'users', res.user.uid);
                    const userDoc = await getDoc(userDocRef);

                    // if user does not exist, add them
                    if (!userDoc.exists()) {
                        await addUser(res.user.uid, email);
                    }
                }

                // set user cookies and redirect
                Cookies.set('user', JSON.stringify({ email: res.user.email }), { expires: 7 });
                router.push('/');
            }

        } catch (error) {
            console.error("Error initiating Google sign-in: ", error);
        }
    };


    const handleResetPassword = async () => {
        try {
            await sendPasswordResetEmail(auth, resetEmail);
            alert('Check your email for password reset!');
            setShowResetModal(false);
            setResetEmail('');
        } catch (error) {
            console.error("Error sending password reset email: ", error);
            alert('Failed to send reset email. Please check if you put a valid email address.')
        }
    }

    ////////////////// USE redirect when on production??
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
        <div className="min-h-screen flex items-center justify-center bg-gray-900 w-full" >
            <Image src="/Slots of Flavors png.png" alt="SOF logo" height={350} width={350} className='rounded-lg' />
            <div className="p-10 w-1/2">
                <h1 className="text-white text-2xl mb-5">Sign In</h1>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                />
                <div className="relative mb-4">
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 mb-4 bg-gray-700 rounded outline-none text-white placeholder-gray-500"
                    />
                    <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 cursor-pointer"
                    >
                        {showPassword ? <VisibilityIcon className="text-gray-500 hover:text-white" /> : <VisibilityOffIcon className="text-gray-500 hover:text-white" />}
                    </span>
                </div>
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
                <p className="text-center text-gray-400 mt-4 cursor-pointer hover:underline" onClick={() => setShowResetModal(true)}>
                    Forgot password?
                </p>
            </div>

            {showResetModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-5 rounded shadow-lg">
                        <h2 className="text-lg font-semibold mb-4">Reset Password</h2>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full p-3 mb-4 border border-gray-300 rounded"
                        />
                        <button
                            onClick={handleResetPassword}
                            className="w-full p-3 bg-indigo-600 text-white rounded hover:bg-indigo-500"
                        >
                            Send Reset Email
                        </button>
                        <button
                            onClick={() => setShowResetModal(false)}
                            className="w-full p-3 mt-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignIn;
