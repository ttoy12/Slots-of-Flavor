"use client"
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/firebaseConfig'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import Cookies from 'js-cookie'
import { useState } from 'react'
import axios from 'axios'
import BusinessList from '@/components/BusinessList'

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getBusinessList = async (location: string) => {
    try {
      const url = `/api/yelp?location=${location}${term ? `&term=${term}` : ''}${price ? `&price=${price}` : ''}${distance ? `&distance=${distance}` : ''}`;
      const response = await axios.get(url);
      const data = await response.data;
      if (data) {
        setBusinesses(data);
      }
      console.log(data);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (location.trim()) {
      getBusinessList(location);
    }
  }

  const handleLogout = () => {
    signOut(auth);
    Cookies.remove('user');
    router.push('/sign-in');
  };

  return (
    <div
      className="bg-blue-400 flex flex-col items-center justify-center w-1/2"
    // style={{
    //   backgroundImage: "url('/SOF-background.png')",
    //   backgroundSize: 'cover',
    //   backgroundRepeat: 'no-repeat',
    //   backgroundPosition: 'center',
    // }}
    >
      <button onClick={handleLogout}>
        Log Out
      </button>
      <h1 className="text-3xl">Home</h1>
      {user ? (
        <h2 className="text-xl">Hi, {user?.email}</h2>
      ) : (
        <h2 className="text-xl">Hi, Guest</h2>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 p-4 m-4 border rounded-md">
        <input
          type="text"
          placeholder="Enter a location (City or Zipcode)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div>
          <select
            id="distance"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {/*value is in meters */}
            <option value="">Select distance</option>
            <option value="1610">~1 mile</option>
            <option value="8047">~5 miles</option>
            <option value="16094">~10 miles</option>
            <option value="24140">~15 miles</option>
            <option value="32187">~20 miles</option>
            <option value="40000">~25 miles</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="What type of place? (e.g. bar, Chinese, Mexican)"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="price-one"
              name="price"
              value="1"
              checked={price === "1"}
              onChange={(e) => setPrice(e.target.value)}
              className="mr-2"
            />
            <label htmlFor="price-one" className="cursor-pointer">$</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="price-two"
              name="price"
              value="2"
              checked={price === "2"}
              onChange={(e) => setPrice(e.target.value)}
              className="mr-2"
            />
            <label htmlFor="price-two" className="cursor-pointer">$$</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="price-three"
              name="price"
              value="3"
              checked={price === "3"}
              onChange={(e) => setPrice(e.target.value)}
              className="mr-2"
            />
            <label htmlFor="price-three" className="cursor-pointer">$$$</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="price-four"
              name="price"
              value="4"
              checked={price === "4"}
              onChange={(e) => setPrice(e.target.value)}
              className="mr-2"
            />
            <label htmlFor="price-four" className="cursor-pointer">$$$$</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="price-any"
              name="price"
              value="1, 2, 3, 4"
              checked={price === "1, 2, 3, 4"}
              onChange={(e) => setPrice(e.target.value)}
              className="mr-2"
            />
            <label htmlFor="price-any" className="cursor-pointer">Any</label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 rounded-md hover:bg-blue-900 transition duration-200"
        >
          Search
        </button>
      </form>
      {isLoading ? (
        <div className="mt-4">Loading...</div> // Loading indicator
      ) : (
        <BusinessList businessesData={businesses} />
      )}
    </div>
  )
}
