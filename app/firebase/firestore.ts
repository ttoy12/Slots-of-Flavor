import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp, arrayRemove } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Business {
    id: string;
    name: string;
    price: string;
    [key: string]: any;
}

export const addUser = async (userID: string, email: string) => {
    await setDoc(doc(db, 'users', userID), {
        email,
        liked: [],
        disliked: [],
        createdAt: serverTimestamp(),
    });
    console.log("added user: ", email);
};


// need to still figure out what the place will be. URL maybe?
export const addLikedPlace = async (userID: string, business: Business) => {
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
        liked: arrayUnion(business)
    })
}

export const addDislikedPlace = async (userID: string, business: Business) => {
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
        disliked: arrayUnion(business)
    })
}

export const removedLikedPlace = async (userID: string, business: Business) => {
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
        liked: arrayRemove(business)
    })
}

export const removedDislikedPlace = async (userID: string, business: Business) => {
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
        disliked: arrayRemove(business)
    })
}