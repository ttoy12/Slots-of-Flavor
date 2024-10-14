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
import { Button, TextField, Typography, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';


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
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box sx={{ padding: 4, maxWidth: 400, borderRadius: 2, boxShadow: 3, backgroundColor: '#f7f7f7' }}>
                <Image
                    src="/slots-of-flavor-high-resolution-logo-transparent.png"
                    alt="logo"
                    height={500}
                    width={500}
                    style={{ marginBottom: '20px' }}
                />

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                />
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <IconButton onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                            </IconButton>
                        ),
                    }}
                />
                <Button
                    onClick={handleSignIn}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: 2 }}
                    disabled={loading}
                >
                    Sign In
                </Button>
                <Button
                    onClick={handleGoogleSignIn}
                    variant="outlined"
                    fullWidth
                    sx={{ marginTop: 2 }}
                >
                    <Image
                        src="/google-icon.png"
                        alt="Google Logo"
                        width={20}
                        height={20}
                        className="mr-2"
                    />
                    Sign in with Google
                </Button>
                {error && <Typography color="error" variant="body2" align="center" sx={{ marginTop: 2 }}>{error.message}</Typography>}
                <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
                    Don&apos;t have an account? <Link href="/sign-up" className="hover:text-blue-500 hover:underline">Click here to sign up</Link>
                </Typography>
                <Typography variant="body2" align="center" sx={{ marginTop: 2, cursor: 'pointer' }}
                    className="hover:text-blue-500 hover:underline"
                    onClick={() => setShowResetModal(true)}>
                    Forgot password?
                </Typography>
            </Box>

            <Dialog open={showResetModal} onClose={() => setShowResetModal(false)}>
                <DialogTitle>Reset Password</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        placeholder="Enter your email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        variant="outlined"
                        margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleResetPassword} color="primary">Send Reset Email</Button>
                    <Button onClick={() => setShowResetModal(false)}>Cancel</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};


export default SignIn;
