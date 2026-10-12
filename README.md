# Slots of Flavor

**Can't decide where to eat? Pull the lever.**

Slots of Flavor picks a random restaurant for you. Tell it where you are, what you're craving, how far you'll go and what you want to spend. It finds places that are open right now, spins a slot-machine reel through them and lands on one. Like it to save it, dislike it to never see it again, or spin once more.

**Live site:** https://slots-of-flavor.vercel.app

![Slots of Flavor welcome page](docs/welcome.png)

## Updates

- **October 2026: back online.** The Yelp API's free tier ended, so restaurant search now uses the Google Places API. The app also got a full redesign built for phones, a slot-machine spin animation, clearer error messages, a daily search limit, and self-serve account deletion.

## Features

- **Slot-machine picks.** The reel spins through real nearby restaurants before landing on your pick. "Spin again" re-rolls from the same results without using another search.
- **Filters.** Location (with city autocomplete), craving, distance (1–25 miles) and price ($–$$$$). Only places open right now are shown.
- **Like or dislike.** Liked places are saved to My spots. Disliked places never come up in your spins again (you can move them back any time).
- **Built for phones.** On mobile the result opens in a full-screen sheet, so the reel is always in view.
- **Daily search limit.** The app allows 30 searches a day, shared by all users, and shows how many are left. It resets at midnight Pacific.
- **Helpful errors.** If a search fails, the app says why (location not found, Google not responding, offline, out of searches) and offers to try again when that would help.
- **Accounts.** Email/password or Google sign-in with Firebase Authentication. Users can delete their account and all saved data from My spots.
- **Terms of Service and Privacy Policy** pages, linked across the site.

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router) with React 19 and TypeScript
- [Tailwind CSS](https://tailwindcss.com/) and [Lucide](https://lucide.dev/) icons
- [Firebase](https://firebase.google.com/) Authentication and Cloud Firestore
- [Google Places API (New)](https://developers.google.com/maps/documentation/places/web-service/op-overview) and Geocoding API
- Hosted on [Vercel](https://vercel.com/)

## How it works

- **Search:** `app/api/places/route.ts` runs a Google Places Text Search for open restaurants. When a distance is chosen, it geocodes the location and keeps only results within that radius.
- **Security:** the search route only accepts requests with a valid Firebase sign-in token. Place photos are served through `app/api/places/photo/route.ts` with signed URLs, so the Google API key never reaches the browser.
- **Search limit:** a counter document per day (`usage/YYYY-MM-DD`) in Firestore tracks searches. The server checks it before calling Google, and Firestore rules only let it go up by one, never past 30.
- **Saved places:** stored at `users/{uid}/liked/{placeId}` and `users/{uid}/disliked/{placeId}`.

## Running it locally

1. Clone the repository and install dependencies:

   ```
   git clone https://github.com/ttoy12/Slots-of-Flavor.git
   cd Slots-of-Flavor
   npm install
   ```

2. Create a `.env.local` file with your Google and Firebase settings:

   ```
   GOOGLE_PLACES_API_KEY=
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
   NEXT_PUBLIC_FIREBASE_APP_ID=
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
   ```

   `GOOGLE_PLACES_API_KEY` is server-only, so never prefix it with `NEXT_PUBLIC_`.

3. Set up the Google API key:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/) and attach a billing account (required even for free usage).
   - Enable **Places API (New)** and **Geocoding API**.
   - Create an API key and restrict it to those two APIs.
   - Google includes a free monthly allowance per API. Searches use the Text Search Enterprise tier (because of the rating and price fields), and each photo shown is a Place Photos request. To stay free, set daily quotas (for example 30 Text Search, 30 photo and 50 geocoding requests) and a budget alert.

4. Set up Firebase:
   - Enable **Email/Password** and **Google** sign-in under Authentication.
   - In **Firestore Database → Rules**, paste in the contents of `firestore.rules` and publish.
   - When deploying, add your site's domain under **Authentication → Settings → Authorized domains**.

5. Start the dev server:

   ```
   npm run dev
   ```

   Then open http://localhost:3000.

Other scripts: `npm run build`, `npm run start` and `npm run lint`.

## Configuration

- **Daily search limit:** `DAILY_SEARCH_LIMIT` in `lib/searchLimit.ts`. Change the matching `30` in `firestore.rules` too, and keep it within your Google Cloud quota.
- **Contact email for the legal pages:** `CONTACT_EMAIL` in `lib/legal.ts`.
- **Colors and fonts:** theme tokens in `app/globals.css`.

## Demo

An older demo of the original Yelp-based version is on YouTube: [Slots of Flavor demo](https://www.youtube.com/watch?v=iQstPxtEtl0).
