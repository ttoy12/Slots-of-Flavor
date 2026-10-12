import { useSyncExternalStore } from 'react';

// Matches Tailwind's `lg` breakpoint: below it the layout stacks into one column.
const QUERY = '(max-width: 1023px)';

const subscribe = (onChange: () => void) => {
    const media = window.matchMedia(QUERY);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
};

export default function useIsMobile() {
    return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
