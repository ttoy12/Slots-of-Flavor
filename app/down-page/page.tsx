"use client"
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const DownPage: React.FC = () => {
    const router = useRouter();

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
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mb: 2 }} gutterBottom>
                    Sorry, We Are Currently Down
                </Typography>
                <Typography variant="body1" gutterBottom>
                    We&apos;re working hard to get things back up and running. Please check back later!
                </Typography>

                <Box sx={{ marginTop: 3 }}>
                    <Typography variant="body2" gutterBottom>
                        For updates, check our Updates section in our GitHub repository:
                    </Typography>
                    <a href="https://github.com/ttoy12/Slots-of-Flavor/tree/main" target="_blank" rel="noopener noreferrer"
                        className="hover:text-blue-700 hover:underline"
                    >
                        View GitHub Repo
                    </a>
                </Box>
            </Box>
        </Box >
    );
};

export default DownPage;
