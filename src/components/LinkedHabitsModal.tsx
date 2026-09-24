import React, { useState } from 'react';
import { X, Check, Link2, CheckCircle2 } from 'lucide-react';
import { Habit } from '../types';
import { calculateHabitConsistency, getTodayString } from '../utils/storage';
import { IconRenderer } from './IconRenderer';

interface LinkedHabitsModalProps {
  goalName: string;
  allHabits: Habit[];
  linkedHabitIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSaveLinkedHabits: (selectedIds: string[]) => void;
}

export const LinkedHabitsModal: React.FC<LinkedHabitsModalProps> = ({
  goalName,
  allHabits,
  linkedHabitIds,
  isOpen,
  onClose,
  onSaveLinkedHabits,
}) => {
  const [selected, setSelected] = useState<string[]>(linkedHabitIds);
  const todayStr = getTodayString();

  if (!isOpen) return null;

  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(x => x !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleSave = () => {
    onSaveLinkedHabits(selected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4 shrink-0">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-display text-base font-bold text-[#F5D77F]">
                Link Supporting Habits
              </h3>
              <p className="text-[11px] text-[#9E9689] truncate max-w-[240px]">
                {goalName}
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

        {/* Habit List */}
        <div className="space-y-2 overflow-y-auto flex-1 pr-1">
          {allHabits.length === 0 ? (
            <p className="text-xs text-[#9E9689] text-center py-6">
              No habits exist. Create habits first in the Habits tab!
            </p>
          ) : (
            allHabits.map(habit => {
              const isSelected = selected.includes(habit.id);
              const isDoneToday = habit.completedDates.includes(todayStr);
              const { completedCount, totalDays, percentage, colorClass } = calculateHabitConsistency(habit, todayStr);

              return (
                <div
                  key={habit.id}
                  onClick={() => toggleSelection(habit.id)}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#221D13] border-[#D4AF37]/60'
                      : 'bg-[#1A1712] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
                      style={{
                        backgroundColor: `${habit.color}15`,
                        borderColor: `${habit.color}40`,
                        color: habit.color
                      }}
                    >
                      <IconRenderer name={habit.icon} size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#EDE8D0]">
                          {habit.name}
                        </span>
                        {isDoneToday && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                            Done Today
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-[#8A8275] font-mono">
                        {completedCount}/{totalDays} days ·{' '}
                        <span className={colorClass}>{percentage}% consistent</span>
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition ${
                      isSelected
                        ? 'bg-[#D4AF37] border-[#D4AF37] text-[#090807]'
                        : 'border-[#4A4439] bg-transparent'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer save */}
        <div className="pt-4 border-t border-[#D4AF37]/20 mt-4 shrink-0">
          <button
            onClick={handleSave}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-md active:scale-98 transition"
          >
            Save Linked Habits ({selected.length})
          </button>
        </div>
      </div>
    </div>
  );
};
