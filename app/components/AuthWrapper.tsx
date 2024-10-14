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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ width: '100%' }}>
                    <ResponsiveAppBar />
                    <Box>
                        {user ? (
                            children(user)
                        ) : (
                            <Typography variant="h6" align="center" sx={{ color: '#333' }}>
                                Please log in to view.
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Box>
        </UserProvider>
    );
};

export default AuthWrapper;
