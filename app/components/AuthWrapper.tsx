import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import ResponsiveAppBar from './AppBar';
import { UserProvider } from './UserContext';
import { Box, Typography } from '@mui/material';

interface AuthWrapperProps {
    children: (user: any) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [user] = useAuthState(auth);

    return (
        <UserProvider>
            <Box
                sx={{
                    backgroundColor: '#f0f4f8',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-start',
                    borderRadius: 2,
                    width: '100%',
                    height: '100%'
                }}
            >
                <ResponsiveAppBar />
                <Box
                    sx={{
                        flex: 1,
                        width: '100%',
                        maxWidth: 600,
                        padding: 4,
                    }}
                >
                    {user ? (
                        children(user)
                    ) : (
                        <Typography variant="h6" align="center" sx={{ color: '#333' }}>
                            Please log in to view.
                        </Typography>
                    )}
                </Box>
            </Box>
        </UserProvider>
    );
};

export default AuthWrapper;
