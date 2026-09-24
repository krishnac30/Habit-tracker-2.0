import { AppState, Habit, Goal, CalendarEvent, MoodEntry } from '../types';

const STORAGE_KEY = 'apex_life_os_state_v1';

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function calculateDaysBetween(fromStr: string, toStr: string): number {
  if (!fromStr || !toStr) return 0;
  const [y1, m1, d1] = fromStr.split('-').map(Number);
  const [y2, m2, d2] = toStr.split('-').map(Number);
  const dFrom = new Date(y1, m1 - 1, d1).getTime();
  const dTo = new Date(y2, m2 - 1, d2).getTime();
  const diffDays = Math.round((dTo - dFrom) / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function calculateHabitConsistency(habit: Habit, todayStr: string = getTodayString()): {
  completedCount: number;
  totalDays: number;
  percentage: number;
  colorClass: string;
} {
  const completedCount = habit.completedDates.length;
  // Total days since creation including today
  const daysSinceCreation = Math.max(1, calculateDaysBetween(habit.createdAt, todayStr) + 1);
  const totalDays = Math.max(completedCount, daysSinceCreation);
  const percentage = Math.round((completedCount / totalDays) * 100);

  let colorClass = 'text-slate-400';
  if (percentage >= 80) {
    colorClass = 'text-emerald-400';
  } else if (percentage >= 50) {
    colorClass = 'text-[#D4AF37]';
  }

  return { completedCount, totalDays, percentage, colorClass };
}

export function calculateGoalProgress(goal: Goal): number {
  if (goal.isDone) return 100;
  if (!goal.subtasks || goal.subtasks.length === 0) return 0;
  const doneCount = goal.subtasks.filter(st => st.isDone).length;
  return Math.round((doneCount / goal.subtasks.length) * 100);
}

export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 250) + 1);
}

export function updateStreak(habits: Habit[]): number {
  const allCompletedDatesSet = new Set<string>();
  habits.forEach(h => {
    h.completedDates.forEach(d => allCompletedDatesSet.add(d));
  });

  const todayStr = getTodayString();
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const hasDoneToday = allCompletedDatesSet.has(todayStr);
  const hasDoneYesterday = allCompletedDatesSet.has(yesterdayStr);

  if (!hasDoneToday && !hasDoneYesterday) {
    return 0;
  }

  // Count backwards from current active starting point
  let count = 0;
  const checkDate = new Date(hasDoneToday ? today : yesterday);

  while (true) {
    const dateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (allCompletedDatesSet.has(dateStr)) {
      count++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return count;
}

// Initial Starter Data if first visit
export function getInitialState(): AppState {
  const today = getTodayString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const twoDaysAgoStr = `${twoDaysAgo.getFullYear()}-${String(twoDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(twoDaysAgo.getDate()).padStart(2, '0')}`;

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

  const targetDate1 = new Date();
  targetDate1.setDate(targetDate1.getDate() + 21);
  const targetDate1Str = `${targetDate1.getFullYear()}-${String(targetDate1.getMonth() + 1).padStart(2, '0')}-${String(targetDate1.getDate()).padStart(2, '0')}`;

  const targetDate2 = new Date();
  targetDate2.setDate(targetDate2.getDate() + 45);
  const targetDate2Str = `${targetDate2.getFullYear()}-${String(targetDate2.getMonth() + 1).padStart(2, '0')}-${String(targetDate2.getDate()).padStart(2, '0')}`;

  const initialHabits: Habit[] = [
    {
      id: 'h1',
      name: 'Hydration & Electrolytes',
      icon: 'Droplet',
      color: '#06B6D4',
      createdAt: sevenDaysAgoStr,
      order: 0,
      completedDates: [twoDaysAgoStr, yesterdayStr, today]
    },
    {
      id: 'h2',
      name: 'Deep Focus & Reading',
      icon: 'BookOpen',
      color: '#D4AF37',
      createdAt: sevenDaysAgoStr,
      order: 1,
      completedDates: [twoDaysAgoStr, yesterdayStr]
    },
    {
      id: 'h3',
      name: 'Morning Run & Mobility',
      icon: 'Footprints',
      color: '#10B981',
      createdAt: sevenDaysAgoStr,
      order: 2,
      completedDates: [yesterdayStr]
    },
    {
      id: 'h4',
      name: 'Mindful Meditation',
      icon: 'Brain',
      color: '#A855F7',
      createdAt: sevenDaysAgoStr,
      order: 3,
      completedDates: [twoDaysAgoStr, yesterdayStr]
    }
  ];

  const initialGoals: Goal[] = [
    {
      id: 'g1',
      name: 'Complete Half-Marathon Preparation',
      startDate: sevenDaysAgoStr,
      targetDate: targetDate1Str,
      isDone: false,
      order: 0,
      linkedHabitIds: ['h3'],
      notes: [
        {
          id: 'n1',
          date: sevenDaysAgoStr,
          text: 'Baseline 10km time trial completed in 52 mins. Heart rate zones looking steady.',
          timestamp: Date.now() - 7 * 86400000
        }
      ],
      subtasks: [
        { id: 'st1', name: 'Purchase carbon-plated racing shoes', isDone: true, order: 0 },
        { id: 'st2', name: 'Establish 15km weekend long run pacing', isDone: true, order: 1, note: 'Kept smooth 5:15/km pace without dehydration spikes.' },
        { id: 'st3', name: 'Complete 3x threshold speed intervals', isDone: false, dueDate: targetDate1Str, order: 2 },
        { id: 'st4', name: 'Final taper week and carb-loading protocol', isDone: false, order: 3 }
      ]
    },
    {
      id: 'g2',
      name: 'Launch Global Architecture Portfolio',
      startDate: twoDaysAgoStr,
      targetDate: targetDate2Str,
      isDone: false,
      order: 1,
      linkedHabitIds: ['h2'],
      notes: [
        {
          id: 'n2',
          date: twoDaysAgoStr,
          text: 'Selected 8 signature case studies highlighting obsidian minimalism and micro-interactions.',
          timestamp: Date.now() - 2 * 86400000
        }
      ],
      subtasks: [
        { id: 'st5', name: 'Curate high-res case study renders', isDone: true, order: 0 },
        { id: 'st6', name: 'Design luxury dark/gold aesthetic mockups', isDone: false, order: 1 },
        { id: 'st7', name: 'Implement interactive 3D WebGL hero showcase', isDone: false, order: 2 }
      ]
    }
  ];

  const initialEvents: CalendarEvent[] = [
    {
      id: 'e1',
      title: 'Performance Review & Goal Audit',
      date: today,
      time: '16:00'
    },
    {
      id: 'e2',
      title: 'Long Distance Endurance Session',
      date: targetDate1Str,
      time: '07:30'
    }
  ];

  const initialMoods: MoodEntry[] = [
    {
      id: 'm1',
      date: yesterdayStr,
      mood: 'great',
      emoji: '😊',
      label: 'Great',
      note: 'Crushed daily goals early. Mind felt extraordinarily crisp and energized.',
      timestamp: Date.now() - 86400000
    }
  ];

  return {
    habits: initialHabits,
    goals: initialGoals,
    calendarEvents: initialEvents,
    moodEntries: initialMoods,
    stats: {
      xp: 285,
      level: 1,
      streak: 3,
      lastActiveDate: today,
      lastExportTimestamp: Date.now() - 3 * 3600 * 1000 // 3 hours ago -> triggers backup reminder banner
    },
    theme: 'dark',
    palette: 'gold',
    unlockedBadges: [],
    soundEnabled: true
  };
}

export function loadState(): AppState {
  if (typeof window === 'undefined') return getInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    const parsed = JSON.parse(raw) as AppState;
    if (!parsed || !Array.isArray(parsed.habits)) return getInitialState();
    return {
      ...parsed,
      palette: parsed.palette || 'gold',
      unlockedBadges: Array.isArray(parsed.unlockedBadges) ? parsed.unlockedBadges : [],
    };
  } catch (err) {
    console.error('Failed to load state from localStorage:', err);
    return getInitialState();
  }
}

export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage:', err);
  }
}
