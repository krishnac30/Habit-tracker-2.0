import React from 'react';
import { Sparkles, Flame, Settings } from 'lucide-react';
import { UserStats } from '../types';

interface HeaderProps {
  stats: UserStats;
  theme: 'dark' | 'light';
  soundEnabled: boolean;
  onToggleTheme: () => void;
  onToggleSound: () => void;
  onOpenExport: () => void;
  onOpenAchievements: () => void;
  onOpenPalettes: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  onOpenAchievements,
  onOpenSettings,
}) => {
  const xpCurrent = stats.xp % 500;
  const xpNeeded = 500;
  const progressPercent = Math.min(100, Math.round((xpCurrent / xpNeeded) * 100));

  // Check if backup is overdue (> 2 hours)
  const lastExport = stats.lastExportTimestamp || 0;
  const hoursSinceExport = (Date.now() - lastExport) / (1000 * 60 * 60);
  const needsBackup = hoursSinceExport >= 2;

  return (
    <header className="sticky top-0 z-40 px-4 pt-3 pb-3 backdrop-blur-xl bg-[#090807]/80 dark:bg-[#090807]/85 border-b border-[#D4AF37]/20 transition-colors">
      <div className="max-w-md mx-auto">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2A2417] to-[#12100B] border border-[#D4AF37]/50 flex items-center justify-center shadow-sm">
              <span className="font-display font-black text-sm text-[#F5D77F]">A</span>
            </div>
            <div>
              <h1 className="font-display text-base font-bold tracking-wider text-[#F5D77F] leading-none">
                APEX
              </h1>
              <span className="text-[10px] tracking-widest text-[#9E9689] uppercase font-mono">
                Life OS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak Badge - Clickable to view Hall of Achievements */}
            <button
              onClick={onOpenAchievements}
              title="View Hall of Achievements & Badges"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#F5D77F] text-xs font-semibold hover:bg-[#D4AF37]/20 active:scale-95 transition"
            >
              <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-mono">{stats.streak}d</span>
            </button>

            {/* Centralized Settings & Vault Button */}
            <button
              onClick={onOpenSettings}
              aria-label="Settings & Vault"
              title="Aura Themes, Settings, Achievements & Data Vault"
              className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#14120E] border border-[#D4AF37]/40 text-[#F5D77F] hover:bg-[#D4AF37]/15 active:scale-95 transition shadow-sm"
            >
              <Settings className="w-3.5 h-3.5 text-[#F5D77F]" />
              <span className="text-xs font-bold font-display hidden sm:inline">Settings</span>
              {/* Notification pip if backup recommended */}
              {needsBackup && (
                <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse shadow-[0_0_6px_#F59E0B]" />
              )}
            </button>
          </div>
        </div>

        {/* XP & Level Bar (every 500 XP = 1 Level) */}
        <div className="bg-[#14120E] rounded-xl p-2 border border-[#D4AF37]/25 shadow-inner">
          <div className="flex items-center justify-between text-xs mb-1">
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/40 font-display font-bold text-[10px] text-[#F5D77F] tracking-wider">
                LVL {stats.level}
              </span>
              <span className="text-[#9E9689] text-[11px] font-medium">Ranked Vanguard</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-[#D1C9BA]">
              <Sparkles className="w-3 h-3 text-[#F5D77F]" />
              <span className="text-[#F5D77F] font-bold">{stats.xp}</span>
              <span className="text-[#9E9689]">/ {(stats.level) * 500} XP</span>
            </div>
          </div>

          {/* Animated Gold Level Progress Bar with Glowing Edge */}
          <div className="relative w-full h-2 rounded-full bg-[#201D17] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(212,175,55,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-[9px] text-[#9E9689] font-mono">
            <span>Progress: {progressPercent}%</span>
            <span>{500 - xpCurrent} XP to Level {stats.level + 1}</span>
          </div>
        </div>
      </div>
    </header>
  );
};
