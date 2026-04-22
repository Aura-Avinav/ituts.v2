import { differenceInCalendarDays, parseISO, startOfToday } from 'date-fns';
import type { Habit } from '../types';

export interface HabitStats {
    currentStreak: number;
    longestStreak: number;
    totalCompletions: number;
    completionRate: number; // 0-100
}

export function calculateHabitStats(habit: Habit): HabitStats {
    const dates = [...habit.completedDates].sort();
    const totalCompletions = dates.length;

    if (totalCompletions === 0) {
        return { currentStreak: 0, longestStreak: 0, totalCompletions: 0, completionRate: 0 };
    }

    // Calculate Current Streak
    let currentStreak = 0;
    const today = startOfToday();
    const lastCompletionDate = parseISO(dates[dates.length - 1]);

    const diff = differenceInCalendarDays(today, lastCompletionDate);

    // If the last completion was today (0) or yesterday (1), the streak is alive.
    // Otherwise (>= 2), it's broken, unless we want to be lenient? No, strict streaks.
    if (diff <= 1) {
        currentStreak = 1;
        // Count backwards
        for (let i = dates.length - 1; i > 0; i--) {
            const current = parseISO(dates[i]);
            const prev = parseISO(dates[i - 1]);
            const gap = differenceInCalendarDays(current, prev);

            if (gap === 1) {
                currentStreak++;
            } else if (gap === 0) {
                // Same day duplicate, ignore
                continue;
            } else {
                break; // Streak broken
            }
        }
    }

    // Calculate Longest Streak
    let longestStreak = 0;
    let tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
        const current = parseISO(dates[i]);
        const prev = parseISO(dates[i - 1]);
        const gap = differenceInCalendarDays(current, prev);

        if (gap === 1) {
            tempStreak++;
        } else if (gap > 1) {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
        }
        // If gap is 0, do nothing (same day)
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Completion Rate (last 30 days for relevance, or all time?)
    // Let's do All Time since creation? We don't track creation date for habits efficiently yet.
    // Let's do "Last 30 Days" rate effectively.
    // Actually, simple rate: completions / (days since first completion) might be better?
    // Let's just return total for now, rate can be calculated in UI if needed.

    return {
        currentStreak,
        longestStreak,
        totalCompletions,
        completionRate: 0 // Placeholder
    };
}
