"use client"
import ThemeToggle from '@/components/theme-toggle'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/firebaseConfig'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { signOut } from 'firebase/auth'

export default function page() {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const userSession = sessionStorage.getItem('user');

  if (!user && !userSession) {
    router.push('/sign-in')
  }

  return (
    <div className="bg-blue-500 flex flex-col items-center justify-center">
      <Button onClick={() => {
        signOut(auth)
        sessionStorage.removeItem('user')
      }}
      >
        Log Out
      </Button>
      <h1 className="text-3xl">Home</h1>
      <h2 className="text-xl">What do you want to eat?</h2>
      <ThemeToggle />
    </div>
  )
}
