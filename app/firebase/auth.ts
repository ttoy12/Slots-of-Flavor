import { GoogleAuthProvider, signInWithPopup, type User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { auth, db } from './firebaseConfig';
import { addUser } from './firestore';

// The proxy only checks that this cookie exists to skip the welcome page;
// real access control is Firebase Auth plus Firestore rules.
export const setSessionCookie = (user: User) => {
    Cookies.set('user', JSON.stringify({ email: user.email }), { expires: 7 });
};

export const signInWithGoogle = async () => {
    const { user } = await signInWithPopup(auth, new GoogleAuthProvider());
    if (user.email) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await addUser(user.uid, user.email);
        }
    }
    setSessionCookie(user);
    return user;
};
