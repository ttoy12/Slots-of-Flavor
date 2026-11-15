"use client"
import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { LoaderCircle, LocateFixed, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClasses } from './ui';

export interface Coordinates {
    latitude: number;
    longitude: number;
}

interface LocationAutocompleteProps {
    id?: string;
    location: string;
    setLocation: (location: string) => void;
    /** Set while the search should use the device's location instead of the typed city. */
    coords: Coordinates | null;
    setCoords: (coords: Coordinates | null) => void;
}

const MAX_SUGGESTIONS = 8;
const CURRENT_LOCATION_LABEL = 'Current location';

// About 100 m: plenty for finding restaurants, without sending an exact position.
const roundCoordinate = (value: number) => Math.round(value * 1000) / 1000;

const geolocationErrorMessage = (error: GeolocationPositionError) => {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            return 'Location access is blocked. Allow it in your browser settings, or enter a city instead.';
        case error.TIMEOUT:
            return 'Finding your location took too long. Try again, or enter a city instead.';
        default:
            return 'We couldn’t get your location. Try again, or enter a city instead.';
    }
};

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ id = 'location', location, setLocation, coords, setCoords }) => {
    const [cities, setCities] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const [locating, setLocating] = useState(false);
    const [locateError, setLocateError] = useState<string | null>(null);

    useEffect(() => {
        const loadCitiesData = async () => {
            try {
                const response = await fetch('/data/locations.csv');
                const text = await response.text();
                const results = Papa.parse<{ City: string; State: string }>(text, { header: true, skipEmptyLines: true });
                setCities(results.data.filter((c) => c.City).map((c) => `${c.City}, ${c.State}`));
            } catch (error) {
                console.error("Error loading cities data: ", error);
            }
        };

        loadCitiesData();
    }, []);

    // Cities starting with the query rank above ones that merely contain it.
    const suggestions = useMemo(() => {
        const query = coords ? '' : location.trim().toLowerCase();
        if (query.length < 2) return [];
        const starts: string[] = [];
        const contains: string[] = [];
        for (const city of cities) {
            const lower = city.toLowerCase();
            if (lower === query) continue;
            if (lower.startsWith(query)) starts.push(city);
            else if (lower.includes(query)) contains.push(city);
            if (starts.length >= MAX_SUGGESTIONS) break;
        }
        return [...starts, ...contains].slice(0, MAX_SUGGESTIONS);
    }, [cities, location, coords]);

    const showList = open && suggestions.length > 0;
    const listId = `${id}-suggestions`;
    const errorId = `${id}-locate-error`;

    const choose = (city: string) => {
        setLocation(city);
        setOpen(false);
        setActive(-1);
    };

    // Only ever called from the button, so the browser's permission prompt
    // appears in response to a tap rather than on page load.
    const locateMe = () => {
        if (!navigator.geolocation) {
            setLocateError('This browser can’t share your location. Enter a city instead.');
            return;
        }
        setLocating(true);
        setLocateError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({
                    latitude: roundCoordinate(position.coords.latitude),
                    longitude: roundCoordinate(position.coords.longitude),
                });
                setLocation('');
                setOpen(false);
                setLocating(false);
            },
            (error) => {
                setLocateError(geolocationErrorMessage(error));
                setLocating(false);
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 }
        );
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (coords) {
            // Typing switches back to a city search. Deleting part of the
            // "Current location" label clears the field rather than leaving a stub.
            setCoords(null);
            setLocation(CURRENT_LOCATION_LABEL.startsWith(value) ? '' : value);
        } else {
            setLocation(value);
        }
        setLocateError(null);
        setOpen(true);
        setActive(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showList) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const step = e.key === 'ArrowDown' ? 1 : -1;
            setActive((i) => (i + step + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' && active >= 0) {
            e.preventDefault();
            choose(suggestions[active]);
        } else if (e.key === 'Escape') {
            setOpen(false);
        }
    };

    const Icon = coords ? LocateFixed : MapPin;

    return (
        <div className="space-y-1.5">
            <div className="relative">
                <Icon
                    className={cn('pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2', coords ? 'text-primary' : 'text-muted-foreground')}
                    aria-hidden
                />
                <input
                    id={id}
                    role="combobox"
                    aria-expanded={showList}
                    aria-controls={listId}
                    aria-autocomplete="list"
                    aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                    aria-describedby={locateError ? errorId : undefined}
                    autoComplete="off"
                    required
                    placeholder="City, State (e.g. Austin, TX)"
                    className={cn(inputClasses, 'pl-10')}
                    value={coords ? CURRENT_LOCATION_LABEL : location}
                    onChange={handleChange}
                    onFocus={(e) => {
                        setOpen(true);
                        // So typing a city replaces the label in one go.
                        if (coords) e.target.select();
                    }}
                    onBlur={() => setOpen(false)}
                    onKeyDown={handleKeyDown}
                />
                {showList && (
                    <ul
                        id={listId}
                        role="listbox"
                        className="absolute z-20 mt-1.5 max-h-72 w-full overflow-auto rounded-2xl bg-popover p-1.5 shadow-xl ring-1 ring-black/5"
                    >
                        {suggestions.map((city, i) => (
                            <li
                                key={city}
                                id={`${listId}-${i}`}
                                role="option"
                                aria-selected={i === active}
                                // mousedown fires before the input's blur closes the list
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    choose(city);
                                }}
                                onMouseEnter={() => setActive(i)}
                                className={cn(
                                    'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm',
                                    i === active ? 'bg-secondary' : ''
                                )}
                            >
                                <MapPin className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                                {city}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {!coords && (
                <button
                    type="button"
                    onClick={locateMe}
                    disabled={locating}
                    className="inline-flex items-center gap-1.5 rounded-full py-1 text-xs font-semibold text-primary hover:underline focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
                >
                    {locating
                        ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden />
                        : <LocateFixed className="h-3.5 w-3.5" aria-hidden />}
                    {locating ? 'Finding you…' : 'Use my current location'}
                </button>
            )}
            {coords && (
                <p className="text-xs text-muted-foreground">Searching near you. Type a city to search somewhere else.</p>
            )}
            {locateError && (
                <p id={errorId} role="alert" className="text-xs text-destructive">{locateError}</p>
            )}
        </div>
    );
}

export default LocationAutocomplete;
