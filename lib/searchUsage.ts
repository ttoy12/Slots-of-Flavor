import { type SearchUsage, usageDayKey } from './searchLimit';

// Server-side access to the daily counters at usage/{YYYY-MM-DD} (everyone)
// and usage/{YYYY-MM-DD}/users/{uid} (one user) through the Firestore REST
// API, authenticated as the signed-in user. firestore.rules only lets the
// counts go up by one (to at most their limits), so clients can't reset them.
// Without firebase-admin this needs no service account.
const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const ROOT = `projects/${PROJECT_ID}/databases/(default)/documents`;
const DOCS = `https://firestore.googleapis.com/v1/${ROOT}`;

const counterPaths = (uid: string) => {
    const day = usageDayKey();
    return [`usage/${day}`, `usage/${day}/users/${uid}`];
};

async function readCount(idToken: string, path: string): Promise<number> {
    const res = await fetch(`${DOCS}/${path}`, {
        headers: { Authorization: `Bearer ${idToken}` },
        cache: 'no-store',
    });
    if (res.status === 404) return 0;
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const doc = await res.json();
    return Number(doc.fields?.count?.integerValue ?? 0);
}

// Returns today's searches, or null if the counters can't be read (e.g. rules
// not published yet). Callers fail open on null: the Google Cloud quota is
// still the hard cap.
export async function getSearchUsage(idToken: string, uid: string): Promise<SearchUsage | null> {
    try {
        const [total, user] = await Promise.all(counterPaths(uid).map((path) => readCount(idToken, path)));
        return { total, user };
    } catch (error) {
        console.warn('Search counter read failed', error);
        return null;
    }
}

// Atomically adds one search to both counters and returns the new totals, or
// null on failure.
export async function recordSearch(idToken: string, uid: string): Promise<SearchUsage | null> {
    try {
        const res = await fetch(`${DOCS}:commit`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                // An update with an empty mask upserts, so the first search of the day creates the docs.
                writes: counterPaths(uid).map((path) => ({
                    update: { name: `${ROOT}/${path}`, fields: {} },
                    updateMask: { fieldPaths: [] },
                    updateTransforms: [{ fieldPath: 'count', increment: { integerValue: '1' } }],
                })),
            }),
        });
        if (!res.ok) {
            console.warn('Search counter update failed', res.status, await res.text());
            return null;
        }
        const data = await res.json();
        const [total, user] = [0, 1].map((i) => Number(data.writeResults?.[i]?.transformResults?.[0]?.integerValue));
        return Number.isFinite(total) && Number.isFinite(user) ? { total, user } : null;
    } catch (error) {
        console.warn('Search counter update failed', error);
        return null;
    }
}
