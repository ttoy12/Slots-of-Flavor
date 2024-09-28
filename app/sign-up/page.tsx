"use client"

import { useState } from 'react';
import { useCreateUserWithEmailAndPassword } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/firebaseConfig';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { addUser } from '../firebase/firestore';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [createUserWithEmailAndPassword, userCred, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);

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
            <Image src="/Slots of Flavors png.png" alt="SOF logo" height={350} width={350} className='rounded-lg' />
            <div className="p-10 w-1/2">
                <h1 className="text-white text-2xl mb-5">Sign Up</h1>
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
