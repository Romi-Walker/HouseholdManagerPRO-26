import { describe, it, expect } from 'vitest'
import { calculateNextDate } from '../utils/dates'

describe('Date Utilities', () => {
    describe('calculateNextDate', () => {
        it('should calculate next day correctly', () => {
            const result = calculateNextDate('2024-02-22', 'daily');
            expect(result).toBe('2024-02-23');
        });

        it('should calculate next week correctly', () => {
            const result = calculateNextDate('2024-02-22', 'weekly');
            expect(result).toBe('2024-02-29'); // 2024 is a leap year!
        });

        it('should calculate next month correctly', () => {
            const result = calculateNextDate('2024-02-22', 'monthly');
            expect(result).toBe('2024-03-22');
        });

        it('should calculate next year correctly', () => {
            const result = calculateNextDate('2024-02-22', 'yearly');
            expect(result).toBe('2025-02-22');
        });

        it('should handle end of month correctly', () => {
            const result = calculateNextDate('2024-01-31', 'monthly');
            // Depending on implementation, JS Date might roll over to March 2nd or stop at Feb 29th.
            // Our implementation uses nextDate.setMonth(nextDate.getMonth() + 1);
            // 2024-01-31 + 1 month = 2024-02-31 -> 2024-03-02
            expect(result).toBe('2024-03-02');
        });
    });
});
