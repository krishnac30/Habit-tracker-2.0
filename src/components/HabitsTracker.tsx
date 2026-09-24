import React, { useState } from 'react';
import { GripVertical, Check, Plus, Trash2, Edit3, X, Sparkles, Flame, CheckCircle2 } from 'lucide-react';
import { Habit, PRESET_HABITS, AVAILABLE_ICONS, COLOR_SWATCHES } from '../types';
import { calculateHabitConsistency, getTodayString } from '../utils/storage';
import { IconRenderer } from './IconRenderer';

interface HabitsTrackerProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (name: string, icon: string, color: string) => void;
  onDeleteHabit: (id: string) => void;
  onReorderHabits: (reordered: Habit[]) => void;
  isAddModalOpen: boolean;
  onCloseAddModal: () => void;
  streak: number;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  habits,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  onReorderHabits,
  isAddModalOpen,
  onCloseAddModal,
  streak,
}) => {
  const todayStr = getTodayString();

  // New habit form state
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Footprints');
  const [selectedColor, setSelectedColor] = useState('#D4AF37');

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleApplyPreset = (preset: { name: string; icon: string; color: string }) => {
    setName(preset.name);
    setSelectedIcon(preset.icon);
    setSelectedColor(preset.color);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit(name.trim(), selectedIcon, selectedColor);
    setName('');
    onCloseAddModal();
  };

  // Reordering helpers
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...habits];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, draggedItem);
    setDraggedIndex(targetIndex);
    onReorderHabits(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // Mobile reorder buttons fallback for touch-based devices
  const moveHabit = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= habits.length) return;
    const updated = [...habits];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, moved);
    onReorderHabits(updated);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-[#F5D77F]">
            Daily Habits
          </h2>
          <p className="text-xs text-[#9E9689]">
            Build discipline with every tick
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14120E] border border-[#D4AF37]/30 text-xs font-semibold text-[#F5D77F]">
          <Flame className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
          <span>{streak} Day Streak</span>
        </div>
      </div>

      {/* Habit Cards List */}
      {habits.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#14120E] border border-dashed border-[#D4AF37]/30 text-center">
          <CheckCircle2 className="w-10 h-10 text-[#D4AF37] mx-auto mb-3 opacity-60" />
          <h3 className="font-display text-base font-bold text-[#F5D77F] mb-1">No Habits Tracked Yet</h3>
          <p className="text-xs text-[#9E9689] max-w-xs mx-auto mb-4">
            Tap the gold + button below to start your first daily routine.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {habits.map((habit, index) => {
            const isDone = habit.completedDates.includes(todayStr);
            const { completedCount, totalDays, percentage, colorClass } = calculateHabitConsistency(habit, todayStr);

            return (
              <div
                key={habit.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3 group select-none ${
                  isDone
                    ? 'bg-gradient-to-r from-[#2A2314] to-[#1C170E] border-[#D4AF37]/60 shadow-[0_4px_16px_rgba(212,175,55,0.18)]'
                    : 'bg-[#14120E] border-white/5 hover:border-[#D4AF37]/30 shadow-sm'
                } ${draggedIndex === index ? 'opacity-40 scale-[0.98]' : ''}`}
              >
                {/* Left section: Drag handle + Custom Icon + Details */}
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Drag Handle */}
                  <div
                    className="p-1 cursor-grab active:cursor-grabbing text-[#635C50] hover:text-[#D4AF37] transition shrink-0"
                    title="Drag to reorder"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>

                  {/* Icon Swatch */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{
                      backgroundColor: `${habit.color}15`,
                      borderColor: `${habit.color}40`,
                      color: habit.color
                    }}
                  >
                    <IconRenderer name={habit.icon} size={20} />
                  </div>

                  {/* Text info */}
                  <div className="min-w-0">
                    <h3
                      className={`text-sm font-semibold truncate transition-all ${
                        isDone
                          ? 'line-through text-[#9E9689] italic'
                          : 'text-[#EDE8D0]'
                      }`}
                    >
                      {habit.name}
                    </h3>
                    <p className="text-[11px] font-mono tracking-tight text-[#8A8275] flex items-center gap-1.5 flex-wrap">
                      <span>{completedCount}/{totalDays} days</span>
                      <span>·</span>
                      <span className={`font-semibold ${colorClass}`}>
                        {percentage}% consistency
                      </span>
                    </p>
                  </div>
                </div>

                {/* Right controls: Delete button + Check Circle */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Delete option */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Remove habit "${habit.name}"?`)) {
                        onDeleteHabit(habit.id);
                      }
                    }}
                    aria-label="Delete habit"
                    className="p-1.5 rounded-lg text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Check Circle button */}
                  <button
                    onClick={() => onToggleHabit(habit.id)}
                    aria-label={isDone ? 'Mark incomplete' : 'Mark completed'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all active:scale-90 ${
                      isDone
                        ? 'bg-gradient-to-tr from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] border-[#D4AF37] text-[#090807] shadow-[0_0_12px_rgba(212,175,55,0.7)]'
                        : 'border-[#4A4439] bg-transparent hover:border-[#D4AF37] text-transparent'
                    }`}
                  >
                    <Check className={`w-4 h-4 stroke-[3] ${isDone ? 'opacity-100' : 'opacity-0'}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit Sheet Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
              <h3 className="font-display text-lg font-bold text-[#F5D77F] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                Forge New Habit
              </h3>
              <button
                onClick={onCloseAddModal}
                className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets */}
            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-2">
                Quick Presets (One Tap)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_HABITS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="p-2 rounded-xl bg-[#1E1B15] border border-white/5 hover:border-[#D4AF37]/50 text-left transition flex items-center gap-2 active:scale-95"
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                      style={{ backgroundColor: `${p.color}25`, color: p.color }}
                    >
                      <IconRenderer name={p.icon} size={14} />
                    </div>
                    <span className="text-xs font-medium text-[#EDE8D0]">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Read 20 pages"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
                />
              </div>

              {/* Icon Picker (16 icons) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Select Icon (16 Icons)
                </label>
                <div className="grid grid-cols-8 gap-2 p-2 rounded-xl bg-[#1A1712] border border-[#D4AF37]/20">
                  {AVAILABLE_ICONS.map(iconName => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setSelectedIcon(iconName)}
                      className={`p-2 rounded-lg flex items-center justify-center transition ${
                        selectedIcon === iconName
                          ? 'bg-[#D4AF37] text-[#090807] shadow-sm scale-105'
                          : 'text-[#8A8275] hover:text-[#EDE8D0] hover:bg-white/5'
                      }`}
                    >
                      <IconRenderer name={iconName} size={18} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker (7 swatches) */}
              <div>
                <label className="block text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider mb-1.5">
                  Color Swatch
                </label>
                <div className="flex items-center justify-between p-2 rounded-xl bg-[#1A1712] border border-[#D4AF37]/20">
                  {COLOR_SWATCHES.map(swatch => (
                    <button
                      key={swatch.hex}
                      type="button"
                      onClick={() => setSelectedColor(swatch.hex)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        selectedColor === swatch.hex ? 'scale-120 ring-2 ring-[#EDE8D0]' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: swatch.hex }}
                    >
                      {selectedColor === swatch.hex && (
                        <Check className="w-3.5 h-3.5 stroke-[3] text-black" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-lg active:scale-98 transition flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Commit Habit (+10 XP)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
