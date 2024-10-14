"use client";
import React, { useState } from 'react';
import axios from 'axios';
import BusinessList from './components/BusinessList';
import { Checkbox, FormControlLabel, TextField, Button, Typography, Box, Select, MenuItem, InputLabel, FormControl } from '@mui/material';
import AuthWrapper from './components/AuthWrapper';
import useFetchLikedAndDislikedPlaces from './hooks/useFetchLikedAndDislikedPlaces';
import { Business } from './firebase/firestore';
import { useUser } from './components/UserContext';

export default function Home() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [location, setLocation] = useState<string>("");
  const [distance, setDistance] = useState<string>("");
  const [term, setTerm] = useState<string>("");
  const [price, setPrice] = useState<string[]>([]);
  const [randomBusiness, setRandomBusiness] = useState<Business | null>(null);
  const user = useUser();
  const { likedPlaces, dislikedPlaces } = useFetchLikedAndDislikedPlaces(user?.uid);

  const getBusinessList = async (location: string) => {
    try {
      const url = `/api/yelp?location=${location}${term ? `&term=${term}` : ''}${price.length ? `&price=${price.join(',')}` : ''}${distance ? `&distance=${distance}` : ''}`;
      const response = await axios.get(url);
      const data: Business[] = await response.data;

      if (data && data.length > 0) {
        const filteredData = data.filter(business => !dislikedPlaces.some(disliked => disliked.id === business.id));
        setBusinesses(filteredData);
        setRandomBusiness(filteredData[Math.floor(Math.random() * filteredData.length)]);
      }

    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (location.trim()) {
      getBusinessList(location);
    }
  };

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
    <AuthWrapper>
      {(user) => (
        <Box
          sx={{
            padding: 4,
            maxWidth: 600,
            margin: 'auto',
            borderBottomLeftRadius: 6,
            borderBottomRightRadius: 6,
            backgroundColor: '#f7f7f7',
          }}
        >
          <Typography variant="h4" component="h2" gutterBottom align="center"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: 'clamp(1rem, 5vw, 2rem)',
            }}
          >
            {user ? `Hi, ${user.email}` : "Hi, Guest"}
          </Typography>

          <form onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Enter a location (City or Zipcode)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              margin="normal"
              aria-required
            />

            <FormControl fullWidth margin="normal">
              <InputLabel id="distance-label">Select Distance</InputLabel>
              <Select
                labelId="distance-label"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                label="Select Distance"
              >
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="1610">~1 mile</MenuItem>
                <MenuItem value="8047">~5 miles</MenuItem>
                <MenuItem value="16094">~10 miles</MenuItem>
                <MenuItem value="24140">~15 miles</MenuItem>
                <MenuItem value="32187">~20 miles</MenuItem>
                <MenuItem value="40000">~25 miles</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              variant="outlined"
              placeholder="What type of place? (e.g. bar, Chinese, Mexican)"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              margin="normal"
            />

            <Box display="flex" justifyContent="space-between" flexWrap="wrap">
              {["1", "2", "3", "4"].map((value) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={price.includes(value)}
                      onChange={() => handlePriceChange(value)}
                      color="primary"
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
                    color="primary"
                  />
                }
                label="Any"
              />
            </Box>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: 2 }}
            >
              Search
            </Button>
          </form>

          <Box display="flex" justifyContent="center" className="mt-4">
            {businesses.length === 0 ? (
              <Typography variant="body1">No businesses found.</Typography>
            ) : (
              <BusinessList randomBusiness={randomBusiness} likedPlaces={likedPlaces} />
            )}
          </Box>
        </Box>
      )}
    </AuthWrapper>
  );
}
