import ThemeToggle from '@/components/theme-toggle'
import React from 'react'

export default function page() {
  return (
    <div className="bg-blue-500 flex flex-col items-center justify-center">
      <h1 className="text-3xl">Home</h1>
      <h2 className="text-xl">What do you want to eat?</h2>
      <ThemeToggle />
    </div>
  )
}
