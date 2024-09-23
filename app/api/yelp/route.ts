import { NextResponse } from "next/server";
import axios from "axios";

const API_KEY = process.env.YELP_API_KEY;

export async function GET(req: Request) {
    const url = new URL(req.url);
    const location = url.searchParams.get("location");
    const term = url.searchParams.get("term");
    const price = url.searchParams.get("price");

    let apiURL = `https://api.yelp.com/v3/businesses/search?location=${location}&open_now=true&sort_by=best_match&limit=3`;

    // append term if it exists
    if (term) {
        apiURL += `&term=${term}`
    }

    if (price) {
        apiURL += `&price=${price}`
    }

    const options = {
        method: 'GET',
        url: apiURL,
        headers: {
            accept: 'application/json',
            Authorization: `Bearer ${API_KEY}`
        }
    };

    try {
        const response = await axios.request(options);
        const data = response.data;
        const responseData = JSON.stringify(data.businesses);
        console.log(responseData);

        return new NextResponse(responseData);
    } catch (error) {
        console.log("Fetch error", error);
        return new NextResponse("Internal Error", { status: 500});
    }
}