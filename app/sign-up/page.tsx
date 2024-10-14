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
import { Button, TextField, Typography, Box, IconButton } from '@mui/material';

const SignUp: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [createUserWithEmailAndPassword, userCred, loading, error] = useCreateUserWithEmailAndPassword(auth);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState<boolean>(false);

    const handleSignUp = async () => {
        try {
            const res = await createUserWithEmailAndPassword(email, password);
            if (res?.user) {
                await addUser(res.user.uid, email);
                Cookies.set('user', JSON.stringify({ email }), { expires: 7 });
                setEmail('');
                setPassword('');
                router.push('/sign-in');
            }
        } catch (e) {
            console.error(e);
        }
    };

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
                    onClick={handleSignUp}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: 2 }}
                    disabled={loading}
                >
                    Sign Up
                </Button>
                {error && <Typography color="error" variant="body2" align="center" sx={{ marginTop: 2 }}>{error.message}</Typography>}
                <Typography variant="body2" align="center" sx={{ marginTop: 2 }}>
                    Already have an account? <Link href="/sign-in" className="hover:text-blue-500 hover:underline">Click here to log in</Link>
                </Typography>
            </Box>
        </Box>
    );
};

export default SignUp;
