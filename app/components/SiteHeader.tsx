"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import Cookies from "js-cookie";
import { LogOut } from "lucide-react";
import { auth } from "../firebase/firebaseConfig";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/", label: "Spin" },
    { href: "/profile", label: "My spots" },
];

export function Logo({ className }: { className?: string }) {
    return (
        <Image
            src="/slots-of-flavor-high-resolution-logo-transparent.png"
            alt="Slots of Flavor"
            width={2000}
            height={590}
            className={cn("h-auto filter-[invert(1)_brightness(1.6)]", className)}
            loading="eager"
        />
    );
}

export default function SiteHeader({ email }: { email?: string | null }) {
    const pathname = usePathname();
    const router = useRouter();
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;
        const close = (e: MouseEvent | KeyboardEvent) => {
            if (e instanceof KeyboardEvent ? e.key === "Escape" : !menuRef.current?.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", close);
        document.addEventListener("keydown", close);
        return () => {
            document.removeEventListener("mousedown", close);
            document.removeEventListener("keydown", close);
        };
    }, [menuOpen]);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            Cookies.remove("user");
            router.push("/sign-in");
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5">
            <Link href="/" className="shrink-0 rounded-md focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/70">
                <Logo className="w-28 sm:w-44" />
            </Link>

            <div className="flex items-center gap-1.5 sm:gap-3">
                <nav className="flex rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur-sm">
                    {NAV.map(({ href, label }) => (
                        <Link
                            key={href}
                            href={href}
                            aria-current={pathname === href ? "page" : undefined}
                            className={cn(
                                "whitespace-nowrap rounded-full px-2.5 py-1.5 text-sm font-semibold transition-colors sm:px-4",
                                pathname === href ? "bg-white text-foreground" : "text-white/80 hover:text-white"
                            )}
                        >
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setMenuOpen((open) => !open)}
                        aria-haspopup="menu"
                        aria-expanded={menuOpen}
                        aria-label="Account menu"
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-display text-base font-bold uppercase text-accent-foreground ring-2 ring-white/30 transition hover:ring-white/60 focus-visible:outline-hidden focus-visible:ring-white"
                    >
                        {email?.[0] ?? "?"}
                    </button>
                    {menuOpen && (
                        <div
                            role="menu"
                            className="absolute right-0 z-30 mt-2 w-60 overflow-hidden rounded-2xl bg-card p-1.5 shadow-xl ring-1 ring-black/5 animate-in fade-in slide-in-from-top-1"
                        >
                            <p className="truncate px-3 py-2 text-xs text-muted-foreground">{email}</p>
                            <button
                                role="menuitem"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium hover:bg-secondary"
                            >
                                <LogOut className="h-4 w-4" aria-hidden />
                                Sign out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
