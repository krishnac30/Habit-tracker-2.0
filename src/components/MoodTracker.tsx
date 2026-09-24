import React, { useState, useEffect } from 'react';
import { Smile, Sparkles, Save, Calendar, Check, HeartHandshake } from 'lucide-react';
import { MoodEntry, MOOD_OPTIONS, MoodType } from '../types';
import { formatDateDisplay, getTodayString } from '../utils/storage';

interface MoodTrackerProps {
  moodEntries: MoodEntry[];
  onSaveMood: (mood: MoodType, emoji: string, label: string, note?: string) => void;
}

export const MoodTracker: React.FC<MoodTrackerProps> = ({
  moodEntries,
  onSaveMood,
}) => {
  const todayStr = getTodayString();
  const existingToday = moodEntries.find(m => m.date === todayStr);

  const [selectedMood, setSelectedMood] = useState<MoodType>(existingToday?.mood || 'great');
  const [journalNote, setJournalNote] = useState<string>(existingToday?.note || '');
  const [justSaved, setJustSaved] = useState<boolean>(false);

  useEffect(() => {
    if (existingToday) {
      setSelectedMood(existingToday.mood);
      setJournalNote(existingToday.note || '');
    }
  }, [existingToday]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const option = MOOD_OPTIONS.find(o => o.type === selectedMood) || MOOD_OPTIONS[0];
    onSaveMood(option.type, option.emoji, option.label, journalNote.trim() || undefined);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  // Recent 10 entries
  const recentEntries = [...moodEntries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return (
    <div className="space-y-5 pb-28">
      {/* Header bar */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-[#F5D77F]">
            Emotional Equilibrium
          </h2>
          <p className="text-xs text-[#9E9689]">
            Daily self-attunement and reflections
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#14120E] border border-[#D4AF37]/30 text-xs font-semibold text-[#F5D77F]">
          <Smile className="w-3.5 h-3.5 text-[#F5D77F]" />
          <span>{moodEntries.length} Check-ins Logged</span>
        </div>
      </div>

      {/* Daily Check-in Card */}
      <div className="p-5 rounded-3xl bg-[#14120E] border border-[#D4AF37]/35 shadow-lg space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs font-display font-bold text-[#F5D77F] uppercase tracking-wider">
            Today's State of Mind
          </span>
          <span className="text-[11px] font-mono text-[#9E9689]">
            {formatDateDisplay(todayStr)}
          </span>
        </div>

        {/* Emoji Mood Selector (5 options in a row) */}
        <div className="grid grid-cols-5 gap-2">
          {MOOD_OPTIONS.map(opt => {
            const isSelected = selectedMood === opt.type;

            return (
              <button
                key={opt.type}
                type="button"
                onClick={() => setSelectedMood(opt.type)}
                className={`py-3 px-1 rounded-2xl flex flex-col items-center justify-center transition-all duration-200 active:scale-95 ${
                  isSelected
                    ? 'bg-[#2A2315] border-2 border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                    : 'bg-[#181510] border border-white/5 hover:border-white/20'
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{opt.emoji}</span>
                <span
                  className={`text-[10px] tracking-tight font-semibold ${
                    isSelected ? 'text-[#F5D77F]' : 'text-[#8A8275]'
                  }`}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Journal Note: Optional free-text field */}
        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-[#8A8275] uppercase tracking-wider mb-1.5">
              Journal Note (Gratitude, reflections, focus)
            </label>
            <textarea
              rows={4}
              placeholder="What fueled your spirit today? What tension did you release? Record your inner truth..."
              value={journalNote}
              onChange={(e) => setJournalNote(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-[#1C1914] border border-[#D4AF37]/25 text-sm text-[#EDE8D0] placeholder-[#635C50] focus:outline-none focus:border-[#D4AF37] resize-none leading-relaxed"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] font-bold text-sm tracking-wide shadow-lg active:scale-98 transition flex items-center justify-center gap-2"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                Check-in Saved (+10 XP)
              </>
            ) : (
              <>
                <Save className="w-4 h-4 stroke-[2.5]" />
                Save Check-in (+10 XP)
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Entries Section (Last 10 entries) */}
      <div className="space-y-3 pt-2">
        <h3 className="font-display text-sm font-bold text-[#F5D77F] uppercase tracking-wider px-1">
          Recent Chronicles ({recentEntries.length})
        </h3>

        {recentEntries.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#14120E] border border-dashed border-[#D4AF37]/30 text-center text-xs text-[#8A8275]">
            No reflections recorded yet. Your emotional journey will unfold here.
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentEntries.map(entry => (
              <div
                key={entry.id}
                className="p-3.5 rounded-2xl bg-[#14120E] border border-white/5 space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{entry.emoji}</span>
                    <span className="font-semibold text-xs text-[#EDE8D0]">
                      {entry.label}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#8A8275]">
                    {formatDateDisplay(entry.date)}
                  </span>
                </div>

                {entry.note && (
                  <p className="text-xs text-[#C8C0B2] leading-relaxed pl-7 border-l-2 border-[#D4AF37]/40 font-light">
                    {entry.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
