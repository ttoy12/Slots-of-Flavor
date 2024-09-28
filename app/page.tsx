"use client"
import React from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from './firebase/firebaseConfig'
import { useState } from 'react'
import axios from 'axios'
import BusinessList from './components/BusinessList'
import { Checkbox, FormControlLabel } from '@mui/material'
import ResponsiveAppBar from './components/AppBar'

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [businesses, setBusinesses] = useState([]);
  const [location, setLocation] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [price, setPrice] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [randomBusiness, setRandomBusiness] = useState(null);

  const getBusinessList = async (location: string) => {
    try {
      const url = `/api/yelp?location=${location}${term ? `&term=${term}` : ''}${price.length ? `&price=${price.join(',')}` : ''}${distance ? `&distance=${distance}` : ''}`;
      const response = await axios.get(url);
      const data = await response.data;
      if (data && data.length > 0) {
        setBusinesses(data);
        setRandomBusiness(data[Math.floor(Math.random() * data.length)])
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

  const handlePriceChange = (value: string) => {
    setPrice((prev) =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };

  const handlePriceAnyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setPrice(["1", "2", "3", "4"]);
    } else {
      setPrice([]);
    }
  };

  return (
    <div
      className="bg-blue-400 flex flex-col items-center justify-center rounded-md"
    // style={{
    //   backgroundImage: "url('/possible-SOF-background.png')",
    //   backgroundSize: 'cover',
    //   backgroundRepeat: 'no-repeat',
    //   backgroundPosition: 'center',
    //   opacity: .8
    // }}
    >
      <ResponsiveAppBar />

      <span className="mt-2">
        {user ? (
          <h2 className="text-xl">Hi, {user?.email}</h2>
        ) : (
          <h2 className="text-xl">Hi, Guest</h2>
        )}
      </span>

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

        <div className="flex justify-center">
          {["1", "2", "3", "4"].map((value) => (
            <FormControlLabel
              key={value}
              control={
                <Checkbox
                  checked={price.includes(value)}
                  onChange={() => handlePriceChange(value)}
                  color="success"
                />
              }
              label={value === "1" ? "$" : value === "2" ? "$$" : value === "3" ? "$$$" : "$$$$"}
            />
          ))}
          <FormControlLabel
            control={
              <Checkbox
                checked={price.length === 4}
                onChange={handlePriceAnyChange}
                color="success"
              />
            }
            label="Any"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 rounded-md hover:bg-blue-900 transition duration-200"
        >
          Search
        </button>
      </form>

      <div className="flex justify-center items-center pb-4">
        {isLoading ? (
          <div >Loading...</div> // Loading indicator
        ) : (
          <BusinessList randomBusiness={randomBusiness} className="" />
        )}
      </div>
    </div>
  )
}
