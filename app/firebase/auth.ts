import {
    deleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    signInWithPopup,
    type User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import Cookies from 'js-cookie';
import { auth, db } from './firebaseConfig';
import { addUser, deleteUserData } from './firestore';

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

// How the user proves it's them before deleting: a Google pop-up if they
// signed in with Google, otherwise their password.
export const reauthMethod = (user: User): 'google' | 'password' =>
    user.providerData.some((p) => p.providerId === 'google.com') ? 'google' : 'password';

// Firebase only deletes accounts with a recent sign-in, so re-authenticate
// first. Doing it before touching any data means a failed check never leaves
// the account half-deleted.
export const deleteAccount = async (user: User, password?: string) => {
    if (reauthMethod(user) === 'google') {
        await reauthenticateWithPopup(user, new GoogleAuthProvider());
    } else {
        await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email ?? '', password ?? ''));
    }
    await deleteUserData(user.uid);
    await deleteUser(user);
    Cookies.remove('user');
};
