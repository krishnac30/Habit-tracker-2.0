import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  CircleDot,
  Plus,
  Clock,
  Check,
  X,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import { AppState, CalendarEvent, Goal, Habit } from '../types';
import { calculateDaysBetween, calculateGoalProgress, formatDateDisplay, getTodayString } from '../utils/storage';
import { IconRenderer } from './IconRenderer';

interface CalendarViewProps {
  state: AppState;
  onToggleHabitOnDate: (habitId: string, dateStr: string) => void;
  onAddEvent: (title: string, date: string, time?: string) => void;
  isAddEventModalOpen: boolean;
  onCloseAddEventModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  state,
  onToggleHabitOnDate,
  onAddEvent,
  isAddEventModalOpen,
  onCloseAddEventModal,
}) => {
  const todayStr = getTodayString();
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Current month reference for navigation
  const [currentYear, setCurrentYear] = useState<number>(() => Number(todayStr.split('-')[0]));
  const [currentMonth, setCurrentMonth] = useState<number>(() => Number(todayStr.split('-')[1]) - 1);

  // New Event Form State
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(todayStr);
  const [eventTime, setEventTime] = useState('');

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Week navigation
  const shiftWeek = (direction: -1 | 1) => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + direction * 7);
    const newStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setSelectedDate(newStr);
    setCurrentYear(date.getFullYear());
    setCurrentMonth(date.getMonth());
  };

  // Check if a goal is active on a given date (Key Behaviour: From Start Date until marked done)
  const isGoalActiveOnDate = (goal: Goal, dateStr: string): boolean => {
    if (dateStr < goal.startDate) return false;
    if (goal.isDone && goal.doneDate && dateStr > goal.doneDate) return false;
    return true;
  };

  // Day stats helper for color-coding cells
  const getDayStatus = (dateStr: string) => {
    const totalHabits = state.habits.length;
    const completedHabits = state.habits.filter(h => h.completedDates.includes(dateStr)).length;
    const isPast = dateStr < todayStr;
    const isToday = dateStr === todayStr;

    let bgTint = '';
    if (totalHabits > 0) {
      if (completedHabits === totalHabits) {
        bgTint = 'bg-emerald-500/15 border-emerald-500/30';
      } else if (completedHabits > 0) {
        bgTint = 'bg-amber-500/15 border-amber-500/30';
      } else if (isPast) {
        bgTint = 'bg-rose-500/10 border-rose-500/20';
      }
    }

    const hasHabitDone = completedHabits > 0;
    const hasGoalActive = state.goals.some(g => isGoalActiveOnDate(g, dateStr));
    const hasEvent = state.calendarEvents.some(e => e.date === dateStr);

    return {
      bgTint,
      completedHabits,
      totalHabits,
      hasHabitDone,
      hasGoalActive,
      hasEvent,
      isToday
    };
  };

  // Generate calendar days for monthly view
  const getMonthDays = () => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const days: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

    // Leading days from prev month
    const prevMonthDays = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const pMonth = currentMonth === 0 ? 12 : currentMonth;
      const pYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dayNum = prevMonthDays - i;
      const dateStr = `${pYear}-${String(pMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      days.push({ dateStr, dayNum, isCurrentMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: true });
    }

    // Trailing days to fill 35 or 42 grid
    const remaining = 35 - days.length > 0 ? 35 - days.length : 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nMonth = currentMonth === 11 ? 1 : currentMonth + 2;
      const nYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nYear}-${String(nMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ dateStr, dayNum: d, isCurrentMonth: false });
    }

    return days;
  };

  // Generate 7 days for current weekly view based on selectedDate
  const getWeekDays = () => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    const target = new Date(y, m - 1, d);
    const dayOfWeek = target.getDay(); // 0 is Sunday
    const startOfWeek = new Date(target);
    startOfWeek.setDate(target.getDate() - dayOfWeek);

    const weekDays: { dateStr: string; dayName: string; dayNum: number }[] = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      const dateStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      weekDays.push({
        dateStr,
        dayName: dayNames[i],
        dayNum: current.getDate()
      });
    }

    return weekDays;
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;
    onAddEvent(eventTitle.trim(), eventDate, eventTime.trim() || undefined);
    setEventTitle('');
    setEventTime('');
    onCloseAddEventModal();
  };

  // Information for selected day in detail panel
  const selectedDayHabitsDone = state.habits.filter(h => h.completedDates.includes(selectedDate));
  const selectedDayHabitsPending = state.habits.filter(h => !h.completedDates.includes(selectedDate));
  const selectedDayGoals = state.goals.filter(g => isGoalActiveOnDate(g, selectedDate));
  const selectedDayEvents = state.calendarEvents.filter(e => e.date === selectedDate);
  const isSelectedPast = selectedDate < todayStr;
  const isSelectedToday = selectedDate === todayStr;

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-4 pb-28">
      {/* Top Controls: View Toggle + Month/Week Navigator */}
      <div className="flex items-center justify-between gap-3 px-1">
        {/* Toggle between Monthly and Weekly view */}
        <div className="p-1 rounded-xl bg-[#14120E] border border-[#D4AF37]/25 flex items-center gap-1">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'month'
                ? 'bg-[#D4AF37] text-[#090807] shadow-sm'
                : 'text-[#9E9689] hover:text-[#EDE8D0]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              viewMode === 'week'
                ? 'bg-[#D4AF37] text-[#090807] shadow-sm'
                : 'text-[#9E9689] hover:text-[#EDE8D0]'
            }`}
          >
            Weekly
          </button>
        </div>

        {/* Date Navigator */}
        <div className="flex items-center gap-2">
          <button
            onClick={viewMode === 'month' ? prevMonth : () => shiftWeek(-1)}
            aria-label="Previous period"
            className="p-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D1C9BA] hover:bg-[#D4AF37]/10 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-display font-bold text-xs text-[#F5D77F] tracking-wide min-w-[110px] text-center">
            {monthName} {currentYear}
          </span>
          <button
            onClick={viewMode === 'month' ? nextMonth : () => shiftWeek(1)}
            aria-label="Next period"
            className="p-1.5 rounded-lg border border-[#D4AF37]/30 text-[#D1C9BA] hover:bg-[#D4AF37]/10 transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MONTHLY VIEW */}
      {viewMode === 'month' && (
        <div className="p-3.5 rounded-3xl bg-[#14120E] border border-[#D4AF37]/30 shadow-md">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-[#8A8275] uppercase tracking-wider mb-2">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
            {getMonthDays().map(({ dateStr, dayNum, isCurrentMonth }) => {
              const { bgTint, hasHabitDone, hasGoalActive, hasEvent, isToday } = getDayStatus(dateStr);
              const isSelected = selectedDate === dateStr;

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`min-h-[46px] p-1 rounded-xl flex flex-col items-center justify-between border transition-all text-center relative ${
                    isCurrentMonth ? 'text-[#EDE8D0]' : 'text-[#4A4439]'
                  } ${bgTint || 'bg-[#181510] border-white/5'} ${
                    isToday ? 'ring-1 ring-[#D4AF37] ring-offset-1 ring-offset-[#14120E]' : ''
                  } ${
                    isSelected ? 'border-[#F5D77F] bg-[#2A2315] shadow-[0_0_10px_rgba(212,175,55,0.4)]' : ''
                  }`}
                >
                  <span className={`text-xs ${isSelected ? 'font-black text-[#F5D77F]' : 'font-medium'}`}>
                    {dayNum}
                  </span>

                  {/* Dot indicators: Green (habit done), Cyan (goal active), Gold (event) */}
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {hasHabitDone && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_3px_#34D399]" />
                    )}
                    {hasGoalActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_3px_#22D3EE]" />
                    )}
                    {hasEvent && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_3px_#D4AF37]" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-3 pt-3 mt-3 border-t border-white/5 text-[10px] text-[#9E9689]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Habits Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> Active Goal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37]" /> Event
            </span>
          </div>
        </div>
      )}

      {/* WEEKLY VIEW */}
      {viewMode === 'week' && (
        <div className="p-3.5 rounded-3xl bg-[#14120E] border border-[#D4AF37]/30 shadow-md">
          <div className="grid grid-cols-7 gap-1.5">
            {getWeekDays().map(({ dateStr, dayName, dayNum }) => {
              const { bgTint, isToday } = getDayStatus(dateStr);
              const isSelected = selectedDate === dateStr;
              const completedHabits = state.habits.filter(h => h.completedDates.includes(dateStr));
              const activeGoals = state.goals.filter(g => isGoalActiveOnDate(g, dateStr));
              const events = state.calendarEvents.filter(e => e.date === dateStr);

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`p-1.5 rounded-2xl border flex flex-col min-h-[140px] cursor-pointer transition ${bgTint || 'bg-[#181510] border-white/5'} ${
                    isToday ? 'ring-1 ring-[#D4AF37]' : ''
                  } ${isSelected ? 'border-[#F5D77F] bg-[#2A2315]' : ''}`}
                >
                  <div className="text-center pb-1 border-b border-white/10 mb-1">
                    <span className="text-[10px] font-semibold text-[#8A8275] uppercase block">{dayName}</span>
                    <span className={`text-xs ${isSelected ? 'font-bold text-[#F5D77F]' : 'text-[#EDE8D0]'}`}>{dayNum}</span>
                  </div>

                  {/* Coloured event bars */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {/* Green rows: completed habits */}
                    {completedHabits.slice(0, 2).map(h => (
                      <div
                        key={h.id}
                        className="px-1 py-0.5 rounded bg-emerald-500/25 text-emerald-300 text-[8px] font-semibold truncate"
                      >
                        ✓ {h.name}
                      </div>
                    ))}

                    {/* Cyan rows: active goals */}
                    {activeGoals.slice(0, 2).map(g => (
                      <div
                        key={g.id}
                        className="px-1 py-0.5 rounded bg-cyan-500/25 text-cyan-300 text-[8px] font-semibold truncate"
                      >
                        ◯ {g.name}
                      </div>
                    ))}

                    {/* Gold rows: calendar events */}
                    {events.slice(0, 1).map(e => (
                      <div
                        key={e.id}
                        className="px-1 py-0.5 rounded bg-[#D4AF37]/25 text-[#F5D77F] text-[8px] font-semibold truncate"
                      >
                        ★ {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAY DETAIL PANEL (Tap any day to select it) */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#14120E] border border-[#D4AF37]/35 space-y-4 shadow-lg">
        {/* Day Header with Progress Summary */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="font-display text-base font-bold text-[#F5D77F] flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
              {formatDateDisplay(selectedDate)}
              {isSelectedToday && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5D77F] font-bold">
                  Today
                </span>
              )}
            </h3>
            <p className="text-xs text-[#9E9689] font-mono mt-0.5">
              Habits Completed: {selectedDayHabitsDone.length} / {state.habits.length}
            </p>
          </div>

          {/* Mini progress bar */}
          <div className="w-24 text-right">
            <div className="w-full h-1.5 rounded-full bg-[#201D17] overflow-hidden mb-1">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{
                  width: `${state.habits.length > 0 ? (selectedDayHabitsDone.length / state.habits.length) * 100 : 0}%`
                }}
              />
            </div>
            <span className="text-[10px] text-[#8A8275] font-mono">
              {state.habits.length > 0 ? Math.round((selectedDayHabitsDone.length / state.habits.length) * 100) : 0}% Done
            </span>
          </div>
        </div>

        {/* Habits Section (Tap any habit row to toggle directly from calendar!) */}
        <div className="space-y-2">
          <h4 className="text-xs font-display font-bold text-[#D4AF37] uppercase tracking-wider">
            Habits for This Day
          </h4>

          {state.habits.length === 0 ? (
            <p className="text-xs text-[#8A8275]">No habits configured.</p>
          ) : (
            <div className="space-y-1.5">
              {/* Done Habits */}
              {selectedDayHabitsDone.map(habit => (
                <div
                  key={habit.id}
                  onClick={() => onToggleHabitOnDate(habit.id, selectedDate)}
                  className="p-2.5 rounded-xl bg-[#1C1811] border border-emerald-500/30 flex items-center justify-between gap-3 cursor-pointer hover:bg-[#241F16] transition"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${habit.color}25`, color: habit.color }}
                    >
                      <IconRenderer name={habit.icon} size={15} />
                    </div>
                    <span className="text-xs font-semibold text-[#EDE8D0] line-through text-[#8A8275]">
                      {habit.name}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                    Done
                  </span>
                </div>
              ))}

              {/* Pending / Missed Habits */}
              {selectedDayHabitsPending.map(habit => (
                <div
                  key={habit.id}
                  onClick={() => onToggleHabitOnDate(habit.id, selectedDate)}
                  className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                    isSelectedPast
                      ? 'bg-[#181510] border-rose-500/20 opacity-70 hover:opacity-100'
                      : 'bg-[#181510] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${habit.color}15`, color: habit.color }}
                    >
                      <IconRenderer name={habit.icon} size={15} />
                    </div>
                    <span className="text-xs font-medium text-[#EDE8D0]">
                      {habit.name}
                    </span>
                  </div>
                  {isSelectedPast ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
                      Missed
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-semibold">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goals Section (Active on this day) */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <h4 className="text-xs font-display font-bold text-[#D4AF37] uppercase tracking-wider">
            Active Objectives on Date ({selectedDayGoals.length})
          </h4>

          {selectedDayGoals.length === 0 ? (
            <p className="text-xs text-[#8A8275]">No major goals active on this date.</p>
          ) : (
            <div className="space-y-1.5">
              {selectedDayGoals.map(goal => {
                const progress = calculateGoalProgress(goal);
                let badgeColor = 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300';
                let badgeText = 'Active';

                if (goal.isDone) {
                  badgeColor = 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300';
                  badgeText = 'Done';
                } else if (goal.targetDate && selectedDate > goal.targetDate) {
                  badgeColor = 'bg-rose-500/20 border-rose-500/40 text-rose-300';
                  badgeText = 'Overdue';
                }

                return (
                  <div
                    key={goal.id}
                    className="p-2.5 rounded-xl bg-[#1C1811] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <h5 className="font-serif-luxury text-sm font-bold text-[#F5D77F] truncate">
                        {goal.name}
                      </h5>
                      <p className="text-[10px] text-[#8A8275] font-mono">
                        Progression: {progress}%
                      </p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${badgeColor}`}>
                      {badgeText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Events Section */}
        <div className="space-y-2 pt-2 border-t border-white/5">
          <h4 className="text-xs font-display font-bold text-[#D4AF37] uppercase tracking-wider">
            Calendar Events ({selectedDayEvents.length})
          </h4>

          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-[#8A8275]">No scheduled events for this date.</p>
          ) : (
            <div className="space-y-1.5">
              {selectedDayEvents.map(event => (
                <div
                  key={event.id}
                  className="p-2.5 rounded-xl bg-[#221D13] border border-[#D4AF37]/30 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-[#EDE8D0]">
                    {event.title}
                  </span>
                  <span className="text-[10px] text-[#F5D77F] font-mono px-2 py-0.5 rounded bg-black/40">
                    {event.time || 'All day'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mindset & Mood Reflection for this date */}
        {(() => {
          const dayMood = state.moodEntries.find(m => m.date === selectedDate);
          return (
            <div className="space-y-2 pt-2 border-t border-white/5">
              <h4 className="text-xs font-display font-bold text-[#D4AF37] uppercase tracking-wider flex items-center justify-between">
                <span>Mindset & State of Mind</span>
                {dayMood && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[#D4AF37]/15 text-[#F5D77F] font-mono">
                    Logged
                  </span>
                )}
              </h4>

              {dayMood ? (
                <div className="p-3 rounded-xl bg-[#1C1811] border border-[#D4AF37]/35 flex items-start gap-3">
                  <span className="text-2xl shrink-0">{dayMood.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-[#F5D77F]">
                      {dayMood.label}
                    </div>
                    {dayMood.note ? (
                      <p className="text-[11px] text-[#C5BEAF] mt-0.5 italic leading-relaxed">
                        "{dayMood.note}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#8A8275] mt-0.5">
                        No written notes attached.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-[#8A8275]">
                  No mindset pulse logged on this date.
                </p>
              )}
            </div>
          );
        })()}
      </div>

      {/* Add Event Modal Sheet */}
      {isAddEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
              <h3 className="font-display text-lg font-bold text-[#F5D77F] flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#D4AF37]" />
                Schedule Calendar Event
              </h3>
              <button
                onClick={onCloseAddEventModal}
                className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEventSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Event Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Executive Strategy Review"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Time (Optional, e.g. 14:00 or All day)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 10:30 AM or All day"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-lg active:scale-98 transition flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Schedule Event
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
