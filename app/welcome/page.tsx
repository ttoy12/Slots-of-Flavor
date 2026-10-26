import Link from 'next/link';
import { Dices, MapPin, ThumbsUp } from 'lucide-react';
import { Logo } from '../components/Brand';
import { buttonClasses } from '../components/ui';
import SiteFooter from '../components/SiteFooter';
import GuestStartButton from '../components/GuestStartButton';
import WelcomeDemo from '../components/WelcomeDemo';

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
                <Logo size="md" />
                <Link href="/sign-in" className={buttonClasses('glass', 'sm')}>Sign in</Link>
            </header>

            {deleted && (
                <p role="status" className="mt-4 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white backdrop-blur-sm">
                    Your account and everything saved with it have been deleted. Thanks for spinning with us.
                </p>
            )}

            <section className="grid flex-1 items-center gap-10 py-12 text-white sm:py-16 lg:grid-cols-[1fr_minmax(0,460px)]">
                <div>
                    <p className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm backdrop-blur-sm">
                        <span className="h-2 w-2 rounded-full bg-accent" /> Only shows places open right now
                    </p>
                    <h1 className="max-w-3xl text-5xl font-extrabold leading-[1.05] sm:text-7xl lg:text-6xl xl:text-7xl text-balance">
                        Can&rsquo;t decide where to eat? <span className="text-accent">Pull the lever.</span>
                    </h1>
                    <p className="mt-6 max-w-xl text-lg text-white/80">
                        Tell us where you are and what you&rsquo;re in the mood for. We&rsquo;ll spin up a random restaurant
                        nearby, so you can stop scrolling and start eating.
                    </p>
                    <div className="mt-10 flex flex-wrap gap-3">
                        <GuestStartButton />
                        <Link href="/sign-up" className={buttonClasses('glass', 'lg')}>Create an account</Link>
                    </div>
                    <p className="mt-3 text-sm text-white/70">No account needed for your first search.</p>
                </div>
                <div className="text-foreground">
                    <p className="mb-2 text-sm font-semibold text-white/80">Pick a craving to spin. These are sample restaurants.</p>
                    <WelcomeDemo />
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
