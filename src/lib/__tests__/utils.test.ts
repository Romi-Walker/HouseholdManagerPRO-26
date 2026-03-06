import { describe, it, expect } from 'vitest'
import { formatCurrency, formatDate } from '../utils'

describe('Utility Functions', () => {
    describe('formatCurrency', () => {
        it('should format numbers as EUR currency in German locale', () => {
            // Note: Intl might use non-breaking spaces or different characters depending on the environment
            // We use a regex or string replacement to handle the different space characters for testing
            const result = formatCurrency(1234.56).replace(/\u00a0/g, ' ');
            expect(result).toMatch(/1.234,56\s€/);
        });

        it('should handle zero correctly', () => {
            const result = formatCurrency(0).replace(/\u00a0/g, ' ');
            expect(result).toMatch(/0,00\s€/);
        });

        it('should handle negative numbers correctly', () => {
            const result = formatCurrency(-50).replace(/\u00a0/g, ' ');
            expect(result).toMatch(/-50,00\s€/);
        });
    });

    describe('formatDate', () => {
        it('should format date strings correctly in German locale', () => {
            const date = '2024-02-22T00:00:00Z';
            const result = formatDate(date);
            expect(result).toBe('22.02.2024');
        });

        it('should format Date objects correctly', () => {
            const date = new Date(2024, 1, 22); // Month is 0-indexed (1 = Feb)
            const result = formatDate(date);
            expect(result).toBe('22.02.2024');
        });
    });
});
