"use client"
import React from 'react';
import Image from 'next/image';
import RouteButton from '@/app/components/RouteButton';

export default function Welcome() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-black w-full" style={{ backgroundColor: '#f1efe7' }}>
            <Image src="/Slots of Flavors png.png" alt="SOF logo" height={400} width={400} />
            <p className="text-lg mb-6">Find new places to eat with a click of a button</p>
            <RouteButton pageName='sign-in' className="px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition duration-200">
                Try me!
            </RouteButton>
        </div>
    );
}
