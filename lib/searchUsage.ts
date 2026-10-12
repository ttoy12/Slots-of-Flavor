import { DAILY_SEARCH_LIMIT, usageDayKey } from './searchLimit';

// Server-side access to the shared daily counter at usage/{YYYY-MM-DD} through
// the Firestore REST API, authenticated as the signed-in user. firestore.rules
// only lets the count go up by one (to at most the limit), so clients can't
// reset it. Without firebase-admin this needs no service account.
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const DOCS = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

// Returns how many searches have been used today, or null if the counter
// can't be read (e.g. rules not published yet). Callers fail open on null:
// the Google Cloud quota is still the hard cap.
export async function getSearchesUsed(idToken: string): Promise<number | null> {
    try {
        const res = await fetch(`${DOCS}/usage/${usageDayKey()}`, {
            headers: { Authorization: `Bearer ${idToken}` },
            cache: 'no-store',
        });
        if (res.status === 404) return 0;
        if (!res.ok) {
            console.warn('Search counter read failed', res.status, await res.text());
            return null;
        }
        const doc = await res.json();
        return Number(doc.fields?.count?.integerValue ?? 0);
    } catch (error) {
        console.warn('Search counter read failed', error);
        return null;
    }
}

// Atomically adds one search and returns the new total, or null on failure.
export async function recordSearch(idToken: string): Promise<number | null> {
    try {
        const res = await fetch(`${DOCS}:commit`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                writes: [{
                    // An update with an empty mask upserts, so the first search of the day creates the doc.
                    update: { name: `projects/${PROJECT_ID}/databases/(default)/documents/usage/${usageDayKey()}`, fields: {} },
                    updateMask: { fieldPaths: [] },
                    updateTransforms: [{ fieldPath: 'count', increment: { integerValue: '1' } }],
                }],
            }),
        });
        if (!res.ok) {
            console.warn('Search counter update failed', res.status, await res.text());
            return null;
        }
        const data = await res.json();
        return Number(data.writeResults?.[0]?.transformResults?.[0]?.integerValue ?? DAILY_SEARCH_LIMIT);
    } catch (error) {
        console.warn('Search counter update failed', error);
        return null;
    }
}
