import { describe, expect, it } from 'vitest';
import { searchesRemaining, timeUntilReset, usageDayKey } from '../lib/searchLimit';

describe('searchesRemaining', () => {
    it('uses whichever limit runs out first', () => {
        expect(searchesRemaining({ total: 0, user: 0 })).toBe(5);
        expect(searchesRemaining({ total: 0, user: 3 })).toBe(2);
        expect(searchesRemaining({ total: 28, user: 0 })).toBe(2);
    });

    it('never goes below zero', () => {
        expect(searchesRemaining({ total: 31, user: 7 })).toBe(0);
    });
});

describe('daily reset', () => {
    // 07:30 UTC on Oct 17 is 00:30 on Oct 17 in Pacific Daylight Time.
    const justAfterMidnight = new Date('2026-10-17T07:30:00Z');

    it('rolls the day over at midnight Pacific, not UTC', () => {
        expect(usageDayKey(new Date('2026-10-17T06:59:00Z'))).toBe('2026-10-16');
        expect(usageDayKey(justAfterMidnight)).toBe('2026-10-17');
    });

    it('counts down to the next midnight Pacific', () => {
        expect(timeUntilReset(justAfterMidnight)).toBe('23h 30m');
        expect(timeUntilReset(new Date('2026-10-18T06:45:00Z'))).toBe('15m');
    });
});
