export interface StreakDay {
  dateStr?: string;
  count: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
}

export type StreakInputItem = StreakDay | number;

/**
 * Calculates contribution streak statistics from chronologically ordered past-and-today day records.
 *
 * Rules:
 * - totalActiveDays: count of all days with count > 0.
 * - longestStreak: maximum contiguous sequence of days with count > 0 (always >= currentStreak).
 * - currentStreak: contiguous sequence of days with count > 0 ending today (or yesterday if today is still 0).
 */
export function calculateStreaks(days: StreakInputItem[]): StreakStats {
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let totalActiveDays = 0;

  const getCount = (item: StreakInputItem): number => {
    if (typeof item === 'number') return item;
    return item?.count ?? 0;
  };

  for (let i = 0; i < days.length; i++) {
    const count = getCount(days[i]);
    if (count > 0) {
      totalActiveDays++;
      tempStreak++;
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Check current streak from today backwards
  for (let i = days.length - 1; i >= 0; i--) {
    const count = getCount(days[i]);
    if (count > 0) {
      currentStreak++;
    } else if (i === days.length - 1) {
      // Today has 0 so far, can count previous days if active
      continue;
    } else {
      break;
    }
  }

  // Invariant: longest streak is at least as large as the current streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
  };
}
