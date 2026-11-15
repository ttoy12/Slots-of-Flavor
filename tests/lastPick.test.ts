import { describe, expect, it } from 'vitest';
import { ASK_AFTER_MS, ASK_UNTIL_MS, describePickDay, isDue } from '../lib/lastPick';

const pickAt = (pickedAt: number) => ({ business: { id: 'p1', name: 'Tacos', url: '', image_url: null, price: '' }, pickedAt });

describe('isDue', () => {
    const now = new Date(2026, 10, 15, 19, 0).getTime();

    it("doesn't ask about a spin from a few minutes ago", () => {
        expect(isDue(pickAt(now - 5 * 60 * 1000), now)).toBe(false);
    });

    it('asks once enough time has passed for a meal', () => {
        expect(isDue(pickAt(now - ASK_AFTER_MS), now)).toBe(true);
        expect(isDue(pickAt(now - 3 * 24 * 60 * 60 * 1000), now)).toBe(true);
    });

    it('stops asking about stale picks', () => {
        expect(isDue(pickAt(now - ASK_UNTIL_MS - 1), now)).toBe(false);
    });
});

describe('describePickDay', () => {
    const now = new Date(2026, 10, 15, 19, 0).getTime();

    it('names today and yesterday', () => {
        expect(describePickDay(new Date(2026, 10, 15, 12, 0).getTime(), now)).toBe('earlier today');
        expect(describePickDay(new Date(2026, 10, 14, 23, 30).getTime(), now)).toBe('yesterday');
    });

    it('uses the weekday within a week and the date after that', () => {
        expect(describePickDay(new Date(2026, 10, 11, 12, 0).getTime(), now)).toMatch(/^on \w+day$/);
        expect(describePickDay(new Date(2026, 10, 3, 12, 0).getTime(), now)).toMatch(/^on .*3/);
    });
});
