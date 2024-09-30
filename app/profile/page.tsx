"use client"
import AuthWrapper from '../components/AuthWrapper'
import TabsComponent from '../components/TabsComponent'

export default function Profile() {
    return (
        <AuthWrapper>
            {(user) => (
                <>
                    <div>

                    </div>
                    <TabsComponent userID={user.uid} />
                </>
            )}
        </AuthWrapper>
    )
}
