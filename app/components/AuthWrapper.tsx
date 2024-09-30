import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase/firebaseConfig';
import ResponsiveAppBar from './AppBar';

interface AuthWrapperProps {
    children: (user: any) => React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
    const [user] = useAuthState(auth);

    return (
        <div className="bg-blue-400 flex flex-col items-center justify-center rounded-md">
            <ResponsiveAppBar />
            {user ? children(user) : <div>Please log in to view.</div>}
        </div>
    );
};

export default AuthWrapper;