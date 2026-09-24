import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Flame, Shield, Sparkles, Award, Crown, CheckCircle, Lock, Trophy } from 'lucide-react';
import { UnlockedBadge } from '../types';
import { getStreakBadges, getNextUpcomingBadge } from '../utils/badges';
import { formatDateDisplay } from '../utils/storage';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  streak: number;
  unlockedBadges: UnlockedBadge[];
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  streak,
  unlockedBadges = [],
}) => {
  if (!isOpen) return null;

  const allBadges = getStreakBadges();
  const unlockedMap = new Map(unlockedBadges.map(b => [b.badgeId, b]));
  const { nextBadge, daysRemaining } = getNextUpcomingBadge(streak, unlockedBadges);

  const totalEarnedXP = allBadges
    .filter(b => unlockedMap.has(b.id))
    .reduce((acc, b) => acc + b.xpReward, 0);

  const renderBadgeIcon = (iconName: string, isUnlocked: boolean, color: string) => {
    const iconClass = `w-7 h-7 ${isUnlocked ? 'text-white' : 'text-[#6B6355]'}`;
    switch (iconName) {
      case 'Flame':
        return <Flame className={iconClass} style={{ color: isUnlocked ? color : undefined }} />;
      case 'Shield':
        return <Shield className={iconClass} style={{ color: isUnlocked ? color : undefined }} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} style={{ color: isUnlocked ? color : undefined }} />;
      case 'Award':
        return <Award className={iconClass} style={{ color: isUnlocked ? color : undefined }} />;
      case 'Crown':
        return <Crown className={iconClass} style={{ color: isUnlocked ? color : undefined }} />;
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
          className="w-full max-w-md max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#D4AF37]/20 flex items-center justify-between bg-[#191611]/80 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-[#F5D77F]">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display text-base font-bold text-[#F5D77F] leading-tight">
                  Hall of Achievements
                </h2>
                <p className="text-[11px] text-[#9E9689]">
                  Streak Milestones & Prestige Badges
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

          {/* Body Content */}
          <div className="p-4 overflow-y-auto space-y-4 max-h-[calc(90vh-130px)]">
            {/* Top Stat Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#2A2314] via-[#1B160C] to-[#120F08] border border-[#D4AF37]/40 shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/20 flex items-center justify-center text-[#F5D77F]">
                    <Flame className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#F5D77F]">
                      Current Habit Streak: {streak} {streak === 1 ? 'day' : 'days'}
                    </span>
                    <p className="text-[10px] text-[#C5BEAF]">
                      {unlockedBadges.length} of {allBadges.length} Badges Earned
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-wider block">
                    Bonus XP Earned
                  </span>
                  <span className="font-display font-black text-sm text-[#FFE58F]">
                    +{totalEarnedXP} XP
                  </span>
                </div>
              </div>

              {/* Next upcoming badge progress */}
              {nextBadge ? (
                <div className="pt-2 border-t border-[#D4AF37]/20 mt-2">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-[#C5BEAF]">
                      Next: <strong className="text-[#F5D77F]">{nextBadge.title}</strong> ({nextBadge.daysRequired}d)
                    </span>
                    <span className="font-mono text-[#F5D77F] font-bold">
                      {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#0D0B08] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] transition-all duration-500 shadow-[0_0_6px_rgba(212,175,55,0.8)]"
                      style={{
                        width: `${Math.min(100, Math.round((streak / nextBadge.daysRequired) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#D4AF37]/20 mt-2 text-center text-xs text-[#F5D77F] font-semibold">
                  Imperial Mastery Attained! All streak badges unlocked!
                </div>
              )}
            </div>

            {/* Badges List */}
            <div className="space-y-3">
              <h3 className="font-display text-xs font-bold text-[#D4AF37] uppercase tracking-wider px-1">
                Streak Badges
              </h3>

              {allBadges.map((badge) => {
                const unlocked = unlockedMap.get(badge.id);
                const isUnlocked = !!unlocked;
                const progressPercent = Math.min(100, Math.round((streak / badge.daysRequired) * 100));

                return (
                  <div
                    key={badge.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      isUnlocked
                        ? 'bg-gradient-to-r from-[#231C0E] to-[#15120A] border-[#D4AF37]/60 shadow-[0_4px_18px_rgba(212,175,55,0.15)]'
                        : 'bg-[#100E0A] border-white/5 opacity-80'
                    }`}
                  >
                    {/* Background sheen for unlocked */}
                    {isUnlocked && (
                      <div
                        className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                        style={{ backgroundColor: badge.badgeColor }}
                      />
                    )}

                    <div className="flex items-start gap-3.5">
                      {/* Medallion Icon */}
                      <div
                        className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 border relative transition-transform ${
                          isUnlocked
                            ? 'bg-[#1D180F] shadow-[0_0_15px_rgba(212,175,55,0.35)]'
                            : 'bg-[#181612] border-white/10'
                        }`}
                        style={{
                          borderColor: isUnlocked ? badge.badgeColor : 'rgba(255,255,255,0.1)',
                        }}
                      >
                        {renderBadgeIcon(badge.iconName, isUnlocked, badge.badgeColor)}
                        {!isUnlocked && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#201C15] border border-white/20 flex items-center justify-center text-[#9E9689]">
                            <Lock className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Badge Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <div className="flex items-center gap-1.5">
                            <h4
                              className={`font-display text-sm font-bold truncate ${
                                isUnlocked ? 'text-[#F5D77F]' : 'text-[#C5BEAF]'
                              }`}
                            >
                              {badge.title}
                            </h4>
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider font-semibold border"
                              style={{
                                color: badge.badgeColor,
                                borderColor: `${badge.badgeColor}40`,
                                backgroundColor: `${badge.badgeColor}15`,
                              }}
                            >
                              {badge.daysRequired}d Streak
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-[#F5D77F] shrink-0">
                            +{badge.xpReward} XP
                          </span>
                        </div>

                        <p className="text-xs text-[#A8A193] leading-relaxed mb-2">
                          {badge.description}
                        </p>

                        {/* Status Footer */}
                        {isUnlocked ? (
                          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Unlocked {formatDateDisplay(unlocked.unlockedAt)}</span>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between text-[10px] text-[#8A8274] font-mono mb-1">
                              <span>Progress: {streak}/{badge.daysRequired} days</span>
                              <span>{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-[#1A1712] overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${progressPercent}%`,
                                  backgroundColor: badge.badgeColor,
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 bg-[#110F0C] border-t border-[#D4AF37]/20 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm shadow-md active:scale-98 transition"
            >
              Close Hall of Achievements
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
