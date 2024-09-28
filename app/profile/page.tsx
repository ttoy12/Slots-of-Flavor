"use client"
import AuthWrapper from '../components/AuthWrapper'
import TabsComponent from '../components/TabsComponent'

export default function Profile() {
    return (
        <AuthWrapper>
            {(user) => <TabsComponent userID={user.uid} />}
        </AuthWrapper>
    )
}
