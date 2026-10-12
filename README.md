# Slots of Flavor

Slots of Flavor is a Next.js web application that helps users find a random restaurant based on their preferences, such as location and price range. Using the Google Places API (Text Search), it retrieves up to 20 open restaurants and selects one at random to suggest. "Spin again" re-rolls from the same results without another API call. The app also features user authentication via Firebase and stores user data in Firestore.

## Updates

- Migrated from the Yelp API (free access ended) to the Google Places API (New).

## Visit live site

Check out the live application at: https://slots-of-flavor.vercel.app/

![Slots of Flavor Welcome](https://i.imgur.com/JuBSZvN.jpeg)

## YouTube Demo

Check out a short demo of the applicaiton on YouTube: [Slots of Flavor Demo](https://www.youtube.com/watch?v=iQstPxtEtl0)

## Features

- Slot-machine reel that spins through real nearby restaurants before landing on your pick
- Filters for location (with city autocomplete), craving, distance and price
- Like or dislike places; disliked places never come up again
- Tailwind CSS UI that works on phones and desktops
- Next.js framework for server-side rendering and fast performance
- User authentication using Firebase
- Firestore for storing user data
- Input form for location, distance, category, and price range
- Integrates with the Google Places API to fetch restaurant data
- Returns a random restaurant from the search results

## Installation

1. Clone the repository to a desired location:

   ```
   git clone https://github.com/yourusername/Slots-of-Flavor.git
   ```

2. Navigate to the project directory

   ```
   cd Slots-of-Flavor
   ```

3. Install the necessary dependencies:

   ```
   npm install
   ```

4. Set up your environment variables: copy `.env.example` to `.env.local` and fill in your Google Places API key and Firebase configuration.

   To get a Google key:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/) and attach a billing account (required even for free usage).
   - Enable **Places API (New)** and **Geocoding API** (geocoding is only used when a distance is selected).
   - Create an API key and restrict it to those two APIs.
   - The search API only accepts requests from signed-in users (it checks the Firebase ID token), and photo URLs are signed by the server, so the key can't be used through this app by anyone who isn't logged in.
   - Google gives a free monthly usage cap per SKU. Searches here use the Text Search Enterprise SKU (because of rating/price fields) and each displayed photo is a Place Photos request. Set a budget alert and per-API quota limits so you never get charged.

5. In the Firebase console, go to **Firestore Database → Rules** and paste in the contents of `firestore.rules`. Liked/disliked places are stored in `users/{uid}/liked` and `users/{uid}/disliked` subcollections, and these rules restrict each user to their own data.

6. Run the application locally:

   ```
   npm run dev
   ```
