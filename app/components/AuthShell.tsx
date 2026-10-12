"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Logo } from './SiteHeader';
import { Card, Input } from './ui';

export function AuthShell({ title, subtitle, children, footer }: {
    title: string;
    subtitle: string;
    children: React.ReactNode;
    footer: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
            <Link href="/welcome" className="mb-8">
                <Logo className="w-56" />
            </Link>
            <Card className="w-full max-w-md p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h1 className="text-3xl font-bold">{title}</h1>
                <p className="mt-1 mb-6 text-muted-foreground">{subtitle}</p>
                {children}
            </Card>
            <p className="mt-6 text-sm text-white/80">{footer}</p>
        </div>
    );
}

export function PasswordInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <Input {...props} type={visible ? 'text' : 'password'} className="pr-11" />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
            >
                {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
    );
}

export function Divider({ label }: { label: string }) {
    return (
        <div className="my-5 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            {label}
            <span className="h-px flex-1 bg-border" />
        </div>
    );
}

export function GoogleMark() {
    return <Image src="/google-icon.png" alt="" width={18} height={18} />;
}
