import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Sparkles, Award, Star } from 'lucide-react';
import { CelebrationData } from '../types';
import { fireLuxuryConfetti } from '../utils/confetti';
import { sounds } from '../utils/audio';

interface CelebrationModalProps {
  data: CelebrationData | null;
  onDismiss: () => void;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({ data, onDismiss }) => {
  useEffect(() => {
    if (data) {
      fireLuxuryConfetti();
      if (data.type === 'goal' || data.type === 'levelup' || data.type === 'badge') {
        sounds.playCelebration();
      } else {
        sounds.playMilestone();
      }
    }
  }, [data]);

  if (!data) return null;

  const renderIcon = () => {
    switch (data.type) {
      case 'badge':
        return <Trophy className="w-16 h-16 text-[#F5D77F] drop-shadow-[0_0_30px_rgba(212,175,55,0.8)]" />;
      case 'goal':
        return <Trophy className="w-16 h-16 text-[#F5D77F] drop-shadow-[0_0_25px_rgba(212,175,55,0.7)]" />;
      case 'levelup':
        return <Sparkles className="w-16 h-16 text-[#38BDF8] drop-shadow-[0_0_25px_rgba(56,189,248,0.7)]" />;
      case 'subtasks':
        return <Award className="w-16 h-16 text-[#34D399] drop-shadow-[0_0_25px_rgba(52,211,153,0.7)]" />;
      case 'milestone':
      default:
        return <Star className="w-16 h-16 text-[#F5D77F] drop-shadow-[0_0_25px_rgba(212,175,55,0.7)]" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-md cursor-pointer select-none"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.85, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className="relative max-w-sm w-full p-8 rounded-3xl bg-gradient-to-b from-[#1F1C16] to-[#0E0C09] border border-[#D4AF37]/40 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] text-center overflow-hidden"
        >
          {/* Subtle gold ray background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(212,175,55,0.18),transparent_70%)] pointer-events-none" />

          {/* Icon badge */}
          <motion.div
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.1, type: 'spring', damping: 15 }}
            className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#2D281F] to-[#14120D] border border-[#D4AF37]/50 flex items-center justify-center shadow-lg"
          >
            {renderIcon()}
          </motion.div>

          {data.milestonePercentage && (
            <div className="inline-block px-3 py-1 mb-3 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-semibold tracking-widest uppercase">
              {data.milestonePercentage}% Milestone
            </div>
          )}

          <h2 className="font-display text-2xl font-bold text-[#F5D77F] tracking-wide mb-2">
            {data.title}
          </h2>

          <p className="text-sm text-[#D1C9BA] leading-relaxed mb-6 font-light">
            {data.subtitle}
          </p>

          {data.xpEarned && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#FFE58F] font-bold text-sm mb-6">
              <Sparkles className="w-4 h-4 text-[#F5D77F]" />
              +{data.xpEarned} XP Awarded
            </div>
          )}

          <div className="pt-2 border-t border-[#D4AF37]/20">
            <p className="text-xs text-[#9E9689] tracking-wider uppercase">
              Tap anywhere to continue
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
