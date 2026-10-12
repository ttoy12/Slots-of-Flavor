import { NextResponse } from "next/server";
import { isValidPhotoSignature } from "@/lib/photoSignature";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const PHOTO_NAME = /^places\/[\w-]+\/photos\/[\w-]+$/;

// Resolves a Places photo name to its image URL without exposing the API key
// to the browser. Each lookup is billed, so the redirect is cached for a day,
// by browsers and by the CDN (s-maxage) so repeat hits never reach Google.
export async function GET(req: Request) {
    const params = new URL(req.url).searchParams;
    const name = params.get("name");
    if (!API_KEY || !name || !PHOTO_NAME.test(name)) {
        return new NextResponse(null, { status: 400 });
    }
    if (!isValidPhotoSignature(name, params.get("sig"))) {
        return new NextResponse(null, { status: 403 });
    }

    const mediaParams = new URLSearchParams({ maxWidthPx: "400", skipHttpRedirect: "true", key: API_KEY });
    const res = await fetch(`https://places.googleapis.com/v1/${name}/media?${mediaParams}`);
    if (!res.ok) {
        return new NextResponse(null, { status: 404 });
    }

    const { photoUri } = await res.json();
    const redirect = NextResponse.redirect(photoUri);
    redirect.headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400");
    return redirect;
}
