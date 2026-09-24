import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Settings,
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
  Layers,
  Flame,
  Shield,
  Award,
  Crown,
  Lock,
  Smartphone,
  Info
} from 'lucide-react';
import { ThemePalette, UserStats, UnlockedBadge } from '../types';
import { THEME_PALETTES } from '../utils/themePalettes';
import { getStreakBadges, getNextUpcomingBadge } from '../utils/badges';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  layoutMode: 'b' | 'c';
  onSelectLayoutMode: (mode: 'b' | 'c') => void;
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
  onOpenAchievements: () => void;
  onOpenExport: () => void;
}

export const SettingsVaultModal: React.FC<SettingsVaultModalProps> = ({
  isOpen,
  onClose,
  layoutMode,
  onSelectLayoutMode,
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
  onOpenAchievements,
  onOpenExport,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (!isOpen) return null;

  const activePalette = THEME_PALETTES.find(p => p.id === currentPalette) || THEME_PALETTES[0];
  const allBadges = getStreakBadges();
  const unlockedIds = new Set((unlockedBadges || []).map(b => b.badgeId));
  const { nextBadge, daysRemaining } = getNextUpcomingBadge(stats.streak, unlockedBadges || []);

  const lastExport = stats.lastExportTimestamp || 0;
  const hoursSinceExport = (Date.now() - lastExport) / (1000 * 60 * 60);

  const renderBadgeMini = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-3.5 h-3.5 ${isUnlocked ? 'text-[#F5D77F]' : 'text-[#655E52]'}`;
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
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="w-full max-w-md max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#191611]/90 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#F5D77F]">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#F5D77F] leading-tight">
                  Settings & Vault
                </h2>
                <p className="text-[11px] text-[#9E9689]">
                  Layout architectures, aura themes & data hub
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-4 overflow-y-auto space-y-5 max-h-[calc(92vh-130px)]">

            {/* 1. LAYOUT ARCHITECTURE OPTION PICKER */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Layout Experience
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/15 text-[#F5D77F] border border-[#D4AF37]/30 font-mono">
                  Active: Layout {layoutMode.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* Option B: Executive Core (4-Tab) */}
                <div
                  onClick={() => onSelectLayoutMode('b')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] relative ${
                    layoutMode === 'b'
                      ? 'bg-[#221C11] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                      : 'bg-[#100E0A] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold font-display text-[#F5D77F]">
                          Option B: Executive Core (4 Dedicated Tabs)
                        </h4>
                        {layoutMode === 'b' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#090807] font-bold uppercase">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A8A193] mt-1 leading-relaxed">
                        Strict separation of concerns. Four specialized tabs: <strong>Today</strong>, <strong>Habits</strong>, <strong>Goals</strong>, and <strong>Timeline</strong>, with secondary utilities consolidated here in Settings.
                      </p>
                    </div>
                    {layoutMode === 'b' && (
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#090807] flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Option C: Split-Deck (Action vs Strategy) */}
                <div
                  onClick={() => onSelectLayoutMode('c')}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer active:scale-[0.99] relative ${
                    layoutMode === 'c'
                      ? 'bg-[#221C11] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                      : 'bg-[#100E0A] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold font-display text-[#F5D77F]">
                          Option C: Split-Deck Architecture
                        </h4>
                        {layoutMode === 'c' && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#090807] font-bold uppercase">
                            Selected
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#A8A193] mt-1 leading-relaxed">
                        Top deck switcher toggling between <strong>Daily Action Deck</strong> (Today's Habits + Mood Pulse) and <strong>Long-Term Strategy Deck</strong> (Quarterly Goals + Roadmaps).
                      </p>
                    </div>
                    {layoutMode === 'c' && (
                      <div className="w-5 h-5 rounded-full bg-[#D4AF37] text-[#090807] flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. AURA & LUXURY THEMES */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                Aura & Theme Palettes
              </span>

              <div className="grid grid-cols-5 gap-2">
                {THEME_PALETTES.map(p => {
                  const isSelected = currentPalette === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectPalette(p.id)}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                        isSelected
                          ? 'border-2 shadow-md scale-105'
                          : 'border border-white/10 hover:border-white/25'
                      }`}
                      style={{
                        backgroundColor: p.bgHex,
                        borderColor: isSelected ? p.accentGoldHex : 'rgba(255,255,255,0.1)',
                      }}
                      title={p.name}
                    >
                      <div
                        className="w-5 h-5 rounded-full mb-1 shadow-sm flex items-center justify-center"
                        style={{ backgroundColor: p.accentGoldHex }}
                      >
                        {isSelected && <Check className="w-3 h-3 text-black stroke-[3]" />}
                      </div>
                      <span
                        className="text-[9px] font-bold truncate max-w-[50px]"
                        style={{ color: p.textPrimaryHex }}
                      >
                        {p.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. TACTILE AUDIO & DAY/NIGHT SWITCHER */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
              {/* Sound Toggle */}
              <div
                onClick={onToggleSound}
                className="p-3 rounded-2xl bg-[#100E0A] border border-white/10 hover:border-white/20 flex items-center justify-between cursor-pointer active:scale-98 transition"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${soundEnabled ? 'bg-[#D4AF37]/20 text-[#F5D77F]' : 'bg-white/5 text-zinc-500'}`}>
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#EDE8D0]">Audio Chimes</div>
                    <div className="text-[10px] text-[#9E9689]">{soundEnabled ? 'Enabled' : 'Muted'}</div>
                  </div>
                </div>
                <div className={`w-8 h-4 rounded-full transition-colors relative flex items-center px-0.5 ${soundEnabled ? 'bg-[#D4AF37]' : 'bg-[#2A241C]'}`}>
                  <div className={`w-3 h-3 rounded-full bg-[#090807] transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              {/* Theme Toggle */}
              <div
                onClick={onToggleTheme}
                className="p-3 rounded-2xl bg-[#100E0A] border border-white/10 hover:border-white/20 flex items-center justify-between cursor-pointer active:scale-98 transition"
              >
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${theme === 'dark' ? 'bg-[#D4AF37]/20 text-[#F5D77F]' : 'bg-amber-500/20 text-amber-400'}`}>
                    {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#EDE8D0]">Aura Mode</div>
                    <div className="text-[10px] text-[#9E9689]">{theme === 'dark' ? 'Midnight' : 'Daylight'}</div>
                  </div>
                </div>
                <div className="text-[10px] font-mono font-bold text-[#F5D77F]">
                  {theme.toUpperCase()}
                </div>
              </div>
            </div>

            {/* 4. HALL OF ACHIEVEMENTS SHORTCUT */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Hall of Achievements
                </span>
                <span className="text-[10px] font-mono text-[#F5D77F]">
                  {unlockedIds.size}/{allBadges.length} Unlocked
                </span>
              </div>

              <div
                onClick={() => {
                  onClose();
                  onOpenAchievements();
                }}
                className="p-3 rounded-2xl bg-[#100E0A] border border-[#D4AF37]/30 hover:border-[#D4AF37]/60 flex items-center justify-between cursor-pointer group active:scale-[0.99] transition shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {allBadges.map(b => (
                      <div
                        key={b.id}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                          unlockedIds.has(b.id)
                            ? 'bg-[#2A2213] border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.4)]'
                            : 'bg-[#15130E] border-white/10 opacity-50'
                        }`}
                      >
                        {unlockedIds.has(b.id) ? renderBadgeMini(b.iconName, true) : <Lock className="w-3 h-3 text-[#655E52]" />}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#EDE8D0] group-hover:text-[#F5D77F] transition">
                      View Prestige Badges
                    </div>
                    <div className="text-[10px] text-[#9E9689]">
                      {nextBadge ? `${daysRemaining}d to ${nextBadge.title}` : 'All Badges Unlocked'}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#F5D77F] group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* 5. DATA VAULT & OFFLINE STORAGE */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                  Data Vault & Backups
                </span>
                <span className="text-[10px] font-mono text-[#9E9689]">
                  {totalHabits} Habits • {totalGoals} Goals
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#100E0A] border border-[#D4AF37]/30 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#A8A193]">Last Offline Backup:</span>
                  <span className="font-mono text-[#F5D77F]">
                    {lastExport === 0
                      ? 'Never exported'
                      : hoursSinceExport < 1
                      ? 'Just now'
                      : `${Math.floor(hoursSinceExport)} hours ago`}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenExport();
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON Backup</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenExport();
                    }}
                    className="py-2 px-3 rounded-xl bg-[#1A1712] border border-[#D4AF37]/30 text-[#F5D77F] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#D4AF37]/10 active:scale-95 transition"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 6. APP INSTALLATION & PWA */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="text-xs font-display font-bold uppercase tracking-wider text-[#F5D77F] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
                Application Info & Offline Access
              </span>

              <div className="p-3 rounded-2xl bg-[#100E0A] border border-white/10 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-[#EDE8D0]">APEX Life OS</div>
                  <div className="text-[10px] text-[#9E9689]">Version 2.4 • Client-side Encrypted Storage</div>
                </div>
                {!isInstalled && isInstallable ? (
                  <button
                    onClick={install}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#090807] font-bold text-xs flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Install PWA</span>
                  </button>
                ) : isIOS ? (
                  <button
                    onClick={() => setShowIOSGuide(true)}
                    className="px-2.5 py-1 rounded-lg border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-medium"
                  >
                    iOS Guide
                  </button>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Offline Ready
                  </span>
                )}
              </div>
            </div>

            {/* iOS Guide Popup */}
            {showIOSGuide && (
              <div className="p-3 rounded-2xl bg-[#1D170C] border border-[#D4AF37]/40 text-xs space-y-2">
                <div className="flex items-center justify-between text-[#F5D77F] font-bold">
                  <span>How to Install on iPhone:</span>
                  <button onClick={() => setShowIOSGuide(false)} className="text-[#9E9689]">✕</button>
                </div>
                <p className="text-[11px] text-[#C5BEAF] leading-relaxed">
                  1. Tap <strong>Share</strong> in Safari (square with up arrow).<br />
                  2. Select <strong>Add to Home Screen</strong>.<br />
                  3. Enjoy full-screen offline access with zero browser bars!
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#110F0C] border-t border-[#D4AF37]/20 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl text-[#090807] font-bold text-xs shadow-md active:scale-98 transition-all duration-200"
              style={{
                background: activePalette.gradientAccent,
                color: activePalette.btnTextHex,
              }}
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
