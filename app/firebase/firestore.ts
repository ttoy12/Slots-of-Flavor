import { doc, setDoc, updateDoc, arrayUnion, serverTimestamp, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export interface Business {
    id: string;
    name: string;
    price: string;
    [key: string]: any;
}

export const addUser = async (userID: string, email: string) => {
    await setDoc(doc(db, 'users', userID), {
        userID,
        email,
        liked: [],
        disliked: [],
        createdAt: serverTimestamp(),
    });
    console.log("added user: ", email);
};

export const getLikedPlaces = async (userID: string) => {
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const data = userDoc.data();
        return data.liked || [];
    } else {
        return [];
    }
}

export const getDislikedPlaces = async (userID: string) => {
    const userRef = doc(db, 'users', userID);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
        const data = userDoc.data();
        return data.disliked || [];
    } else {
        return [];
    }
}


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