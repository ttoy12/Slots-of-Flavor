import type { Business } from '@/app/firebase/firestore';
import type { Spin } from '@/app/components/SlotMachine';

const REEL_LENGTH = 16;

// Picks a random business, avoiding `exclude` so "Spin again" always changes.
export const pickRandom = (list: Business[], exclude?: Business | null) => {
    const candidates = list.length > 1 && exclude ? list.filter(b => b.id !== exclude.id) : list;
    return candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
};

// Builds the names the reel rolls through before landing on `business`.
export const buildSpin = (list: Business[], business: Business): Spin => {
    const others = list.filter(b => b.id !== business.id).map(b => b.name);
    const filler = others.length ? others : ['…'];
    const strip = Array.from({ length: REEL_LENGTH }, () => filler[Math.floor(Math.random() * filler.length)]);
    return { id: Date.now(), business, strip: [...strip, business.name] };
};
