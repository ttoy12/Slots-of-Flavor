import { createHmac, timingSafeEqual } from "crypto";

// <img> tags can't send an Authorization header, so instead of checking login
// on /api/places/photo, the (authenticated) search route signs each photo URL
// and the photo route only serves names it signed. Keyed on the Places API key
// so no extra secret is needed; rotating that key invalidates saved photo URLs.
const sign = (name: string) =>
    createHmac("sha256", process.env.GOOGLE_PLACES_API_KEY ?? "").update(name).digest("base64url");

export const signedPhotoUrl = (name: string) =>
    `/api/places/photo?name=${encodeURIComponent(name)}&sig=${sign(name)}`;

export const isValidPhotoSignature = (name: string, sig: string | null) => {
    if (!sig) return false;
    const expected = Buffer.from(sign(name));
    const actual = Buffer.from(sig);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
};
