import { NextResponse } from "next/server";
import type { Business } from "@/app/firebase/firestore";
import { signedPhotoUrl } from "@/lib/photoSignature";
import { getBearerToken, verifyFirebaseToken } from "@/lib/verifyFirebaseToken";
import { DAILY_SEARCH_LIMIT, SearchError, timeUntilReset } from "@/lib/searchLimit";
import { getSearchesUsed, recordSearch } from "@/lib/searchUsage";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Requesting rating/priceLevel/websiteUri puts each search in the Text Search
// Enterprise SKU, so keep this list as small as the UI allows.
const FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.location",
    "places.priceLevel",
    "places.rating",
    "places.userRatingCount",
    "places.photos",
    "places.googleMapsUri",
    "places.websiteUri",
].join(",");

const PRICE_LEVELS: Record<string, string> = {
    "1": "PRICE_LEVEL_INEXPENSIVE",
    "2": "PRICE_LEVEL_MODERATE",
    "3": "PRICE_LEVEL_EXPENSIVE",
    "4": "PRICE_LEVEL_VERY_EXPENSIVE",
};

const PRICE_SYMBOLS: Record<string, string> = {
    PRICE_LEVEL_INEXPENSIVE: "$",
    PRICE_LEVEL_MODERATE: "$$",
    PRICE_LEVEL_EXPENSIVE: "$$$",
    PRICE_LEVEL_VERY_EXPENSIVE: "$$$$",
};

const MAX_DISTANCE_METERS = 50000;

interface LatLng {
    latitude: number;
    longitude: number;
}

interface GooglePlace {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: LatLng;
    priceLevel?: string;
    rating?: number;
    userRatingCount?: number;
    photos?: { name: string; authorAttributions?: { displayName: string; uri: string }[] }[];
    googleMapsUri?: string;
    websiteUri?: string;
}

const GOOGLE_TIMEOUT_MS = 10000;

class SearchFailure extends Error {
    constructor(public status: number, public detail: SearchError) {
        super(detail.title);
    }
}

const fail = (status: number, code: SearchError["code"], title: string, hint: string, retryable = false) =>
    new SearchFailure(status, { code, title, hint, retryable });

const dailyLimitFailure = () => fail(429, "DAILY_LIMIT", "Out of searches for today",
    `All ${DAILY_SEARCH_LIMIT} daily searches are used up. They reset in ${timeUntilReset()} (midnight Pacific). You can still use "Spin again" on results you already have.`);

const upstreamFailure = () => fail(502, "UPSTREAM", "Google Maps didn't respond",
    "This is usually a temporary hiccup. Give it a moment and try again.", true);

const configFailure = () => fail(500, "CONFIG", "Search isn't set up correctly",
    "Google rejected the API key. Check that Places API (New) and Geocoding API are enabled for it in Google Cloud.");

async function googleFetch(url: string, init?: RequestInit) {
    try {
        return await fetch(url, { ...init, signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS) });
    } catch (error) {
        console.error("Google request failed", error);
        throw upstreamFailure();
    }
}

async function geocode(address: string): Promise<LatLng> {
    const params = new URLSearchParams({ address, key: API_KEY! });
    const res = await googleFetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
    const data = await res.json().catch(() => ({}));
    const point = data.results?.[0]?.geometry?.location;
    if (point) return { latitude: point.lat, longitude: point.lng };

    console.error("Geocoding failed", data.status, data.error_message);
    switch (data.status) {
        case "ZERO_RESULTS":
            throw fail(404, "LOCATION_NOT_FOUND", `We couldn't find "${address}"`,
                "Check the spelling, or pick a city from the suggestions as you type.");
        case "OVER_QUERY_LIMIT":
            throw dailyLimitFailure();
        case "REQUEST_DENIED":
            throw configFailure();
        default:
            throw upstreamFailure();
    }
}

// Maps a failed Places API response to something the user can act on.
async function placesFailure(res: Response): Promise<SearchFailure> {
    const body = await res.text();
    console.error("Places API error", res.status, body);
    if (res.status === 429) return dailyLimitFailure();
    if (res.status === 401 || res.status === 403 || body.includes("API_KEY_INVALID")) return configFailure();
    if (res.status === 400) {
        return fail(400, "BAD_REQUEST", "Google couldn't run that search",
            "Try a simpler craving (like \"tacos\") or a different location.");
    }
    return upstreamFailure();
}

function distanceMeters(a: LatLng, b: LatLng): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

// Text Search only restricts results to a rectangle, so search the box around
// the circle and trim the corners afterwards.
function boundingBox(center: LatLng, radius: number) {
    const dLat = radius / 111320;
    const dLng = radius / (111320 * Math.cos((center.latitude * Math.PI) / 180));
    return {
        low: { latitude: center.latitude - dLat, longitude: center.longitude - dLng },
        high: { latitude: center.latitude + dLat, longitude: center.longitude + dLng },
    };
}

function toBusiness(place: GooglePlace): Business {
    const photo = place.photos?.[0];
    const author = photo?.authorAttributions?.[0];
    return {
        id: place.id,
        name: place.displayName?.text ?? "Unknown",
        url: place.googleMapsUri ?? `https://www.google.com/maps/place/?q=place_id:${place.id}`,
        website: place.websiteUri ?? null,
        image_url: photo ? signedPhotoUrl(photo.name) : null,
        photo_attribution: author ? { name: author.displayName, uri: author.uri } : null,
        address: place.formattedAddress ?? "",
        price: place.priceLevel ? PRICE_SYMBOLS[place.priceLevel] ?? "" : "",
        rating: place.rating ?? null,
        review_count: place.userRatingCount ?? null,
    };
}

export async function GET(req: Request) {
    try {
        return await search(req);
    } catch (error) {
        if (error instanceof SearchFailure) {
            return NextResponse.json({ error: error.detail }, { status: error.status });
        }
        console.error("Places search error", error);
        return NextResponse.json({ error: upstreamFailure().detail }, { status: 500 });
    }
}

async function search(req: Request) {
    if (!API_KEY) throw configFailure();

    // Every search is billed, so only signed-in users may run one.
    const idToken = getBearerToken(req);
    if (!idToken || !(await verifyFirebaseToken(req))) {
        throw fail(401, "UNAUTHENTICATED", "Your session has expired", "Sign in again to keep searching.");
    }

    const url = new URL(req.url);
    const location = url.searchParams.get("location")?.trim();
    const term = url.searchParams.get("term")?.trim() || "restaurants";
    const price = url.searchParams.get("price");
    const distance = Math.min(Number(url.searchParams.get("distance")) || 0, MAX_DISTANCE_METERS);

    if (!location) {
        throw fail(400, "BAD_REQUEST", "Where are you eating?", "Enter a city to search.");
    }

    // The shared daily counter. If it can't be read, fail open: the Google
    // Cloud quota still stops searches past the limit.
    const used = await getSearchesUsed(idToken);
    if (used !== null && used >= DAILY_SEARCH_LIMIT) throw dailyLimitFailure();

    const body: Record<string, unknown> = {
        textQuery: `${term} in ${location}`,
        openNow: true,
        pageSize: 20,
    };

    // Selecting every price level means "any", which should also include
    // places Google has no price for.
    const priceLevels = (price?.split(",") ?? []).map((p) => PRICE_LEVELS[p]).filter(Boolean);
    if (priceLevels.length > 0 && priceLevels.length < 4) {
        body.priceLevels = priceLevels;
    }

    let center: LatLng | null = null;
    if (distance) {
        center = await geocode(location);
        body.textQuery = term;
        body.locationRestriction = { rectangle: boundingBox(center, distance) };
    }

    const res = await googleFetch("https://places.googleapis.com/v1/places:searchText", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": API_KEY,
            "X-Goog-FieldMask": FIELD_MASK,
        },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw await placesFailure(res);

    const data: { places?: GooglePlace[] } = await res.json();
    let places = data.places ?? [];
    if (center) {
        places = places.filter((p) => p.location && distanceMeters(center!, p.location) <= distance);
    }

    // Only successful searches count toward the daily limit.
    const usedNow = await recordSearch(idToken);
    const remaining = usedNow === null ? null : Math.max(DAILY_SEARCH_LIMIT - usedNow, 0);

    return NextResponse.json({ places: places.map(toBusiness), remaining });
}
