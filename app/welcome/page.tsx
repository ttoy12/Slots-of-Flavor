"use client"
import React from 'react';
import Image from 'next/image';
import RouteButton from '@/app/components/RouteButton';
<<<<<<< Updated upstream

export default function Welcome() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-black w-full" style={{ backgroundColor: '#f1efe7' }}>
            <Image src="/Slots of Flavors png.png" alt="SOF logo" height={400} width={400} />
            <p className="text-lg mb-6">Find new places to eat with a click of a button</p>
            <RouteButton pageName='sign-in' className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition duration-200">
                Try me!
            </RouteButton>
        </div>
=======
import { Container, Typography, Box } from '@mui/material';

export default function Welcome() {
    return (
        <Container
            maxWidth="sm"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: '#e0e0e0',
                padding: 2
            }}
        >
            <Image
                src="/slots-of-flavor-high-resolution-logo-transparent.png"
                alt="logo"
                height={500}
                width={500}
                style={{ marginBottom: '20px' }}
            />
            <Box
                sx={{
                    mt: 3,
                    width: '100%',
                    padding: 4,
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                    Welcome!
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Discover new dining experiences in your area.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    When you are unsure of what to eat or are looking for something new.
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    We&apos;ve got you covered!
                </Typography>
                <RouteButton pageName='sign-in' className="w-full transition duration-300 hover:bg-blue-600 bg-blue-500 text-white font-bold py-2 px-4 rounded">
                    Try me!
                </RouteButton>
            </Box>
        </Container>
>>>>>>> Stashed changes
    );
}
