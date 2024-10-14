"use client";
import React from 'react';
import Image from 'next/image';
import { Container, Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Welcome() {
    const router = useRouter();

    const handleSignIn = () => {
        router.push('/sign-in');
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Box
                sx={{
                    padding: 4,
                    maxWidth: 400,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: '#f7f7f7',
                    textAlign: 'center',
                }}
            >
                <Image
                    src="/slots-of-flavor-high-resolution-logo-transparent.png"
                    alt="logo"
                    height={500}
                    width={500}
                    style={{ marginBottom: '20px' }}
                />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }}>
                    Welcome!
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Discover new dining experiences in your area.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    When you are unsure of what to eat or are looking for something new, we've got you covered!
                </Typography>
                <Button
                    onClick={handleSignIn}
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ marginTop: 2 }}
                >
                    Try me!
                </Button>
            </Box>
        </Box>
    );
}
