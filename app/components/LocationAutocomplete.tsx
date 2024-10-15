"use client"
import React, { useState, useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Papa from 'papaparse';
import { debounce } from '@mui/material/utils';

interface LocationAutocompleteProps {
    location: string;
    setLocation: (location: string) => void;
}

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ location, setLocation }) => {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [cities, setCities] = useState<{ City: string; State: string }[]>([]);

    useEffect(() => {
        const loadCitiesData = async () => {
            try {
                const response = await fetch('/data/locations.csv');
                const text = await response.text();
                const results = Papa.parse<{ City: string; State: string }>(text, { header: true });
                setCities(results.data);
            } catch (error) {
                console.error("Error loading cities data: ", error);
            }
        };

        loadCitiesData();
    }, []);

    const fetchSuggestions = debounce(async (input: string) => {
        if (input.trim().length < 3) {
            setSuggestions([]);
            return;
        }

        const filteredSuggestions = cities
            .filter(city => {
                const cityName = city.City || "";

                return cityName.toLowerCase().includes(input.toLowerCase());
            })
            .slice(0, 10)
            .map(city => `${city.City}, ${city.State}`);

        setSuggestions(filteredSuggestions);
    }, 300);

    return (
        <Autocomplete
            freeSolo
            options={suggestions}
            onInputChange={(_, newInputValue) => {
                setLocation(newInputValue);
                fetchSuggestions(newInputValue);
            }}
            onChange={(_, newValue) => {
                setLocation(newValue || "");
                setSuggestions([]);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="outlined"
                    placeholder="Enter a location (City, State)"
                    required
                    margin="normal"
                />
            )}
        />
    );
}

export default LocationAutocomplete;
