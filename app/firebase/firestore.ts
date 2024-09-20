import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const addUser = async (uid: string, email: string) => {
    await setDoc(doc(db, 'users', uid), {
        email,
        visited: [],
        favorites: [],
        createdAt: serverTimestamp(),
    });
};


// need to still figure out what the place will be. URL maybe?
export const addVisitedPlace = async (uid: string, placeId: string) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        visited: arrayUnion(placeId)
    })
}

export const addFavoritePlace = async (uid: string, placeId: string) => {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
        favorites: arrayUnion(placeId);
    })
}