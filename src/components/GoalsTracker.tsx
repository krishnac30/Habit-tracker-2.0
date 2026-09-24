import React, { useState, useRef, useEffect } from 'react';
import {
  GripVertical,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Link2,
  Edit2,
  RotateCcw,
  Check,
  Plus,
  X,
  Sparkles,
  Trophy,
  ListTodo,
  Layers,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { Goal, Habit } from '../types';
import {
  calculateDaysBetween,
  calculateGoalProgress,
  calculateHabitConsistency,
  formatDateDisplay,
  getTodayString
} from '../utils/storage';
import { IconRenderer } from './IconRenderer';

interface GoalsTrackerProps {
  goals: Goal[];
  habits: Habit[];
  onToggleGoalComplete: (goalId: string) => void;
  onOpenSubtasksModal: (goal: Goal) => void;
  onOpenNoteModal: (goal: Goal) => void;
  onOpenLinkedHabitsModal: (goal: Goal) => void;
  onAddGoal: (name: string, startDate: string, targetDate?: string) => void;
  onEditGoal: (goalId: string, name: string, startDate: string, targetDate?: string) => void;
  onReorderGoals: (reordered: Goal[]) => void;
  onToggleHabit: (habitId: string) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
}

export const GoalsTracker: React.FC<GoalsTrackerProps> = ({
  goals,
  habits,
  onToggleGoalComplete,
  onOpenSubtasksModal,
  onOpenNoteModal,
  onOpenLinkedHabitsModal,
  onAddGoal,
  onEditGoal,
  onReorderGoals,
  onToggleHabit,
  isAddModalOpen,
  onCloseAddModal,
}) => {
  const todayStr = getTodayString();

  // View mode: 'cards' (Swipe deck, default) or 'list'
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  // Filter mode: 'active' | 'completed' | 'all'
  const [filterMode, setFilterMode] = useState<'active' | 'completed' | 'all'>('active');

  // Active card index for card swiping UI
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  // Session state for expanded notes panels per goal
  const [expandedNotesGoals, setExpandedNotesGoals] = useState<Record<string, boolean>>({});

  // Add / Edit Goal form state
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [goalName, setGoalName] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [targetDate, setTargetDate] = useState('');

  // Drag-and-drop state for active goals in list view
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Touch swipe detection
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const minSwipeDistance = 45;

  const activeGoals = goals.filter(g => !g.isDone);
  const completedGoals = goals.filter(g => g.isDone);

  // Filtered goals list based on current filter
  const displayedGoals =
    filterMode === 'active'
      ? activeGoals
      : filterMode === 'completed'
      ? completedGoals
      : goals;

  // Auto-clamp activeCardIndex if list length changes
  useEffect(() => {
    if (activeCardIndex >= displayedGoals.length && displayedGoals.length > 0) {
      setActiveCardIndex(displayedGoals.length - 1);
    }
  }, [displayedGoals.length, activeCardIndex]);

  const handlePrevGoal = () => {
    if (activeCardIndex > 0) {
      setSlideDirection('right');
      setActiveCardIndex(prev => prev - 1);
      setTimeout(() => setSlideDirection(null), 300);
    }
  };

  const handleNextGoal = () => {
    if (activeCardIndex < displayedGoals.length - 1) {
      setSlideDirection('left');
      setActiveCardIndex(prev => prev + 1);
      setTimeout(() => setSlideDirection(null), 300);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.stopPropagation();
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNextGoal();
    } else if (isRightSwipe) {
      handlePrevGoal();
    }
  };

  const toggleNotesPanel = (goalId: string) => {
    setExpandedNotesGoals(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  const handleStartEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setGoalName(goal.name);
    setStartDate(goal.startDate);
    setTargetDate(goal.targetDate || '');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalName.trim() || !startDate) return;

    if (editingGoal) {
      onEditGoal(editingGoal.id, goalName.trim(), startDate, targetDate || undefined);
      setEditingGoal(null);
    } else {
      onAddGoal(goalName.trim(), startDate, targetDate || undefined);
      onCloseAddModal();
    }

    setGoalName('');
    setStartDate(todayStr);
    setTargetDate('');
  };

  // Drag reordering on active goals in list view
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedActive = [...activeGoals];
    const [moved] = updatedActive.splice(draggedIndex, 1);
    updatedActive.splice(targetIndex, 0, moved);
    setDraggedIndex(targetIndex);

    onReorderGoals([...updatedActive, ...completedGoals]);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Helper to render an individual goal card (used both in Swipe mode and List mode)
  const renderGoalCardContent = (goal: Goal, index: number, isDraggable: boolean, isSwipeView = false) => {
    const progress = calculateGoalProgress(goal);
    const daysIn = Math.max(0, calculateDaysBetween(goal.startDate, todayStr));

    let isOverdue = false;
    let daysDiffText = '';
    if (goal.targetDate) {
      const diff = calculateDaysBetween(todayStr, goal.targetDate);
      if (diff < 0) {
        isOverdue = true;
        daysDiffText = `${Math.abs(diff)}d Overdue`;
      } else {
        daysDiffText = `${diff}d Left`;
      }
    }

    const totalSubtasks = goal.subtasks.length;
    const doneSubtasks = goal.subtasks.filter(s => s.isDone).length;

    const goalNotes = goal.notes || [];
    const subtaskNotes = goal.subtasks.filter(s => s.note && s.note.trim().length > 0);
    const totalNotesCount = goalNotes.length + subtaskNotes.length;
    const hasNotes = totalNotesCount > 0;
    const isNotesOpen = !!expandedNotesGoals[goal.id];

    const linkedHabits = habits.filter(h => goal.linkedHabitIds?.includes(h.id));
    const milestones = [25, 50, 75, 100];

    // Circular Gauge calculations for card swipe mode
    const radius = 32;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div
        key={goal.id}
        draggable={isDraggable}
        onDragStart={() => isDraggable && handleDragStart(index)}
        onDragOver={(e) => isDraggable && handleDragOver(e, index)}
        onDragEnd={handleDragEnd}
        className={`p-4 sm:p-5 rounded-3xl border transition-all duration-300 relative select-none ${
          goal.isDone
            ? 'bg-[#100F0D] border-white/5 opacity-80'
            : 'bg-gradient-to-b from-[#191611] via-[#14120D] to-[#0F0D09] border-[#D4AF37]/35 shadow-[0_10px_30px_rgba(0,0,0,0.7)]'
        } ${draggedIndex === index ? 'opacity-40 scale-[0.98]' : ''}`}
      >
        {/* Top Header Row with Goal Title & Circular Progress Ring */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-start gap-2.5 flex-1 min-w-0">
            {isDraggable && !isSwipeView && (
              <div
                className="p-1 cursor-grab active:cursor-grabbing text-[#635C50] hover:text-[#D4AF37] transition mt-1 shrink-0"
                title="Drag to rearrange goal"
              >
                <GripVertical className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="font-serif-luxury text-xl sm:text-2xl font-bold tracking-tight text-[#FFF0B8] leading-tight break-words">
                {goal.name}
              </h3>

              {/* Badges and Dates Row */}
              <div className="flex items-center gap-1.5 flex-wrap mt-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded-md bg-[#1C1811] border border-white/10 text-[#C5BEAF]">
                  Started: {formatDateDisplay(goal.startDate)}
                </span>

                {goal.targetDate && (
                  <span
                    className={`px-2 py-0.5 rounded-md border font-semibold ${
                      isOverdue && !goal.isDone
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : 'bg-[#1C1811] border-white/10 text-[#C5BEAF]'
                    }`}
                  >
                    Due: {formatDateDisplay(goal.targetDate)}
                  </span>
                )}

                {goal.isDone && goal.doneDate && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-semibold">
                    Done: {formatDateDisplay(goal.doneDate)}
                  </span>
                )}

                <span className="px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/25 text-[#F5D77F]">
                  {daysIn}d In
                </span>

                {goal.targetDate && !goal.isDone && (
                  <span
                    className={`px-2 py-0.5 rounded-md border font-semibold ${
                      isOverdue
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                        : 'bg-[#D4AF37]/10 border-[#D4AF37]/25 text-[#F5D77F]'
                    }`}
                  >
                    {daysDiffText}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Luxury Circular Progress Ring (High-Craft SVG) */}
          <div className="relative flex flex-col items-center justify-center shrink-0">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke="currentColor"
                strokeWidth="5"
                className="text-[#201C14]"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                stroke={goal.isDone ? '#34D399' : '#D4AF37'}
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-xs font-bold font-mono ${goal.isDone ? 'text-emerald-400' : 'text-[#F5D77F]'}`}>
                {progress}%
              </span>
              <span className="text-[8px] text-[#8A8275] uppercase font-mono leading-none">
                {goal.isDone ? 'DONE' : 'GOAL'}
              </span>
            </div>
          </div>
        </div>

        {/* Milestone Progression Bar */}
        <div className="my-3 p-3 rounded-2xl bg-[#14120E] border border-[#D4AF37]/20">
          <div className="flex justify-between items-center text-xs font-mono mb-1.5">
            <span className="text-[#9E9689] uppercase tracking-wider font-semibold">Milestone Progression</span>
            <span className="font-bold text-[#F5D77F] text-xs">{doneSubtasks}/{totalSubtasks} Milestones</span>
          </div>

          <div className="relative w-full h-2 rounded-full bg-[#201D17] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(212,175,55,0.7)] ${
                goal.isDone
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                  : 'bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-1.5 mt-2">
            {milestones.map((m) => {
              const reached = progress >= m;
              return (
                <div
                  key={m}
                  className={`py-1 rounded-lg border text-center text-[10px] font-mono font-bold transition-all ${
                    reached
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#F5D77F] shadow-[0_0_8px_rgba(212,175,55,0.3)]'
                      : 'bg-[#181510] border-white/5 text-[#5A5346]'
                  }`}
                >
                  {m}%
                </div>
              );
            })}
          </div>
        </div>

        {/* Subtasks Section with Interactive Checklist */}
        {goal.subtasks.length > 0 ? (
          <div className="my-3 p-3 rounded-2xl bg-[#14120E] border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-display font-bold text-[#F5D77F] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <ListTodo className="w-3.5 h-3.5 text-[#D4AF37]" />
                Milestone Roadmap ({doneSubtasks}/{totalSubtasks})
              </span>
              <button
                type="button"
                onClick={() => onOpenSubtasksModal(goal)}
                className="text-[10px] text-[#D4AF37] hover:underline font-mono"
              >
                Manage
              </button>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {goal.subtasks.map((st) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-[#1C1811] border border-white/5 gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center text-[9px] font-bold ${
                        st.isDone ? 'bg-emerald-500 text-black' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {st.isDone ? '✓' : ''}
                    </span>
                    <span
                      className={`text-xs truncate ${
                        st.isDone ? 'line-through text-[#6E675B]' : 'text-[#EDE8D0]'
                      }`}
                    >
                      {st.name}
                    </span>
                  </div>
                  {st.dueDate && (
                    <span className="text-[10px] text-[#8A8275] font-mono shrink-0">
                      {st.dueDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="my-3 p-3 rounded-2xl bg-[#14120E]/60 border border-dashed border-[#D4AF37]/25 text-center">
            <p className="text-xs text-[#9E9689] mb-1.5">No subtasks created for this goal yet.</p>
            <button
              onClick={() => onOpenSubtasksModal(goal)}
              className="px-3 py-1 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#F5D77F] text-xs font-semibold hover:bg-[#D4AF37]/25 transition"
            >
              + Add First Milestone Subtask
            </button>
          </div>
        )}

        {/* Linked Habits Widget */}
        {linkedHabits.length > 0 && (
          <div className="my-3 p-3 rounded-2xl bg-[#14120E] border border-[#D4AF37]/25 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-display font-bold text-[#F5D77F] uppercase tracking-wider">
              <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              Supporting Habits ({linkedHabits.length})
            </div>

            <div className="space-y-1.5">
              {linkedHabits.map((habit) => {
                const isDoneToday = habit.completedDates.includes(todayStr);
                const { percentage } = calculateHabitConsistency(habit, todayStr);

                return (
                  <div
                    key={habit.id}
                    className="p-2 rounded-xl bg-[#1C1811] border border-white/5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${habit.color}20`, color: habit.color }}
                      >
                        <IconRenderer name={habit.icon} className="w-3 h-3" />
                      </div>
                      <span className="truncate text-[#EDE8D0] font-medium">{habit.name}</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#D4AF37]">
                      {percentage}% 30d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Notes Toggle Section */}
        {hasNotes && (
          <div className="my-3 rounded-2xl bg-[#14120E] border border-white/5 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleNotesPanel(goal.id)}
              className="w-full p-2.5 flex items-center justify-between text-left hover:bg-white/5 transition text-xs"
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="font-display font-bold text-xs text-[#F5D77F] uppercase">Notes ({totalNotesCount})</span>
              </div>
              <div className="text-[#F5D77F]">
                {isNotesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
            </button>

            {isNotesOpen && (
              <div className="p-2.5 pt-0 space-y-2 border-t border-white/5 text-xs">
                {goalNotes.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg bg-[#1C1811] border-l-2 border-[#D4AF37] text-[#EDE8D0]">
                    <div className="flex justify-between text-[10px] text-[#8A8275] mb-0.5">
                      <span>Goal Note</span>
                      <span>{n.date}</span>
                    </div>
                    {n.text}
                  </div>
                ))}
                {subtaskNotes.map((st) => (
                  <div key={st.id} className="p-2 rounded-lg bg-[#1E1726] border-l-2 border-purple-400 text-[#DDD6FE]">
                    <div className="text-[10px] text-purple-300 mb-0.5">{st.name}</div>
                    {st.note}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onOpenSubtasksModal(goal)}
              className="px-2.5 py-1.5 rounded-xl bg-[#201C14] hover:bg-[#2C271C] border border-white/10 text-[#EDE8D0] font-medium transition flex items-center gap-1"
            >
              <ListTodo className="w-3.5 h-3.5 text-[#D4AF37]" />
              Milestones
            </button>

            <button
              onClick={() => onOpenNoteModal(goal)}
              className="px-2.5 py-1.5 rounded-xl bg-[#201C14] hover:bg-[#2C271C] border border-white/10 text-[#EDE8D0] font-medium transition flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5 text-[#D4AF37]" />
              + Note
            </button>

            <button
              onClick={() => onOpenLinkedHabitsModal(goal)}
              className="px-2.5 py-1.5 rounded-xl bg-[#201C14] hover:bg-[#2C271C] border border-white/10 text-[#EDE8D0] font-medium transition flex items-center gap-1"
            >
              <Link2 className="w-3.5 h-3.5 text-[#D4AF37]" />
              Habits
            </button>

            <button
              onClick={() => handleStartEdit(goal)}
              className="p-1.5 rounded-xl bg-[#201C14] hover:bg-[#2C271C] border border-white/10 text-[#9E9689] hover:text-[#EDE8D0] transition"
              title="Edit goal"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={() => onToggleGoalComplete(goal.id)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shadow-sm flex items-center gap-1.5 ${
              goal.isDone
                ? 'bg-[#201C14] border border-[#D4AF37]/40 text-[#F5D77F] hover:bg-[#2A2417]'
                : 'bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] hover:brightness-110'
            }`}
          >
            {goal.isDone ? (
              <>
                <RotateCcw className="w-3.5 h-3.5" />
                Reopen
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Achieved
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const currentCardGoal = displayedGoals[activeCardIndex];

  return (
    <div className="space-y-4 pb-32 pt-2">
      {/* Top Header Row with View Switcher */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-[#F5D77F] flex items-center gap-2">
            <span>Objectives Cockpit</span>
          </h2>
          <p className="text-xs text-[#9E9689]">
            {viewMode === 'cards' ? 'Swipe card left or right to switch goals' : 'Manage strategic milestones & habits'}
          </p>
        </div>

        {/* View Mode Switcher: Cards Deck vs Vertical List */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#14120E] border border-[#D4AF37]/30">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'cards'
                ? 'bg-[#D4AF37] text-[#090807] shadow-sm'
                : 'text-[#8A8275] hover:text-[#EDE8D0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              viewMode === 'list'
                ? 'bg-[#D4AF37] text-[#090807] shadow-sm'
                : 'text-[#8A8275] hover:text-[#EDE8D0]'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs: Active / Completed / All */}
      <div className="flex items-center gap-2 px-1">
        <button
          onClick={() => {
            setFilterMode('active');
            setActiveCardIndex(0);
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            filterMode === 'active'
              ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F5D77F]'
              : 'bg-[#14120E] border border-white/5 text-[#8A8275] hover:text-[#EDE8D0]'
          }`}
        >
          Active ({activeGoals.length})
        </button>
        <button
          onClick={() => {
            setFilterMode('completed');
            setActiveCardIndex(0);
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            filterMode === 'completed'
              ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F5D77F]'
              : 'bg-[#14120E] border border-white/5 text-[#8A8275] hover:text-[#EDE8D0]'
          }`}
        >
          Completed ({completedGoals.length})
        </button>
        <button
          onClick={() => {
            setFilterMode('all');
            setActiveCardIndex(0);
          }}
          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
            filterMode === 'all'
              ? 'bg-[#D4AF37]/20 border border-[#D4AF37] text-[#F5D77F]'
              : 'bg-[#14120E] border border-white/5 text-[#8A8275] hover:text-[#EDE8D0]'
          }`}
        >
          All ({goals.length})
        </button>
      </div>

      {/* VIEW MODE 1: SWIPING CARD DECK */}
      {viewMode === 'cards' && (
        <div className="space-y-3">
          {displayedGoals.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#14120E] border border-dashed border-[#D4AF37]/30 text-center">
              <Trophy className="w-10 h-10 text-[#D4AF37] mx-auto mb-3 opacity-60" />
              <h3 className="font-display text-base font-bold text-[#F5D77F] mb-1">
                {filterMode === 'completed' ? 'No Completed Goals Yet' : 'No Goals Active'}
              </h3>
              <p className="text-xs text-[#9E9689] max-w-xs mx-auto mb-4">
                {filterMode === 'completed'
                  ? 'Complete milestone subtasks and check off an active goal to celebrate your achievement.'
                  : 'Tap the gold + button below to set your next major milestone target.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Card Stepper Header & Tactile Left / Right Navigation */}
              <div className="flex items-center justify-between px-2 text-xs font-mono">
                <span className="text-[#9E9689] font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  Objective {activeCardIndex + 1} of {displayedGoals.length}
                </span>

                {/* Tactile Arrow Controls */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevGoal}
                    disabled={activeCardIndex === 0}
                    aria-label="Previous goal"
                    className={`p-1.5 rounded-xl border transition ${
                      activeCardIndex > 0
                        ? 'bg-[#181510] border-[#D4AF37]/40 text-[#F5D77F] hover:bg-[#252014] active:scale-95'
                        : 'bg-[#12100C] border-white/5 text-[#5A5346] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleNextGoal}
                    disabled={activeCardIndex === displayedGoals.length - 1}
                    aria-label="Next goal"
                    className={`p-1.5 rounded-xl border transition ${
                      activeCardIndex < displayedGoals.length - 1
                        ? 'bg-[#181510] border-[#D4AF37]/40 text-[#F5D77F] hover:bg-[#252014] active:scale-95'
                        : 'bg-[#12100C] border-white/5 text-[#5A5346] opacity-40 cursor-not-allowed'
                    }`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Swipeable Container */}
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className={`transition-all duration-300 ease-out transform ${
                  slideDirection === 'left'
                    ? 'translate-x-[-12px] opacity-80'
                    : slideDirection === 'right'
                    ? 'translate-x-[12px] opacity-80'
                    : 'translate-x-0 opacity-100'
                }`}
              >
                {currentCardGoal && renderGoalCardContent(currentCardGoal, activeCardIndex, false, true)}
              </div>

              {/* Interactive Dot Navigator Strip */}
              {displayedGoals.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {displayedGoals.map((g, idx) => {
                    const isCurrent = idx === activeCardIndex;
                    return (
                      <button
                        key={g.id}
                        onClick={() => {
                          setSlideDirection(idx > activeCardIndex ? 'left' : 'right');
                          setActiveCardIndex(idx);
                          setTimeout(() => setSlideDirection(null), 300);
                        }}
                        aria-label={`Jump to goal ${idx + 1}`}
                        className={`transition-all duration-300 rounded-full ${
                          isCurrent
                            ? 'w-7 h-2 bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] shadow-[0_0_8px_rgba(212,175,55,0.7)]'
                            : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                        }`}
                      />
                    );
                  })}
                </div>
              )}

              {/* Adjacent Goal Previews */}
              {displayedGoals.length > 1 && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {activeCardIndex > 0 ? (
                    <button
                      onClick={handlePrevGoal}
                      className="p-2 rounded-xl bg-[#14120E] border border-white/5 hover:border-[#D4AF37]/30 text-left transition truncate"
                    >
                      <span className="text-[10px] text-[#8A8275] block">← PREVIOUS</span>
                      <span className="text-xs font-semibold text-[#EDE8D0] truncate block">
                        {displayedGoals[activeCardIndex - 1].name}
                      </span>
                    </button>
                  ) : (
                    <div />
                  )}

                  {activeCardIndex < displayedGoals.length - 1 && (
                    <button
                      onClick={handleNextGoal}
                      className="p-2 rounded-xl bg-[#14120E] border border-white/5 hover:border-[#D4AF37]/30 text-right transition truncate"
                    >
                      <span className="text-[10px] text-[#8A8275] block">NEXT →</span>
                      <span className="text-xs font-semibold text-[#EDE8D0] truncate block">
                        {displayedGoals[activeCardIndex + 1].name}
                      </span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: VERTICAL LIST VIEW */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {displayedGoals.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#14120E] border border-dashed border-[#D4AF37]/30 text-center">
              <Trophy className="w-10 h-10 text-[#D4AF37] mx-auto mb-3 opacity-60" />
              <h3 className="font-display text-base font-bold text-[#F5D77F] mb-1">No Goals in this view</h3>
            </div>
          ) : (
            displayedGoals.map((goal, idx) =>
              renderGoalCardContent(goal, idx, !goal.isDone, false)
            )
          )}
        </div>
      )}

      {/* Add / Edit Goal Modal */}
      {(isAddModalOpen || editingGoal) && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
              <h3 className="font-display text-lg font-bold text-[#F5D77F] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                {editingGoal ? 'Edit Goal Target' : 'Create New Goal (+20 XP)'}
              </h3>
              <button
                onClick={() => {
                  setEditingGoal(null);
                  onCloseAddModal();
                }}
                className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Goal Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Classical Architecture"
                  value={goalName}
                  onChange={(e) => setGoalName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Start / Given Date (Required)
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Target Deadline Date (Optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-lg active:scale-98 transition flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                {editingGoal ? 'Update Goal' : 'Save Goal (+20 XP)'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
