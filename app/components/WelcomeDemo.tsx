"use client";
import { useEffect, useRef, useState } from 'react';
import type { Business } from '../firebase/firestore';
import SlotMachine, { MachineStatus, Spin } from './SlotMachine';
import { Chip } from './ui';
import { buildSpin, pickRandom } from '@/lib/spin';
import { cn } from '@/lib/utils';

// Made-up restaurants, so the demo never calls Google or needs an account.
const sample = (id: string, name: string, craving: string, price: string, rating: number, review_count: number): Business => ({
    id,
    name,
    craving,
    url: '',
    image_url: null,
    address: 'Sample spot near you',
    price,
    rating,
    review_count,
});

const SAMPLES: Business[] = [
    sample('t1', 'Taco Lantern', 'Tacos', '$', 4.6, 812),
    sample('t2', 'Casa Cilantro', 'Tacos', '$$', 4.4, 390),
    sample('t3', 'The Salsa Bar', 'Tacos', '$', 4.2, 205),
    sample('r1', 'Noodle Lane', 'Ramen', '$$', 4.7, 1240),
    sample('r2', 'Midnight Broth', 'Ramen', '$$', 4.5, 640),
    sample('r3', 'Tonkotsu Corner', 'Ramen', '$', 4.3, 318),
    sample('p1', 'Slice of Luck', 'Pizza', '$', 4.5, 958),
    sample('p2', 'Brick Oven Social', 'Pizza', '$$', 4.6, 732),
    sample('p3', 'Mozzarella Moon', 'Pizza', '$$', 4.1, 154),
    sample('s1', 'Wasabi Wave', 'Sushi', '$$$', 4.8, 506),
    sample('s2', 'Roll Call', 'Sushi', '$$', 4.4, 377),
    sample('s3', 'Salmon Street', 'Sushi', '$$', 4.3, 289),
];

const CRAVINGS = ['Anything', 'Tacos', 'Ramen', 'Pizza', 'Sushi'];
const FAKE_SEARCH_MS = 600;

// A playable slot machine for the welcome page. It spins once on its own so
// visitors see what the app does before they click anything.
export default function WelcomeDemo() {
    const [craving, setCraving] = useState('Anything');
    const [status, setStatus] = useState<MachineStatus>('idle');
    const [spin, setSpin] = useState<Spin | null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
    const poolFor = (c: string) => (c === 'Anything' ? SAMPLES : SAMPLES.filter((b) => b.craving === c));
    const pool = poolFor(craving);

    const pull = (list: Business[], exclude?: Business | null) => {
        clearTimeout(timer.current);
        setStatus('loading');
        timer.current = setTimeout(() => {
            const pick = pickRandom(list, exclude);
            if (!pick) return;
            setSpin(buildSpin(list, pick));
            setStatus('result');
        }, FAKE_SEARCH_MS);
    };

    useEffect(() => {
        timer.current = setTimeout(() => pull(SAMPLES), 400);
        return () => clearTimeout(timer.current);
    }, []);

    // Picking a craving pulls the lever right away.
    const choose = (c: string) => {
        setCraving(c);
        pull(poolFor(c), spin?.business);
    };

    const spinAgain = () => {
        const pick = pickRandom(pool, spin?.business);
        if (pick) setSpin(buildSpin(pool, pick));
    };

    return (
        <div className="w-full">
            <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Pick a craving">
                {CRAVINGS.map((c) => (
                    <Chip key={c} selected={craving === c} onClick={() => choose(c)}
                        className={cn('h-8 px-3 text-xs', craving === c && 'border-accent bg-accent text-accent-foreground')}>
                        {c}
                    </Chip>
                ))}
            </div>
            <SlotMachine
                demo
                status={status}
                spin={spin}
                likedPlaces={[]}
                poolSize={pool.length}
                canSpinAgain={status === 'result' && pool.length > 1}
                onSpinAgain={spinAgain}
                onDisliked={() => {}}
            />
        </div>
    );
}
