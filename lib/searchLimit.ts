// Shared by the server route and the UI. Keep DAILY_SEARCH_LIMIT in sync with
// the cap in firestore.rules (usage/{day}) and the Google Cloud quota.
export const DAILY_SEARCH_LIMIT = 30;

// Google's per-day quotas reset at midnight Pacific, so the app's counter does too.
const TIME_ZONE = 'America/Los_Angeles';

export const usageDayKey = (date = new Date()) =>
    new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);

export function timeUntilReset(date = new Date()): string {
    const parts = Object.fromEntries(
        new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, hourCycle: 'h23', hour: '2-digit', minute: '2-digit' })
            .formatToParts(date)
            .map((p) => [p.type, p.value])
    );
    const minutesLeft = 24 * 60 - (Number(parts.hour) * 60 + Number(parts.minute));
    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;
    return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

// Error shape returned by /api/places and shown in the slot machine.
export interface SearchError {
    code: 'UNAUTHENTICATED' | 'BAD_REQUEST' | 'LOCATION_NOT_FOUND' | 'DAILY_LIMIT' | 'CONFIG' | 'UPSTREAM' | 'NETWORK';
    title: string;
    hint: string;
    retryable: boolean;
}
