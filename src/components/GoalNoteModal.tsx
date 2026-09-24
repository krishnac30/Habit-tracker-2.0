import React, { useState } from 'react';
import { X, FileText, Save } from 'lucide-react';
import { getTodayString } from '../utils/storage';

interface GoalNoteModalProps {
  goalName: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (text: string) => void;
}

export const GoalNoteModal: React.FC<GoalNoteModalProps> = ({
  goalName,
  isOpen,
  onClose,
  onSaveNote,
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSaveNote(text.trim());
    setText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-[#14120E] border border-[#D4AF37]/40 shadow-2xl p-6 text-[#EDE8D0] animate-in slide-in-from-bottom duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#D4AF37]" />
            <div>
              <h3 className="font-display text-base font-bold text-[#F5D77F]">
                Add Goal Note
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-[#F5D77F] uppercase tracking-wider">
                Log Entry
              </label>
              <span className="text-[10px] font-mono text-[#9E9689]">
                Date: {getTodayString()}
              </span>
            </div>
            <textarea
              required
              rows={5}
              placeholder="Record breakthroughs, metrics, obstacles, or strategy changes..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/30 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37] resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-md active:scale-98 transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            Save Timestamped Note
          </button>
        </form>
      </div>
    </div>
  );
};
