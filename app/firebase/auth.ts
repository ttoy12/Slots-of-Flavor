import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    deleteUser,
    EmailAuthProvider,
    GoogleAuthProvider,
    linkWithCredential,
    linkWithPopup,
    reauthenticateWithCredential,
    reauthenticateWithPopup,
    signInAnonymously,
    signInWithCredential,
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

// Lets visitors try a search before making an account. If this browser
// already has a guest session, Firebase reuses it, so its free search stays used.
export const startGuestSession = async () => {
    const { user } = await signInAnonymously(auth);
    setSessionCookie(user);
    return user;
};

const currentGuest = () => (auth.currentUser?.isAnonymous ? auth.currentUser : null);

// A guest signing up with Google keeps their uid (and the spots they liked).
// If that Google account already exists, sign into it instead.
const googlePopup = async () => {
    const provider = new GoogleAuthProvider();
    const guest = currentGuest();
    if (!guest) return signInWithPopup(auth, provider);
    try {
        return await linkWithPopup(guest, provider);
    } catch (error) {
        const credential = error instanceof FirebaseError && error.code === 'auth/credential-already-in-use'
            ? GoogleAuthProvider.credentialFromError(error)
            : null;
        if (!credential) throw error;
        return signInWithCredential(auth, credential);
    }
};

export const signInWithGoogle = async () => {
    const { user } = await googlePopup();
    if (user.email) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            await addUser(user.uid, user.email);
        }
    }
    setSessionCookie(user);
    return user;
};

// Creates an email/password account, upgrading the guest session if there is one.
export const signUpWithEmail = async (email: string, password: string) => {
    const guest = currentGuest();
    const { user } = guest
        ? await linkWithCredential(guest, EmailAuthProvider.credential(email, password))
        : await createUserWithEmailAndPassword(auth, email, password);
    await addUser(user.uid, email);
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
