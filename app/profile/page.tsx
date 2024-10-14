"use client";
import AuthWrapper from '../components/AuthWrapper';
import TabsComponent from '../components/TabsComponent';
import { Box, Typography } from '@mui/material';

export default function Profile() {
    return (
        <AuthWrapper>
            {(user) => (
                <Box
                    sx={{
                        padding: 4,
                        maxWidth: 600,
                        margin: 'auto',
                        borderRadius: 2,
                        boxShadow: 3,
                        backgroundColor: '#f7f7f7'
                    }}
                >
                    <Typography variant="h4" component="h2" gutterBottom align="center"
                        style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: 'clamp(1rem, 5vw, 2rem)',
                        }}
                    >
                        {user.email}
                    </Typography>
                    <TabsComponent userID={user.uid} />
                </Box>
            )}
        </AuthWrapper>
    );
}
