import Link from 'next/link';
import { ArrowRight, Dices, MapPin, ThumbsUp } from 'lucide-react';
import { Logo } from '../components/SiteHeader';
import { buttonClasses } from '../components/ui';
import SiteFooter from '../components/SiteFooter';

const STEPS = [
    { icon: MapPin, title: 'Set the scene', body: 'Pick a city, a craving, how far you’ll go and what you want to spend.' },
    { icon: Dices, title: 'Pull the lever', body: 'We find restaurants open right now and spin up one at random.' },
    { icon: ThumbsUp, title: 'Like or dislike', body: 'Like it to save it, dislike it to never see it again, or just spin once more.' },
];

export default async function Welcome({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
    const { deleted } = await searchParams;
    return (
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4">
            <header className="flex items-center justify-between py-5">
                <Logo className="w-36 sm:w-44" />
                <Link href="/sign-in" className={buttonClasses('glass', 'sm')}>Sign in</Link>
            </header>

            {deleted && (
                <p role="status" className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur">
                    Your account and everything saved with it have been deleted. Thanks for spinning with us.
                </p>
            )}

            <section className="flex flex-1 flex-col justify-center py-16 text-white">
                <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-accent" /> Only shows places open right now
                </p>
                <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] sm:text-7xl text-balance">
                    Can&rsquo;t decide where to eat? <span className="text-accent">Pull the lever.</span>
                </h1>
                <p className="mt-6 max-w-xl text-lg text-white/80">
                    Tell us where you are and what you&rsquo;re in the mood for. We&rsquo;ll spin up a random restaurant
                    nearby, so you can stop scrolling and start eating.
                </p>
                <div className="mt-10 flex flex-wrap gap-3">
                    <Link href="/sign-up" className={buttonClasses('primary', 'lg')}>
                        Start spinning <ArrowRight className="h-5 w-5" aria-hidden />
                    </Link>
                    <Link href="/sign-in" className={buttonClasses('glass', 'lg')}>I have an account</Link>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                {STEPS.map(({ icon: Icon, title, body }, i) => (
                    <div key={title} className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white backdrop-blur-md">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                                <Icon className="h-5 w-5" aria-hidden />
                            </span>
                            <span className="font-display text-sm text-white/50">0{i + 1}</span>
                        </div>
                        <h2 className="text-lg font-bold">{title}</h2>
                        <p className="mt-1 text-sm text-white/75">{body}</p>
                    </div>
                ))}
            </section>

            <SiteFooter />
        </div>
    );
}
