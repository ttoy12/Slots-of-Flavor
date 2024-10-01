"use client";
import React from 'react';
import Image from 'next/image';
import RouteButton from '@/app/components/RouteButton';
import { Container, Typography, Button, Box } from '@mui/material';

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
                <RouteButton
                    pageName='sign-in'
                    className="w-full"
                >
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                            px: 2,
                            py: 1.5,
                            fontWeight: 'bold'
                        }}
                        className="transition duration-300 hover:bg-blue-600"
                    >
                        Try me!
                    </Button>
                </RouteButton>
            </Box>
        </Container>
    );
}
