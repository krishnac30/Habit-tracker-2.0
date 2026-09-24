import { StreakBadge, UnlockedBadge } from '../types';

export const STREAK_BADGES: StreakBadge[] = [
  {
    id: 'badge_streak_7',
    daysRequired: 7,
    title: 'Bronze Vanguard',
    codename: '7-Day Ignition',
    description: 'Maintained unbroken habit discipline for 7 consecutive days. Initial momentum established.',
    xpReward: 150,
    iconName: 'Flame',
    tier: 'bronze',
    badgeColor: '#CD7F32',
    borderGlow: 'rgba(205, 127, 50, 0.4)',
  },
  {
    id: 'badge_streak_14',
    daysRequired: 14,
    title: 'Silver Momentum',
    codename: '14-Day Fortitude',
    description: 'Two unbroken weeks of daily execution. Daily resistance transformed into automatic habit rhythm.',
    xpReward: 300,
    iconName: 'Shield',
    tier: 'silver',
    badgeColor: '#E2E8F0',
    borderGlow: 'rgba(226, 232, 240, 0.4)',
  },
  {
    id: 'badge_streak_21',
    daysRequired: 21,
    title: 'Habit Alchemist',
    codename: '21-Day Transformation',
    description: 'The scientific threshold for neuroplastic habit formation. Your daily rituals are now encoded into your identity.',
    xpReward: 500,
    iconName: 'Sparkles',
    tier: 'platinum',
    badgeColor: '#38BDF8',
    borderGlow: 'rgba(56, 189, 248, 0.45)',
  },
  {
    id: 'badge_streak_30',
    daysRequired: 30,
    title: 'Golden Sovereign',
    codename: '30-Day Mastery',
    description: 'One complete lunar cycle of relentless consistency. Sovereign over temptation and procrastination.',
    xpReward: 800,
    iconName: 'Award',
    tier: 'gold',
    badgeColor: '#D4AF37',
    borderGlow: 'rgba(212, 175, 55, 0.5)',
  },
  {
    id: 'badge_streak_100',
    daysRequired: 100,
    title: 'Imperial Titan',
    codename: '100-Day Centurion',
    description: '100 consecutive days of unwavering focus. An elite pinnacle attained by only the top 0.1% of operators.',
    xpReward: 2500,
    iconName: 'Crown',
    tier: 'imperial',
    badgeColor: '#F59E0B',
    borderGlow: 'rgba(245, 158, 11, 0.6)',
  },
];

export function getStreakBadges(): StreakBadge[] {
  return STREAK_BADGES;
}

/**
 * Returns any badges that the user qualifies for with their current streak
 * but has not yet received.
 */
export function checkNewStreakBadges(
  streak: number,
  unlockedBadges: UnlockedBadge[] = []
): StreakBadge[] {
  const unlockedIds = new Set(unlockedBadges.map(b => b.badgeId));
  return STREAK_BADGES.filter(
    badge => streak >= badge.daysRequired && !unlockedIds.has(badge.id)
  );
}

/**
 * Returns the next upcoming badge the user hasn't unlocked yet
 */
export function getNextUpcomingBadge(
  streak: number,
  unlockedBadges: UnlockedBadge[] = []
): { nextBadge: StreakBadge | null; daysRemaining: number } {
  const unlockedIds = new Set(unlockedBadges.map(b => b.badgeId));
  const pending = STREAK_BADGES.filter(badge => !unlockedIds.has(badge.id));

  if (pending.length === 0) {
    return { nextBadge: null, daysRemaining: 0 };
  }

  // Next one in order
  const nextBadge = pending[0];
  const daysRemaining = Math.max(0, nextBadge.daysRequired - streak);
  return { nextBadge, daysRemaining };
}
