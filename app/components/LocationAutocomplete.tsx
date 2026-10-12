"use client"
import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { inputClasses } from './ui';

interface LocationAutocompleteProps {
    id?: string;
    location: string;
    setLocation: (location: string) => void;
}

const MAX_SUGGESTIONS = 8;

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ id = 'location', location, setLocation }) => {
    const [cities, setCities] = useState<string[]>([]);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);

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
        const query = location.trim().toLowerCase();
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
    }, [cities, location]);

    const showList = open && suggestions.length > 0;
    const listId = `${id}-suggestions`;

    const choose = (city: string) => {
        setLocation(city);
        setOpen(false);
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

    return (
        <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
                id={id}
                role="combobox"
                aria-expanded={showList}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
                autoComplete="off"
                required
                placeholder="City, State (e.g. Austin, TX)"
                className={cn(inputClasses, 'pl-10')}
                value={location}
                onChange={(e) => {
                    setLocation(e.target.value);
                    setOpen(true);
                    setActive(-1);
                }}
                onFocus={() => setOpen(true)}
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
    );
}

export default LocationAutocomplete;
