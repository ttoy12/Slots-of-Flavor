import ThemeToggle from '@/components/theme-toggle'
import React from 'react'

export default function page() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-3xl">Home</h1>
      <ThemeToggle />
    </div>
  )
}
