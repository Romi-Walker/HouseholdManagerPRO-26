/**
 * Calculates the next occurrence date based on the current date and interval.
 */
export function calculateNextDate(currentDate: string | Date, interval: 'daily' | 'weekly' | 'monthly' | 'yearly'): string {
    const nextDate = new Date(currentDate);

    switch (interval) {
        case 'daily':
            nextDate.setDate(nextDate.getDate() + 1);
            break;
        case 'weekly':
            nextDate.setDate(nextDate.getDate() + 7);
            break;
        case 'monthly':
            nextDate.setMonth(nextDate.getMonth() + 1);
            break;
        case 'yearly':
            nextDate.setFullYear(nextDate.getFullYear() + 1);
            break;
    }

    return nextDate.toISOString().split('T')[0];
}
