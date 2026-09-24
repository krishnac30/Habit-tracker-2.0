import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Calendar, GripVertical, FileText, ChevronDown, ChevronUp, Clock, AlertCircle } from 'lucide-react';
import { Goal, Subtask } from '../types';
import { calculateDaysBetween, calculateGoalProgress, formatDateDisplay, getTodayString } from '../utils/storage';

interface SubtasksModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onToggleSubtask: (goalId: string, subtaskId: string) => void;
  onAddSubtask: (goalId: string, name: string) => void;
  onDeleteSubtask: (goalId: string, subtaskId: string) => void;
  onUpdateSubtaskDate: (goalId: string, subtaskId: string, dueDate?: string) => void;
  onUpdateSubtaskNote: (goalId: string, subtaskId: string, note?: string) => void;
  onReorderSubtasks: (goalId: string, reordered: Subtask[]) => void;
}

export const SubtasksModal: React.FC<SubtasksModalProps> = ({
  goal,
  isOpen,
  onClose,
  onToggleSubtask,
  onAddSubtask,
  onDeleteSubtask,
  onUpdateSubtaskDate,
  onUpdateSubtaskNote,
  onReorderSubtasks,
}) => {
  const [newSubtaskName, setNewSubtaskName] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const todayStr = getTodayString();
  const progress = calculateGoalProgress(goal);
  const doneCount = goal.subtasks.filter(s => s.isDone).length;

  if (!isOpen) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskName.trim()) return;
    onAddSubtask(goal.id, newSubtaskName.trim());
    setNewSubtaskName('');
  };

  const handleStartEditNote = (st: Subtask) => {
    setEditingNoteId(st.id);
    setNoteDraft(st.note || '');
  };

  const handleSaveNote = (subtaskId: string) => {
    onUpdateSubtaskNote(goal.id, subtaskId, noteDraft.trim() || undefined);
    setEditingNoteId(null);
  };

  // Reorder handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const items = [...goal.subtasks];
    const [moved] = items.splice(draggedIndex, 1);
    items.splice(targetIdx, 0, moved);
    setDraggedIndex(targetIdx);
    onReorderSubtasks(goal.id, items);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-5 sm:p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-[#D4AF37]/20 mb-3 shrink-0">
          <div>
            <h3 className="font-serif-luxury text-xl font-bold text-[#F5D77F] leading-snug">
              {goal.name}
            </h3>
            <p className="text-xs text-[#9E9689] font-mono">
              Subtasks Manager · {doneCount} of {goal.subtasks.length} Completed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-[#9E9689] hover:text-[#EDE8D0] hover:bg-white/5 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Progress Bar */}
        <div className="mb-4 shrink-0 bg-[#1C1914] p-3 rounded-2xl border border-[#D4AF37]/20">
          <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
            <span className="text-[#F5D77F] font-semibold">Goal Progress</span>
            <span className="font-bold text-[#F5D77F]">{progress}%</span>
          </div>
          <div className="relative w-full h-2.5 rounded-full bg-[#201D17] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] transition-all duration-300 shadow-[0_0_10px_rgba(212,175,55,0.7)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Goal-level Notes Summary for Context */}
        {goal.notes && goal.notes.length > 0 && (
          <div className="mb-3 shrink-0 p-3 rounded-2xl bg-[#1C1811] border-l-4 border-[#D4AF37] border-y border-r border-white/5 max-h-28 overflow-y-auto">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#F5D77F] uppercase tracking-wider mb-1">
              <FileText className="w-3 h-3 text-[#D4AF37]" />
              Goal Context Notes ({goal.notes.length})
            </div>
            {goal.notes.map(n => (
              <div key={n.id} className="text-xs text-[#C8C0B2] mb-1 last:mb-0">
                <span className="font-mono text-[10px] text-[#9E9689] mr-1.5">[{n.date}]:</span>
                {n.text}
              </div>
            ))}
          </div>
        )}

        {/* Subtasks List */}
        <div className="space-y-3 overflow-y-auto flex-1 pr-1 pb-2">
          {goal.subtasks.length === 0 ? (
            <div className="p-6 text-center text-[#9E9689] text-xs">
              No subtasks defined. Add your first actionable task below.
            </div>
          ) : (
            goal.subtasks.map((subtask, index) => {
              // Due date urgency check (within 3 days = red)
              let dueDateUrgent = false;
              if (subtask.dueDate) {
                const daysDiff = calculateDaysBetween(todayStr, subtask.dueDate);
                if (daysDiff <= 3) {
                  dueDateUrgent = true;
                }
              }

              return (
                <div
                  key={subtask.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    subtask.isDone
                      ? 'bg-[#181510] border-emerald-500/25 opacity-75'
                      : 'bg-[#1C1914] border-white/10 hover:border-[#D4AF37]/40'
                  }`}
                >
                  {/* Top Area: Drag Handle + Large Checkbox + Name */}
                  <div className="flex items-start gap-3">
                    <div
                      className="p-1 cursor-grab text-[#635C50] hover:text-[#D4AF37] transition mt-0.5 shrink-0"
                      title="Drag to reorder"
                    >
                      <GripVertical className="w-4 h-4" />
                    </div>

                    {/* Large Checkbox (26x26px) */}
                    <button
                      type="button"
                      onClick={() => onToggleSubtask(goal.id, subtask.id)}
                      className={`w-[26px] h-[26px] rounded-lg flex items-center justify-center border-2 shrink-0 transition-all mt-0.5 active:scale-90 ${
                        subtask.isDone
                          ? 'bg-emerald-500 border-emerald-500 text-black shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                          : 'border-[#544E41] bg-transparent hover:border-[#D4AF37]'
                      }`}
                    >
                      {subtask.isDone && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p
                        onClick={() => onToggleSubtask(goal.id, subtask.id)}
                        className={`text-sm font-medium cursor-pointer leading-snug break-words ${
                          subtask.isDone
                            ? 'line-through text-[#8A8275] italic'
                            : 'text-[#EDE8D0]'
                        }`}
                      >
                        {subtask.name}
                      </p>

                      {/* Due date tag display */}
                      {subtask.dueDate && (
                        <div className={`flex items-center gap-1 mt-1 text-[11px] font-mono ${
                          dueDateUrgent ? 'text-rose-400 font-semibold' : 'text-[#9E9689]'
                        }`}>
                          <Clock className="w-3 h-3" />
                          <span>Due: {formatDateDisplay(subtask.dueDate)}</span>
                          {dueDateUrgent && <span>(! Urgent)</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Due Date field (full-width date picker) */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#9E9689]" />
                      <span className="text-[11px] text-[#9E9689]">Deadline:</span>
                      <input
                        type="date"
                        value={subtask.dueDate || ''}
                        onChange={(e) => onUpdateSubtaskDate(goal.id, subtask.id, e.target.value || undefined)}
                        className="px-2 py-0.5 rounded-lg bg-[#14120E] border border-white/10 text-xs text-[#EDE8D0] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>

                    {/* Note Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleStartEditNote(subtask)}
                      className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      {subtask.note ? 'Edit Note' : '+ Add Note'}
                    </button>
                  </div>

                  {/* Note Preview (purple left border) */}
                  {subtask.note && editingNoteId !== subtask.id && (
                    <div
                      onClick={() => handleStartEditNote(subtask)}
                      className="mt-2 p-2.5 rounded-lg bg-[#211B2B]/60 border-l-4 border-purple-500 text-xs text-[#D8B4FE] cursor-pointer hover:bg-[#211B2B] transition leading-relaxed"
                    >
                      <span className="text-[10px] uppercase font-bold text-purple-400 block mb-0.5">Task Note:</span>
                      {subtask.note}
                    </div>
                  )}

                  {/* Inline Note Editor */}
                  {editingNoteId === subtask.id && (
                    <div className="mt-2 p-2.5 rounded-xl bg-[#14120E] border border-purple-500/40 space-y-2">
                      <textarea
                        rows={3}
                        placeholder="Write task note..."
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        className="w-full p-2 rounded-lg bg-[#1C1914] border border-white/10 text-xs text-[#EDE8D0] focus:outline-none focus:border-purple-400 resize-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 rounded-lg text-xs text-[#9E9689] hover:bg-white/5"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(subtask.id)}
                          className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-sm"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Delete Button (red at bottom) */}
                  <div className="mt-2 pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onDeleteSubtask(goal.id, subtask.id)}
                      className="text-[11px] text-rose-400/80 hover:text-rose-400 flex items-center gap-1 hover:bg-rose-500/10 px-2 py-0.5 rounded transition"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete subtask</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Adding subtasks: full-width text input at bottom + gold Add Subtask button */}
        <form onSubmit={handleAddSubmit} className="pt-3 border-t border-[#D4AF37]/20 mt-2 shrink-0 space-y-2">
          <input
            type="text"
            placeholder="Type subtask name and press Enter..."
            value={newSubtaskName}
            onChange={(e) => setNewSubtaskName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-md active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Add Subtask (+15 XP)
          </button>
        </form>
      </div>
    </div>
  );
};
