// Turns Firebase Auth error codes into messages people can act on.
const MESSAGES: Record<string, string> = {
    "auth/invalid-credential": "That email and password don't match. Try again or reset your password.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/missing-password": "Enter your password.",
    "auth/email-already-in-use": "There's already an account with that email. Try signing in instead.",
    "auth/weak-password": "Pick a password with at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Wait a minute and try again.",
    "auth/network-request-failed": "Couldn't reach the server. Check your connection.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "That password isn't right.",
    "auth/user-mismatch": "That Google account isn't the one you're signed in with.",
    "auth/requires-recent-login": "For your security, sign out and back in, then try again.",
};

const IGNORED = new Set(["auth/popup-closed-by-user", "auth/cancelled-popup-request"]);

export function authErrorMessage(error: unknown): string | null {
    const code = (error as { code?: string } | null)?.code;
    if (!code) return null;
    if (IGNORED.has(code)) return null;
    return MESSAGES[code] ?? "Something went wrong. Please try again.";
}
