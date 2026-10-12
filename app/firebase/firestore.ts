import { collection, deleteDoc, deleteField, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { DAILY_SEARCH_LIMIT, usageDayKey } from '@/lib/searchLimit';

// Normalized restaurant shape returned by /api/places and stored in Firestore.
// Places saved before the Google Places migration still have Yelp's shape
// (e.g. `location.display_address`), so read addresses via formatAddress.
export interface Business {
    id: string;
    name: string;
    url: string;
    website?: string | null;
    image_url: string | null;
    photo_attribution?: { name: string; uri: string } | null;
    address?: string;
    price: string;
    rating?: number | null;
    review_count?: number | null;
    [key: string]: any;
}

export const formatAddress = (business: Business): string => {
    if (business.address) return business.address;
    return business.location?.display_address?.join(', ') ?? '';
};

export const addUser = async (userID: string, email: string) => {
    await setDoc(doc(db, 'users', userID), {
        userID,
        email,
        createdAt: serverTimestamp(),
    });
    console.log("added user: ", email);
};

// Each saved place is its own doc at users/{uid}/{list}/{placeId}, so adds and
// removes only need the place id and never depend on the stored copy matching.
type PlaceList = 'liked' | 'disliked';

const placeRef = (userID: string, list: PlaceList, placeID: string) =>
    doc(db, 'users', userID, list, placeID);

// Users created before subcollections kept `liked`/`disliked` arrays on their
// user doc. Copy those into the subcollections once, then drop the arrays.
const migrateLegacyArrays = async (userID: string) => {
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    if (!data || (data.liked === undefined && data.disliked === undefined)) return;

    const batch = writeBatch(db);
    for (const list of ['liked', 'disliked'] as const) {
        for (const business of (data[list] ?? []) as Business[]) {
            if (business?.id) {
                batch.set(placeRef(userID, list, business.id), { ...business, savedAt: serverTimestamp() });
            }
        }
    }
    batch.update(userRef, { liked: deleteField(), disliked: deleteField() });
    await batch.commit();
};

const getPlaces = async (userID: string, list: PlaceList): Promise<Business[]> => {
    await migrateLegacyArrays(userID);
    const snapshot = await getDocs(query(collection(db, 'users', userID, list), orderBy('savedAt', 'desc')));
    return snapshot.docs.map((d) => {
        // savedAt is a Firestore Timestamp; keep it out of the plain Business object.
        const { savedAt: _savedAt, ...business } = d.data();
        return { ...business, id: d.id } as Business;
    });
};

const savePlace = async (userID: string, list: PlaceList, business: Business) => {
    await setDoc(placeRef(userID, list, business.id), { ...business, savedAt: serverTimestamp() });
};

const removePlace = async (userID: string, list: PlaceList, business: Business) => {
    await deleteDoc(placeRef(userID, list, business.id));
};

export const getLikedPlaces = (userID: string) => getPlaces(userID, 'liked');
export const getDislikedPlaces = (userID: string) => getPlaces(userID, 'disliked');
export const addLikedPlace = (userID: string, business: Business) => savePlace(userID, 'liked', business);
export const addDislikedPlace = (userID: string, business: Business) => savePlace(userID, 'disliked', business);
export const removedLikedPlace = (userID: string, business: Business) => removePlace(userID, 'liked', business);
export const removedDislikedPlace = (userID: string, business: Business) => removePlace(userID, 'disliked', business);

// Searches left today from the shared counter at usage/{day}, or null if it
// can't be read. The server enforces the limit; this is just for display.
export const getSearchesRemaining = async (): Promise<number | null> => {
    try {
        const usage = await getDoc(doc(db, 'usage', usageDayKey()));
        return Math.max(DAILY_SEARCH_LIMIT - (usage.data()?.count ?? 0), 0);
    } catch (error) {
        console.warn('Could not read search usage', error);
        return null;
    }
};
