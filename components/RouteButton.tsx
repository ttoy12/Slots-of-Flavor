"use client"

import React from 'react'
import { useRouter } from 'next/navigation'

interface RouteButtonProps {
    pageName: string;
    children: React.ReactNode;
    className?: string;
}

const RouteButton: React.FC<RouteButtonProps> = ({ pageName, children, className }) => {
    const router = useRouter();

    const handleRoute = () => {
        router.push(`/${pageName}`);
    }

    return (
        <button onClick={handleRoute} className={className}>
            {children}
        </button>
    )
}

export default RouteButton;