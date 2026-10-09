export type TabType = 'home' | 'habits' | 'goals' | 'journal' | 'calendar' | 'mood' | 'settings';

export type MoodType = 'great' | 'good' | 'okay' | 'low' | 'rough';

export type JournalEnergy = 'breakthrough' | 'concept' | 'reflective' | 'action_item';

export interface JournalEntry {
  id: string;
  title: string;
  topic: string; // e.g. "System Architecture", "Neurobiology", "Frontend Performance"
  content: string; // Prose / Markdown notes
  date: string; // YYYY-MM-DD
  time: string; // HH:MM (24-hour format e.g. "14:30")
  timestamp: number; // Unix epoch ms
  pinned?: boolean;
  tags?: string[];
  insights?: string[]; // Highlighted takeaways / bullet insights
  images?: string[]; // Base64 data URLs or image URLs
  readTimeMinutes?: number;
  energy?: JournalEnergy;
  linkedGoalId?: string;
  linkedHabitId?: string;
  updatedAt?: number;
}

export interface MoodEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodType;
  emoji: string;
  label: string;
  note?: string;
  timestamp: number;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string; // YYYY-MM-DD
  order: number;
  completedDates: string[]; // list of YYYY-MM-DD strings
}

export interface Subtask {
  id: string;
  name: string;
  isDone: boolean;
  dueDate?: string; // YYYY-MM-DD
  note?: string;
  order: number;
}

export interface GoalNote {
  id: string;
  date: string; // YYYY-MM-DD
  text: string;
  timestamp: number;
}

export interface Goal {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  isDone: boolean;
  doneDate?: string; // YYYY-MM-DD
  order: number;
  subtasks: Subtask[];
  notes: GoalNote[];
  linkedHabitIds: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "14:00" or "All day"
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastActiveDate?: string;
  lastExportTimestamp?: number;
}

export type ThemePalette = 'gold' | 'emerald' | 'sapphire' | 'amethyst' | 'ivory';

export interface StreakBadge {
  id: string;
  daysRequired: number;
  title: string;
  codename: string;
  description: string;
  xpReward: number;
  iconName: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'imperial';
  badgeColor: string;
  borderGlow: string;
}

export interface UnlockedBadge {
  badgeId: string;
  unlockedAt: string; // YYYY-MM-DD
  timestamp: number;
}

export interface CelebrationData {
  title: string;
  subtitle: string;
  type: 'goal' | 'milestone' | 'subtasks' | 'levelup' | 'badge';
  milestonePercentage?: number;
  xpEarned?: number;
}

export interface AppState {
  habits: Habit[];
  goals: Goal[];
  calendarEvents: CalendarEvent[];
  moodEntries: MoodEntry[];
  journalEntries: JournalEntry[];
  stats: UserStats;
  theme: 'dark' | 'light';
  palette: ThemePalette;
  unlockedBadges: UnlockedBadge[];
  soundEnabled: boolean;
}

export const PRESET_HABITS = [
  { name: 'Walk', icon: 'Footprints', color: '#10B981' },
  { name: 'Water', icon: 'Droplet', color: '#38BDF8' },
  { name: 'Read', icon: 'BookOpen', color: '#F59E0B' },
  { name: 'Meditate', icon: 'Brain', color: '#A855F7' },
  { name: 'Sleep', icon: 'Moon', color: '#6366F1' },
  { name: 'Gym', icon: 'Dumbbell', color: '#EF4444' },
];

export const AVAILABLE_ICONS = [
  'Footprints', 'Droplet', 'BookOpen', 'Brain', 'Moon', 'Dumbbell',
  'Flame', 'Heart', 'Sparkles', 'Coffee', 'Target', 'Compass',
  'Zap', 'Sun', 'Shield', 'Award'
];

export const COLOR_SWATCHES = [
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Cyan', hex: '#06B6D4' },
  { name: 'Amethyst', hex: '#A855F7' },
  { name: 'Crimson', hex: '#EF4444' },
  { name: 'Sapphire', hex: '#3B82F6' },
  { name: 'Amber', hex: '#F59E0B' },
];

export const MOOD_OPTIONS: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'great', emoji: '😊', label: 'Great' },
  { type: 'good', emoji: '🙂', label: 'Good' },
  { type: 'okay', emoji: '😐', label: 'Okay' },
  { type: 'low', emoji: '😔', label: 'Low' },
  { type: 'rough', emoji: '😢', label: 'Rough' },
];
