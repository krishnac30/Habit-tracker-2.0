import React, { useState } from 'react';
import {
  Palette,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Trophy,
  Download,
  Upload,
  Database,
  Check,
  ChevronRight,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Flame,
  Shield,
  Award,
  Crown,
  Lock
} from 'lucide-react';
import { ThemePalette, UserStats, UnlockedBadge } from '../types';
import { THEME_PALETTES } from '../utils/themePalettes';
import { getStreakBadges, getNextUpcomingBadge } from '../utils/badges';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsViewProps {
  currentPalette: ThemePalette;
  onSelectPalette: (palette: ThemePalette) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  stats: UserStats;
  unlockedBadges: UnlockedBadge[];
  totalHabits: number;
  totalGoals: number;
  totalJournalEntries?: number;
  onOpenAchievements: () => void;
  onOpenExport: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentPalette,
  onSelectPalette,
  theme,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  stats,
  unlockedBadges,
  totalHabits,
  totalGoals,
  totalJournalEntries = 0,
  onOpenAchievements,
  onOpenExport,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const allBadges = getStreakBadges();
  const unlockedIds = new Set(unlockedBadges.map(b => b.badgeId));
  const { nextBadge, daysRemaining } = getNextUpcomingBadge(stats.streak, unlockedBadges);

  const lastExport = stats.lastExportTimestamp || 0;
  const hoursSinceExport = (Date.now() - lastExport) / (1000 * 60 * 60);
  const backupOverdue = hoursSinceExport >= 2;

  const renderBadgeMiniIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-4 h-4 ${isUnlocked ? 'text-[#F5D77F]' : 'text-[#655E52]'}`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={iconClass} />;
      case 'Shield':
        return <Shield className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'Award':
        return <Award className={iconClass} />;
      case 'Crown':
        return <Crown className={iconClass} />;
      default:
        return <Trophy className={iconClass} />;
    }
  };

  return (
    <div className="space-y-5 pb-32 pt-2">
      {/* Top Header */}
      <div className="px-1">
        <h2 className="font-display text-xl font-bold tracking-wide text-[#F5D77F] flex items-center gap-2">
          <span>Settings & Vault</span>
        </h2>
        <p className="text-xs text-[#9E9689] mt-0.5">
          Customize themes, audio feedback, and manage your local data backups.
        </p>
      </div>

      {/* Backup Alert Banner if overdue */}
      {backupOverdue && (
        <div
          onClick={onOpenExport}
          className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2B2312] to-[#1C170B] border border-[#D4AF37]/50 shadow-[0_4px_15px_rgba(212,175,55,0.15)] flex items-center justify-between gap-3 cursor-pointer group active:scale-[0.99] transition"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#F5D77F] shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#F5D77F] flex items-center gap-1.5">
                Vault Backup Overdue
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#D4AF37]/25 text-[#FFF0B8] uppercase">Local Data</span>
              </h3>
              <p className="text-[11px] text-[#C5BEAF]">
                Last export was {hoursSinceExport > 48 ? 'a while ago' : `${Math.floor(hoursSinceExport)}h ago`}. Tap to download your backup.
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#F5D77F] group-hover:translate-x-1 transition-transform shrink-0" />
        </div>
      )}

      {/* SECTION 1: Luxury Aura Palettes */}
      <div className="p-4 rounded-2xl bg-[#14120E] border border-[#D4AF37]/25 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
            Luxury Aura Theme Palettes
          </h3>
          <span className="text-[10px] text-[#8A8275] font-mono capitalize">
            Active: {currentPalette}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {THEME_PALETTES.map((palette) => {
            const isSelected = currentPalette === palette.id;

            return (
              <button
                key={palette.id}
                onClick={() => onSelectPalette(palette.id)}
                className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#231E14] border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.3)] ring-1 ring-[#D4AF37]/50'
                    : 'bg-[#181510] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Swatch Trio */}
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: palette.bgHex }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: palette.accentGoldHex }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-black/40 shadow-sm"
                      style={{ backgroundColor: palette.accentSecondaryHex }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-semibold truncate ${isSelected ? 'text-[#F5D77F]' : 'text-[#EDE8D0]'}`}>
                      {palette.name}
                    </h4>
                  </div>
                </div>
                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#090807] flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                ) : (
                  <span className="text-[10px] text-[#8A8275] uppercase font-mono shrink-0">Select</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Appearance & Audio Toggles */}
      <div className="p-4 rounded-2xl bg-[#14120E] border border-[#D4AF37]/25 space-y-3 shadow-sm">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#F5D77F]">
          Display & Sensory Feedback
        </h3>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-3 rounded-xl bg-[#181510] border border-white/5 hover:border-[#D4AF37]/40 flex items-center justify-between transition group text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#F5D77F]">
                {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#EDE8D0]">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </div>
                <div className="text-[10px] text-[#8A8275]">
                  Tap to switch
                </div>
              </div>
            </div>
          </button>

          {/* Audio Chimes Toggle */}
          <button
            onClick={onToggleSound}
            className="p-3 rounded-xl bg-[#181510] border border-white/5 hover:border-[#D4AF37]/40 flex items-center justify-between transition group text-left"
          >
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center text-[#F5D77F]">
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-[#8A8275]" />}
              </div>
              <div>
                <div className="text-xs font-bold text-[#EDE8D0]">
                  {soundEnabled ? 'Audio On' : 'Muted'}
                </div>
                <div className="text-[10px] text-[#8A8275]">
                  Haptic chimes
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 3: Hall of Achievements */}
      <div
        onClick={onOpenAchievements}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#211B10] via-[#16130C] to-[#110E09] border border-[#D4AF37]/40 shadow-[0_4px_20px_rgba(212,175,55,0.1)] cursor-pointer group active:scale-[0.99] transition relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#F5D77F]">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display text-sm font-bold text-[#F5D77F] flex items-center gap-2">
                Hall of Achievements
                <span className="px-2 py-0.2 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#FFE58F] text-[10px] font-semibold uppercase font-mono">
                  {unlockedBadges.length}/{allBadges.length} Earned
                </span>
              </h3>
              <p className="text-[11px] text-[#C5BEAF]">
                {nextBadge
                  ? `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} to unlock ${nextBadge.title} (+${nextBadge.xpReward} XP)`
                  : 'All streak master achievements unlocked!'}
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#F5D77F] group-hover:translate-x-1 transition-transform shrink-0" />
        </div>

        {/* Streak Badges Row */}
        <div className="grid grid-cols-5 gap-2 pt-2 border-t border-[#D4AF37]/20">
          {allBadges.map((badge) => {
            const isUnlocked = unlockedIds.has(badge.id);

            return (
              <div
                key={badge.id}
                className="flex flex-col items-center justify-center text-center"
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    isUnlocked
                      ? 'bg-[#2A2213] border-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.35)]'
                      : 'bg-[#15130E] border-white/10 opacity-50'
                  }`}
                >
                  {isUnlocked ? (
                    renderBadgeMiniIcon(badge.iconName, true)
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-[#736B5E]" />
                  )}
                </div>
                <span
                  className={`text-[9px] font-mono mt-1 font-semibold ${
                    isUnlocked ? 'text-[#F5D77F]' : 'text-[#8A8274]'
                  }`}
                >
                  {badge.daysRequired}d
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: Data Vault & Local Storage */}
      <div className="p-4 rounded-2xl bg-[#14120E] border border-[#D4AF37]/25 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
            Local Data Vault & Portability
          </h3>
          <span className="text-[10px] text-[#8A8275] font-mono">
            100% Offline
          </span>
        </div>

        <p className="text-xs text-[#9E9689] leading-relaxed">
          All habits, goals, milestones, notes, and calendar events are stored securely on this device without cloud trackers.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={onOpenExport}
            className="p-3 rounded-xl bg-[#1D180F] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 flex items-center gap-2 transition group"
          >
            <Download className="w-4 h-4 text-[#F5D77F] shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-[#EDE8D0]">Backup JSON</div>
              <div className="text-[10px] text-[#8A8275]">Save to file</div>
            </div>
          </button>

          <button
            onClick={onOpenExport}
            className="p-3 rounded-xl bg-[#1D180F] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 flex items-center gap-2 transition group"
          >
            <Upload className="w-4 h-4 text-[#F5D77F] shrink-0" />
            <div className="text-left">
              <div className="text-xs font-bold text-[#EDE8D0]">Import JSON</div>
              <div className="text-[10px] text-[#8A8275]">Restore data</div>
            </div>
          </button>
        </div>
      </div>

      {/* SECTION 5: PWA Installation & App Info */}
      <div className="p-4 rounded-2xl bg-[#14120E] border border-white/5 space-y-2.5 text-center">
        {isInstallable && (
          <button
            onClick={install}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-display font-bold text-xs tracking-wider shadow-md hover:scale-[1.01] active:scale-95 transition flex items-center justify-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>Install APEX Life OS to Home Screen</span>
          </button>
        )}

        <div className="text-center pt-1">
          <span className="font-display font-black text-sm text-[#F5D77F] tracking-widest uppercase">
            APEX Life OS
          </span>
          <p className="text-[10px] text-[#8A8275] mt-0.5 font-mono">
            v2.5 Executive Edition • {totalHabits} Habits • {totalGoals} Goals • {totalJournalEntries} Journal Notes
          </p>
        </div>
      </div>
    </div>
  );
};
