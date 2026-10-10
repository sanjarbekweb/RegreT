import { Activity, Attachment } from './types';

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

/**
 * Monochromatic GitHub single-color intensity scale matching Linear/GitHub design.
 * Level 0: 0 activities -> #161B22 / #21262D
 * Level 1: 1 activity   -> #0D3868 / #1B4B82
 * Level 2: 2 activities -> #1A5699 / #236EC2
 * Level 3: 3 activities -> #2875D0 / #368AE6
 * Level 4: 4+ activities-> #58A6FF / #79B8FF
 */
export function getIntensityScale(count: number) {
  if (count <= 0) return { level: 0, bg: 'bg-[#161B22]', border: 'border-[#21262D]', colorHex: '#161B22' };
  if (count === 1) return { level: 1, bg: 'bg-[#0D3868]', border: 'border-[#1B4B82]', colorHex: '#0D3868' };
  if (count === 2) return { level: 2, bg: 'bg-[#1A5699]', border: 'border-[#236EC2]', colorHex: '#1A5699' };
  if (count === 3) return { level: 3, bg: 'bg-[#2875D0]', border: 'border-[#368AE6]', colorHex: '#2875D0' };
  return { level: 4, bg: 'bg-[#58A6FF]', border: 'border-[#79B8FF]', colorHex: '#58A6FF' };
}

export function getIntensityClass(count: number): string {
  const { bg, border } = getIntensityScale(count);
  return `${bg} ${border}`;
}

export interface ActivityPhotoItem {
  attachment: Attachment;
  activity: Activity;
  dateStr: string;
}

export type DayStatus = 'active' | 'empty' | 'missing' | 'future';

export interface DayStatusInfo {
  status: DayStatus;
  label: string;
  description: string;
  cssClass: string;
  intensityLevel: number;
}

/**
 * Finds the earliest recorded activity date string (YYYY-MM-DD), serving as the archive start date.
 */
export function getArchiveStartDate(activities: Activity[]): string {
  if (!activities || activities.length === 0) {
    return new Date().toISOString().split('T')[0];
  }
  let earliest = activities[0]?.startedAt ? activities[0].startedAt.split('T')[0] : '';
  for (let i = 1; i < activities.length; i++) {
    const d = activities[i]?.startedAt ? activities[i].startedAt.split('T')[0] : '';
    if (d && (!earliest || d < earliest)) {
      earliest = d;
    }
  }
  return earliest || new Date().toISOString().split('T')[0];
}

/**
 * Classifies a calendar day into:
 * - 'future': Date is after today
 * - 'active': Date has 1+ logged activities
 * - 'empty': Date is within the tracked archive period (>= archiveStartDate) but has 0 activities
 * - 'missing': Date is before the archive tracking started (or an unrecorded gap)
 */
export function classifyDay(
  dateStr: string,
  count: number,
  todayStr: string,
  archiveStartDate?: string
): DayStatusInfo {
  if (dateStr > todayStr) {
    return {
      status: 'future',
      label: 'Future',
      description: 'Upcoming date in calendar',
      cssClass: 'opacity-0 pointer-events-none border-transparent',
      intensityLevel: -1,
    };
  }

  if (count > 0) {
    const scale = getIntensityScale(count);
    return {
      status: 'active',
      label: `${count} ${count === 1 ? 'activity' : 'activities'}`,
      description: `Active day with ${count} life blocks recorded`,
      cssClass: `${scale.bg} ${scale.border}`,
      intensityLevel: scale.level,
    };
  }

  // If there's an archive start date and date is before it, it's missing data
  if (archiveStartDate && dateStr < archiveStartDate) {
    return {
      status: 'missing',
      label: 'Missing data',
      description: 'Untracked date prior to archive start',
      cssClass: 'bg-[#090D12] border-dashed border-[#30363D] text-[#484F58]',
      intensityLevel: 0,
    };
  }

  // Within tracking window but 0 activities logged: empty day
  return {
    status: 'empty',
    label: 'Empty day (0 activities)',
    description: 'Tracked day with no recorded activities (rest day)',
    cssClass: 'bg-[#161B22] border-[#21262D]',
    intensityLevel: 0,
  };
}

/**
 * Extracts and sorts all photo attachments from activities chronologically descending.
 */
export function extractPhotosFromActivities(activities: Activity[]): ActivityPhotoItem[] {
  const list: ActivityPhotoItem[] = [];
  activities.forEach((act) => {
    const dateStr = act.startedAt ? act.startedAt.split('T')[0] : '';
    if (act.attachments && act.attachments.length > 0) {
      act.attachments.forEach((att) => {
        list.push({
          attachment: att,
          activity: act,
          dateStr,
        });
      });
    }
  });

  return list.sort(
    (a, b) =>
      new Date(b.activity.startedAt).getTime() - new Date(a.activity.startedAt).getTime()
  );
}

/**
 * Groups items by date string in YYYY-MM-DD format (Apple Photos grouping pattern).
 */
export function groupItemsByDate<T extends { dateStr: string }>(items: T[]): Record<string, T[]> {
  const groups: Record<string, T[]> = {};
  items.forEach((item) => {
    if (!groups[item.dateStr]) {
      groups[item.dateStr] = [];
    }
    groups[item.dateStr].push(item);
  });
  return groups;
}


