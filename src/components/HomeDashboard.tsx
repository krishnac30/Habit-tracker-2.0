import React from 'react';
import {
  Flame,
  CheckCircle2,
  CircleDot,
  ArrowRight,
  Check,
  Clock,
  Smile,
  Plus,
  Sparkles
} from 'lucide-react';
import { AppState, MOOD_OPTIONS, MoodType } from '../types';
import { calculateDaysBetween, calculateGoalProgress, formatDateDisplay, getTodayString } from '../utils/storage';
import { IconRenderer } from './IconRenderer';

interface HomeDashboardProps {
  state: AppState;
  onToggleHabit: (habitId: string) => void;
  onNavigateTab: (tab: 'habits' | 'goals' | 'calendar' | 'mood' | 'journal') => void;
  onOpenExport?: () => void;
  onOpenAchievements?: () => void;
  onOpenPalettes?: () => void;
  onOpenSettings?: () => void;
  onSaveMood?: (mood: MoodType, emoji: string, label: string, note?: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  state,
  onToggleHabit,
  onNavigateTab,
  onOpenAchievements,
  onSaveMood,
}) => {
  const todayStr = getTodayString();

  // 1. Stats row calculations
  const totalHabits = state.habits.length;
  const habitsDoneToday = state.habits.filter(h => h.completedDates.includes(todayStr)).length;
  const activeGoals = state.goals.filter(g => !g.isDone);

  // 2. Active Goals (up to 4)
  const displayGoals = activeGoals.slice(0, 4);

  // 3. Today's habits (up to 5)
  const displayHabits = state.habits.slice(0, 5);

  // 4. Today's mood
  const todayMood = state.moodEntries.find(m => m.date === todayStr);

  return (
    <div className="space-y-4 pb-28">
      {/* Executive Date & Daily Briefing Title */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display text-lg font-bold tracking-wide text-[#F5D77F] leading-tight">
            Today's Briefing
          </h2>
          <p className="text-xs text-[#9E9689]">
            {formatDateDisplay(todayStr)} • Focus & Daily Execution
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#14120E] border border-[#D4AF37]/30 text-xs font-mono text-[#F5D77F]">
          <Sparkles className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>{habitsDoneToday}/{totalHabits} Done</span>
        </div>
      </div>

      {/* Stats Row (Streak, Habits Today, Goals) */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Streak */}
        <div
          onClick={onOpenAchievements}
          className="p-3 rounded-2xl bg-[#14120E] border border-[#D4AF37]/25 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer hover:border-[#D4AF37]/50 active:scale-98 transition group"
        >
          <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-1 text-[#F59E0B] group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4 fill-[#F59E0B]" />
          </div>
          <span className="font-display font-black text-xl text-[#F5D77F] leading-tight">
            {state.stats.streak}
          </span>
          <span className="text-[10px] text-[#9E9689] uppercase tracking-wider font-semibold">
            Day Streak
          </span>
        </div>

        {/* Habits Today */}
        <div
          onClick={() => onNavigateTab('habits')}
          className="p-3 rounded-2xl bg-[#14120E] border border-[#D4AF37]/20 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer active:scale-98 transition hover:border-emerald-500/40"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-1 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="font-display font-black text-xl text-emerald-400 leading-tight">
            {habitsDoneToday} <span className="text-xs text-[#9E9689] font-normal">/ {totalHabits}</span>
          </span>
          <span className="text-[10px] text-[#9E9689] uppercase tracking-wider font-semibold">
            Habits Today
          </span>
        </div>

        {/* Active Goals */}
        <div
          onClick={() => onNavigateTab('goals')}
          className="p-3 rounded-2xl bg-[#14120E] border border-[#D4AF37]/20 flex flex-col items-center justify-center text-center shadow-sm cursor-pointer active:scale-98 transition hover:border-cyan-500/40"
        >
          <div className="w-7 h-7 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-1 text-cyan-400">
            <CircleDot className="w-4 h-4" />
          </div>
          <span className="font-display font-black text-xl text-cyan-400 leading-tight">
            {activeGoals.length}
          </span>
          <span className="text-[10px] text-[#9E9689] uppercase tracking-wider font-semibold">
            Active Goals
          </span>
        </div>
      </div>

      {/* Daily Emotional State & Mindset Pulse (1-Tap Check-in) */}
      <div className="p-3.5 rounded-2xl bg-[#14120E] border border-[#D4AF37]/25 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-display font-bold text-[#F5D77F] uppercase tracking-wider flex items-center gap-1.5">
            <Smile className="w-3.5 h-3.5 text-[#D4AF37]" />
            Mindset Pulse
          </span>
          {todayMood ? (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium flex items-center gap-1">
              <span>{todayMood.emoji}</span>
              <span>{todayMood.label}</span>
            </span>
          ) : (
            <span className="text-[10px] text-[#9E9689] font-medium">
              1-Tap Daily Check-in (+15 XP)
            </span>
          )}
        </div>

        <div className="grid grid-cols-5 gap-1.5">
          {MOOD_OPTIONS.map(opt => {
            const isSelected = todayMood?.mood === opt.type;
            return (
              <button
                key={opt.type}
                onClick={() => onSaveMood && onSaveMood(opt.type, opt.emoji, opt.label)}
                className={`py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#2A2315] border-2 border-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-[#181510] border border-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-xl mb-0.5">{opt.emoji}</span>
                <span className={`text-[9px] truncate font-medium ${isSelected ? 'text-[#F5D77F] font-bold' : 'text-[#8A8275]'}`}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Today's Habits (Up to 5 quick-toggle rows) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display text-sm font-bold tracking-wider text-[#F5D77F] uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
            Today's Habits
          </h3>
          <button
            onClick={() => onNavigateTab('habits')}
            className="text-xs text-[#9E9689] hover:text-[#F5D77F] flex items-center gap-1 transition"
          >
            Manage Habits ({state.habits.length})
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {displayHabits.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#14120E] border border-dashed border-[#D4AF37]/30 text-center">
            <p className="text-xs text-[#9E9689] mb-2">No habits created yet.</p>
            <button
              onClick={() => onNavigateTab('habits')}
              className="px-3 py-1 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-semibold"
            >
              + Create First Habit
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {displayHabits.map(habit => {
              const isDone = habit.completedDates.includes(todayStr);

              return (
                <div
                  key={habit.id}
                  onClick={() => onToggleHabit(habit.id)}
                  className={`p-3 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer select-none active:scale-[0.99] ${
                    isDone
                      ? 'bg-gradient-to-r from-[#262012] to-[#1A160D] border-[#D4AF37]/60 shadow-[0_4px_12px_rgba(212,175,55,0.15)]'
                      : 'bg-[#14120E] border-white/5 hover:border-[#D4AF37]/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${habit.color}18`,
                        borderColor: `${habit.color}40`,
                        color: habit.color
                      }}
                    >
                      <IconRenderer name={habit.icon} size={18} />
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-medium transition-all ${
                          isDone
                            ? 'line-through text-[#9E9689] italic'
                            : 'text-[#EDE8D0]'
                        }`}
                      >
                        {habit.name}
                      </h4>
                      <p className="text-[10px] text-[#9E9689]">
                        {isDone ? 'Completed today (+25 XP)' : 'Tap to complete'}
                      </p>
                    </div>
                  </div>

                  {/* Toggle Check Circle */}
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                      isDone
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#090807] shadow-[0_0_10px_rgba(212,175,55,0.6)]'
                        : 'border-[#4A4439] bg-transparent hover:border-[#D4AF37]'
                    }`}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Objectives Summary (Up to 4 current active goals) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-display text-sm font-bold tracking-wider text-[#F5D77F] uppercase flex items-center gap-1.5">
            <CircleDot className="w-4 h-4 text-[#D4AF37]" />
            Priority Objectives
          </h3>
          <button
            onClick={() => onNavigateTab('goals')}
            className="text-xs text-[#9E9689] hover:text-[#F5D77F] flex items-center gap-1 transition"
          >
            All Objectives ({activeGoals.length})
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {displayGoals.length === 0 ? (
          <div className="p-5 rounded-2xl bg-[#14120E] border border-dashed border-[#D4AF37]/30 text-center">
            <p className="text-xs text-[#9E9689] mb-2">No active objectives running.</p>
            <button
              onClick={() => onNavigateTab('goals')}
              className="px-3 py-1 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] text-xs font-semibold"
            >
              + Launch an Objective
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {displayGoals.map(goal => {
              const progress = calculateGoalProgress(goal);
              const daysIn = Math.max(0, calculateDaysBetween(goal.startDate, todayStr));

              let urgencyColor = 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
              let urgencyLabel = 'On Track';

              if (goal.targetDate) {
                const daysLeft = calculateDaysBetween(todayStr, goal.targetDate);
                if (daysLeft < 0) {
                  urgencyColor = 'text-rose-400 bg-rose-400/10 border-rose-400/30';
                  urgencyLabel = `${Math.abs(daysLeft)}d Overdue`;
                } else if (daysLeft <= 3) {
                  urgencyColor = 'text-amber-400 bg-amber-400/10 border-amber-400/30';
                  urgencyLabel = `${daysLeft}d Left`;
                } else {
                  urgencyLabel = `${daysLeft}d Left`;
                }
              }

              return (
                <div
                  key={goal.id}
                  onClick={() => onNavigateTab('goals')}
                  className="p-3.5 rounded-2xl bg-[#14120E] border border-white/5 hover:border-[#D4AF37]/40 transition shadow-sm cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-serif-luxury text-base font-bold text-[#F3E5AB] leading-snug group-hover:text-[#F5D77F] transition">
                      {goal.name}
                    </h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold shrink-0 uppercase tracking-wider ${urgencyColor}`}>
                      {urgencyLabel}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 rounded-full bg-[#201D17] overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#9E9689]">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#D4AF37]" />
                        {daysIn} days in
                      </span>
                      <span>•</span>
                      <span>
                        {goal.subtasks.filter(s => s.isDone).length}/{goal.subtasks.length} tasks
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[#F5D77F]">
                      {progress}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
