import type { Business } from '@/app/firebase/firestore';

// The last restaurant a spin landed on, kept in this browser so the app can ask
// "Did you go?" on a later visit. It never leaves the device; a "yes" is what
// gets saved to the account (users/{uid}/visited).
export interface LastPick {
    business: Business;
    pickedAt: number;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
// Wait long enough for a meal to have happened, and stop asking once the pick is stale.
export const ASK_AFTER_MS = HOUR_MS;
export const ASK_UNTIL_MS = 14 * DAY_MS;

const storageKey = (userID: string) => `sof:lastPick:${userID}`;

// Storage can be unavailable (private windows, blocked site data); the prompt is
// a nicety, so every failure just means it doesn't show.
const read = (userID: string): LastPick | null => {
    try {
        const pick = JSON.parse(localStorage.getItem(storageKey(userID)) ?? 'null');
        return pick?.business?.id && typeof pick.pickedAt === 'number' ? pick : null;
    } catch {
        return null;
    }
};

export const saveLastPick = (userID: string, business: Business) => {
    try {
        localStorage.setItem(storageKey(userID), JSON.stringify({ business, pickedAt: Date.now() }));
    } catch {
        // ignore
    }
};

// Pass `pickedAt` to clear only that pick, so answering an old prompt doesn't
// wipe a newer spin made in the same session.
export const clearLastPick = (userID: string, pickedAt?: number) => {
    try {
        if (pickedAt !== undefined && read(userID)?.pickedAt !== pickedAt) return;
        localStorage.removeItem(storageKey(userID));
    } catch {
        // ignore
    }
};

export const isDue = (pick: LastPick, now: number) => {
    const age = now - pick.pickedAt;
    return age >= ASK_AFTER_MS && age <= ASK_UNTIL_MS;
};

// The stored pick, if it's the right age to ask about.
export const readDuePick = (userID: string): LastPick | null => {
    const pick = read(userID);
    return pick && isDue(pick, Date.now()) ? pick : null;
};

// "earlier today", "yesterday", "on Tuesday" or "on Nov 3".
export const describePickDay = (pickedAt: number, now: number = Date.now()) => {
    const startOfDay = (ms: number) => new Date(ms).setHours(0, 0, 0, 0);
    const days = Math.round((startOfDay(now) - startOfDay(pickedAt)) / DAY_MS);
    if (days <= 0) return 'earlier today';
    if (days === 1) return 'yesterday';
    const date = new Date(pickedAt);
    return days < 7
        ? `on ${date.toLocaleDateString(undefined, { weekday: 'long' })}`
        : `on ${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
};
