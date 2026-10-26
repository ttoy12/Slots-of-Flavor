import { createRemoteJWKSet, jwtVerify } from "jose";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// Google's public keys for Firebase Auth ID tokens. jose caches them between requests.
const JWKS = createRemoteJWKSet(
    new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export const getBearerToken = (req: Request) =>
    req.headers.get("authorization")?.match(/^Bearer (.+)$/)?.[1] ?? null;

export interface VerifiedUser {
    uid: string;
    // Signed in anonymously (trying the app before creating an account).
    isGuest: boolean;
}

// Verifies the `Authorization: Bearer <Firebase ID token>` header and returns
// the user, or null if it's missing or invalid. This checks the token
// signature and expiry without firebase-admin, so no service account is needed
// (revoked sessions stay valid until their token expires, at most an hour).
export async function verifyFirebaseToken(req: Request): Promise<VerifiedUser | null> {
    const token = getBearerToken(req);
    if (!token || !PROJECT_ID) return null;

    try {
        const { payload } = await jwtVerify(token, JWKS, {
            issuer: `https://securetoken.google.com/${PROJECT_ID}`,
            audience: PROJECT_ID,
        });
        if (!payload.sub) return null;
        const provider = (payload.firebase as { sign_in_provider?: string } | undefined)?.sign_in_provider;
        return { uid: payload.sub, isGuest: provider === 'anonymous' };
    } catch {
        return null;
    }
}
