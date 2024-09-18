"use client"
import ThemeToggle from '@/components/theme-toggle'
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/firebaseConfig'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import Cookies from 'js-cookie'

export default function page() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = () => {
    signOut(auth);
    Cookies.remove('user');
    router.push('/sign-in');
  };

  return (
    <div className="bg-blue-500 flex flex-col items-center justify-center">
      <button onClick={handleLogout}>
        Log Out
      </button>
      <h1 className="text-3xl">Home</h1>
      <h2 className="text-xl">What do you want to eat?</h2>
      <ThemeToggle />
    </div>
  )
}
