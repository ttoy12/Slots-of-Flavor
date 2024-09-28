"use client"
import ResponsiveAppBar from '../components/AppBar'
import TabsComponent from '../components/TabsComponent'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../firebase/firebaseConfig'


export default function Profile() {
    const [user] = useAuthState(auth);
    return (
        <div className="bg-blue-400">
            <ResponsiveAppBar />
            <div className="flex flex-col items-center justify-center p-8">
                {user ? (
                    <TabsComponent userID={user.uid} />
                ) : (
                    <div>Please log in to view your profile.</div>
                )}
            </div>
        </div>
    )
}
