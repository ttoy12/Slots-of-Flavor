// Runs against the Firestore emulator: `npm run test:rules`.
import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, increment, setDoc, writeBatch, type Firestore } from 'firebase/firestore';

const DAY = '2026-10-17';
let env: RulesTestEnvironment;

const dbFor = (uid: string) => env.authenticatedContext(uid).firestore() as unknown as Firestore;
const totalRef = (db: Firestore) => doc(db, 'usage', DAY);
const userRef = (db: Firestore, uid: string) => doc(db, 'usage', DAY, 'users', uid);

// The same write the search route makes: one more search on both counters.
const recordSearch = (db: Firestore, uid: string) => {
    const batch = writeBatch(db);
    batch.set(totalRef(db), { count: increment(1) }, { merge: true });
    batch.set(userRef(db, uid), { count: increment(1) }, { merge: true });
    return batch.commit();
};

const seed = (path: string[], count: number) =>
    env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), path.join('/')), { count }));

beforeAll(async () => {
    env = await initializeTestEnvironment({
        projectId: 'demo-slots-of-flavor',
        firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
});

beforeEach(() => env.clearFirestore());
afterAll(() => env.cleanup());

describe('daily search counters', () => {
    it('lets a user record their first search of the day', async () => {
        await assertSucceeds(recordSearch(dbFor('alice'), 'alice'));
    });

    it('stops a user after 5 searches', async () => {
        const db = dbFor('alice');
        for (let i = 0; i < 5; i++) await assertSucceeds(recordSearch(db, 'alice'));
        await assertFails(recordSearch(db, 'alice'));
    });

    it('lets other users keep searching when one is out', async () => {
        await seed(['usage', DAY], 5);
        await seed(['usage', DAY, 'users', 'alice'], 5);
        await assertFails(recordSearch(dbFor('alice'), 'alice'));
        await assertSucceeds(recordSearch(dbFor('bob'), 'bob'));
    });

    it('stops everyone once the app hits 30', async () => {
        await seed(['usage', DAY], 30);
        await assertFails(recordSearch(dbFor('alice'), 'alice'));
    });

    it("won't raise the shared count without the caller's own count", async () => {
        const db = dbFor('mallory');
        await assertFails(setDoc(totalRef(db), { count: increment(1) }, { merge: true }));
        await seed(['usage', DAY], 3);
        await assertFails(setDoc(totalRef(db), { count: increment(1) }, { merge: true }));
    });

    it("won't spend someone else's searches", async () => {
        const db = dbFor('mallory');
        const batch = writeBatch(db);
        batch.set(totalRef(db), { count: increment(1) }, { merge: true });
        batch.set(userRef(db, 'alice'), { count: increment(1) }, { merge: true });
        await assertFails(batch.commit());
    });

    it('never lets a count be reset, skipped ahead or deleted', async () => {
        await seed(['usage', DAY], 4);
        await seed(['usage', DAY, 'users', 'alice'], 4);
        const db = dbFor('alice');
        await assertFails(setDoc(userRef(db, 'alice'), { count: 0 }));
        await assertFails(setDoc(userRef(db, 'alice'), { count: 6 }));
        await assertFails(deleteDoc(userRef(db, 'alice')));
        await assertFails(deleteDoc(totalRef(db)));
    });

    it("hides other users' counts but shows the shared one", async () => {
        const db = dbFor('alice');
        await assertSucceeds(getDoc(totalRef(db)));
        await assertSucceeds(getDoc(userRef(db, 'alice')));
        await assertFails(getDoc(userRef(db, 'bob')));
    });

    it('requires sign-in', async () => {
        const db = env.unauthenticatedContext().firestore() as unknown as Firestore;
        await assertFails(getDoc(totalRef(db)));
    });
});

describe('saved places', () => {
    it('only lets users touch their own places', async () => {
        const db = dbFor('alice');
        await assertSucceeds(setDoc(doc(db, 'users', 'alice', 'liked', 'p1'), { name: 'Tacos' }));
        await assertFails(setDoc(doc(db, 'users', 'bob', 'liked', 'p1'), { name: 'Tacos' }));
    });
});
