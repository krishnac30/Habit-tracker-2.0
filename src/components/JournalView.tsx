import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Plus,
  ArrowLeft,
  Send,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  Check,
  CheckCheck,
  Target,
  Download,
  Copy,
  ChevronRight,
  BookOpen,
  X,
  FileText,
  Search,
  Image as ImageIcon
} from 'lucide-react';
import { Goal, Habit, JournalEntry } from '../types';
import { getTodayString, formatDateDisplay } from '../utils/storage';
import { downloadFile } from '../utils/export';

interface JournalViewProps {
  entries: JournalEntry[];
  goals: Goal[];
  habits: Habit[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'timestamp'>) => void;
  onEditEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
  onTogglePin?: (id: string) => void;
  isAddModalOpen?: boolean;
  onCloseAddModal?: () => void;
  activeTopic?: string | null;
  onActiveTopicChange?: (topic: string | null) => void;
}

interface TopicMeta {
  name: string;
  linkedGoalId?: string;
}

const TOPICS_STORAGE_KEY = 'apex_journal_topics_v2';

export const JournalView: React.FC<JournalViewProps> = ({
  entries = [],
  goals = [],
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  isAddModalOpen = false,
  onCloseAddModal,
  activeTopic: controlledActiveTopic,
  onActiveTopicChange,
}) => {
  const todayStr = getTodayString();

  // Load custom topics metadata from localStorage
  const [topicMetas, setTopicMetas] = useState<TopicMeta[]>(() => {
    try {
      const saved = localStorage.getItem(TOPICS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load topic metas', e);
    }
    // Default starter topics
    return [
      { name: 'System Architecture', linkedGoalId: 'g2' },
      { name: 'Neurobiology & Focus' },
      { name: 'Productivity & Habits' }
    ];
  });

  // Save topic metas to localStorage whenever updated
  useEffect(() => {
    try {
      localStorage.setItem(TOPICS_STORAGE_KEY, JSON.stringify(topicMetas));
    } catch (e) {
      console.error('Failed to save topic metas', e);
    }
  }, [topicMetas]);

  // Merge topics from entries and topicMetas
  const allTopicNames = useMemo(() => {
    const namesSet = new Set<string>();
    topicMetas.forEach(tm => namesSet.add(tm.name));
    entries.forEach(e => {
      if (e.topic) namesSet.add(e.topic);
    });
    return Array.from(namesSet);
  }, [topicMetas, entries]);

  // Internal active topic fallback if not controlled
  const [internalActiveTopic, setInternalActiveTopic] = useState<string | null>(null);
  const activeTopic = controlledActiveTopic !== undefined ? controlledActiveTopic : internalActiveTopic;

  const setActiveTopic = (topic: string | null) => {
    if (onActiveTopicChange) {
      onActiveTopicChange(topic);
    }
    setInternalActiveTopic(topic);
  };

  // Search filter on main topics page
  const [searchQuery, setSearchQuery] = useState('');

  // New topic modal state
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicGoalId, setNewTopicGoalId] = useState<string>('');

  // Quick note modal directly from card "+" button
  const [quickAddTopic, setQuickAddTopic] = useState<string | null>(null);
  const [quickNoteText, setQuickNoteText] = useState('');
  const [quickNoteImages, setQuickNoteImages] = useState<string[]>([]);

  // WhatsApp-style message input state
  const [noteInput, setNoteInput] = useState('');
  const [noteImages, setNoteImages] = useState<string[]>([]);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingImages, setEditingImages] = useState<string[]>([]);

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fullscreen photo modal state
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Ref to chat messages container for auto-scroll
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quickFileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  // Open modal when prop `isAddModalOpen` triggers
  useEffect(() => {
    if (isAddModalOpen) {
      setIsNewTopicModalOpen(true);
    }
  }, [isAddModalOpen]);

  // Helper: scroll chat to bottom
  const scrollToBottom = (smooth = true) => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    }
  };

  // When active topic changes or new notes added, auto scroll to bottom
  useEffect(() => {
    if (activeTopic) {
      setTimeout(() => scrollToBottom(false), 50);
    }
  }, [activeTopic]);

  // Photo upload helper: reads file to base64 data URL
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'note' | 'quick' | 'edit') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (!base64) return;
        if (target === 'note') {
          setNoteImages(prev => [...prev, base64]);
        } else if (target === 'quick') {
          setQuickNoteImages(prev => [...prev, base64]);
        } else if (target === 'edit') {
          setEditingImages(prev => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Get linked goal for a topic
  const getTopicGoal = (topicName: string): Goal | undefined => {
    const meta = topicMetas.find(m => m.name.toLowerCase() === topicName.toLowerCase());
    const goalId = meta?.linkedGoalId || entries.find(e => e.topic === topicName && e.linkedGoalId)?.linkedGoalId;
    if (!goalId) return undefined;
    return goals.find(g => g.id === goalId);
  };

  // Update linked goal for topic
  const handleUpdateTopicGoal = (topicName: string, goalId: string) => {
    setTopicMetas(prev => {
      const existing = prev.find(m => m.name.toLowerCase() === topicName.toLowerCase());
      if (existing) {
        return prev.map(m => m.name.toLowerCase() === topicName.toLowerCase() ? { ...m, linkedGoalId: goalId || undefined } : m);
      } else {
        return [...prev, { name: topicName, linkedGoalId: goalId || undefined }];
      }
    });
  };

  // Delete topic & all its notes
  const handleDeleteTopic = (topicName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete topic "${topicName}" and all its notes?`)) return;
    
    // Remove from topicMetas
    setTopicMetas(prev => prev.filter(m => m.name.toLowerCase() !== topicName.toLowerCase()));
    
    // Delete all entries in that topic
    entries.filter(en => en.topic === topicName).forEach(en => onDeleteEntry(en.id));

    if (activeTopic === topicName) {
      setActiveTopic(null);
    }
  };

  // Create new topic
  const handleCreateTopic = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newTopicName.trim();
    if (!trimmed) return;

    // Check if topic exists
    if (!topicMetas.some(m => m.name.toLowerCase() === trimmed.toLowerCase())) {
      setTopicMetas(prev => [...prev, { name: trimmed, linkedGoalId: newTopicGoalId || undefined }]);
    }

    setNewTopicName('');
    setNewTopicGoalId('');
    setIsNewTopicModalOpen(false);
    if (onCloseAddModal) onCloseAddModal();
    
    // Open the new topic directly
    setActiveTopic(trimmed);
  };

  // Direct quick add note from topic card "+"
  const handleSaveQuickNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddTopic || (!quickNoteText.trim() && quickNoteImages.length === 0)) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const topicGoal = getTopicGoal(quickAddTopic);

    onAddEntry({
      title: quickAddTopic,
      topic: quickAddTopic,
      content: quickNoteText.trim(),
      date: todayStr,
      time: timeStr,
      linkedGoalId: topicGoal?.id,
      images: quickNoteImages.length > 0 ? quickNoteImages : undefined
    });

    setQuickNoteText('');
    setQuickNoteImages([]);
    const savedTopic = quickAddTopic;
    setQuickAddTopic(null);

    // Navigate to that topic to see the note in the stream
    setActiveTopic(savedTopic);
  };

  // Save note inside active topic stream
  const handleSaveNote = () => {
    const trimmed = noteInput.trim();
    if ((!trimmed && noteImages.length === 0) || !activeTopic) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const topicGoal = getTopicGoal(activeTopic);

    onAddEntry({
      title: activeTopic,
      topic: activeTopic,
      content: trimmed,
      date: todayStr,
      time: timeStr,
      linkedGoalId: topicGoal?.id,
      images: noteImages.length > 0 ? noteImages : undefined
    });

    // "after adding it should go" -> clear input & photos immediately
    setNoteInput('');
    setNoteImages([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Scroll chat to bottom smoothly
    setTimeout(() => scrollToBottom(true), 100);
  };

  // Keyboard shortcut: Enter to save, Shift+Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveNote();
    }
  };

  // Start editing a note inline
  const handleStartEdit = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setEditingText(entry.content);
    setEditingImages(entry.images || []);
  };

  // Save edited note
  const handleSaveEdit = (entry: JournalEntry) => {
    if (!editingText.trim() && editingImages.length === 0) return;
    onEditEntry({
      ...entry,
      content: editingText.trim(),
      images: editingImages.length > 0 ? editingImages : undefined,
      updatedAt: Date.now()
    });
    setEditingEntryId(null);
    setEditingText('');
    setEditingImages([]);
  };

  // Copy note text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export topic notes to Markdown
  const handleExportTopicMarkdown = (topicName: string) => {
    const topicNotes = entries
      .filter(e => e.topic === topicName)
      .sort((a, b) => a.timestamp - b.timestamp);
    
    const linkedGoal = getTopicGoal(topicName);

    let md = `# ${topicName}\n`;
    md += `*Exported on ${new Date().toLocaleDateString()}*\n\n`;
    if (linkedGoal) {
      md += `**Linked Goal:** ${linkedGoal.name}\n\n`;
    }
    md += `Total Notes: ${topicNotes.length}\n\n`;
    md += `---\n\n`;

    topicNotes.forEach((n, idx) => {
      md += `### Note #${idx + 1} — ${n.date} at ${n.time || ''}\n\n`;
      md += `${n.content}\n\n`;
      if (n.images && n.images.length > 0) {
        md += `*Included ${n.images.length} photo(s)*\n\n`;
      }
      md += `---\n\n`;
    });

    downloadFile(md, `${topicName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-notes.md`, 'text/markdown');
  };

  // Filtered topics for search
  const filteredTopics = useMemo(() => {
    if (!searchQuery.trim()) return allTopicNames;
    const q = searchQuery.toLowerCase();
    return allTopicNames.filter(name => {
      if (name.toLowerCase().includes(q)) return true;
      const topicNotes = entries.filter(e => e.topic === name);
      return topicNotes.some(n => n.content.toLowerCase().includes(q));
    });
  }, [allTopicNames, searchQuery, entries]);

  // Active topic notes sorted ascending (oldest first, newest at bottom, just like WhatsApp)
  const activeTopicNotes = useMemo(() => {
    if (!activeTopic) return [];
    return entries
      .filter(e => e.topic === activeTopic)
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [entries, activeTopic]);

  // Group notes by date for WhatsApp date badges
  const groupedNotes = useMemo(() => {
    const groups: { date: string; notes: JournalEntry[] }[] = [];
    activeTopicNotes.forEach(note => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === note.date) {
        lastGroup.notes.push(note);
      } else {
        groups.push({ date: note.date, notes: [note] });
      }
    });
    return groups;
  }, [activeTopicNotes]);

  // Helper to format date header (Today, Yesterday, or formatted date)
  const formatGroupDateHeader = (dateStr: string) => {
    if (dateStr === todayStr) return 'TODAY';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    if (dateStr === yesterdayStr) return 'YESTERDAY';
    return formatDateDisplay(dateStr).toUpperCase();
  };

  // =========================================================================
  // VIEW 1: INSIDE TOPIC (WhatsApp Chat Style Stream - Left-Aligned & Fit-to-Screen)
  // =========================================================================
  if (activeTopic) {
    const activeGoal = getTopicGoal(activeTopic);

    return (
      <div className="flex flex-col h-[calc(100vh-140px)] w-full rounded-3xl bg-[#0D0B08] border border-white/5 overflow-hidden shadow-2xl relative text-left">
        {/* WhatsApp-Style Topic Header */}
        <div className="px-4 py-3 bg-[#15120C] border-b border-white/5 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setActiveTopic(null)}
              className="p-1.5 rounded-xl hover:bg-white/5 text-[#D4AF37] hover:text-[#F5D77F] transition flex items-center gap-1 shrink-0"
              title="Back to Topics"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0 text-left">
              <h2 className="font-display font-bold text-base text-[#F5D77F] truncate leading-tight text-left">
                {activeTopic}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-[#9E9689]">
                <span>{activeTopicNotes.length} notes</span>
                <span>•</span>
                {activeGoal ? (
                  <span className="flex items-center gap-1 text-[#D4AF37] truncate font-medium">
                    <Target className="w-3 h-3 text-[#D4AF37] shrink-0" />
                    Goal: {activeGoal.name}
                  </span>
                ) : (
                  <span className="text-[#6E675B]">No linked goal</span>
                )}
              </div>
            </div>
          </div>

          {/* Header Controls: Link to Goal & Export */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Link to Goal Selector */}
            <div className="relative">
              <select
                value={activeGoal?.id || ''}
                onChange={(e) => handleUpdateTopicGoal(activeTopic, e.target.value)}
                className="bg-[#1C1811] text-[#EDE8D0] text-xs font-mono py-1.5 px-2.5 rounded-xl border border-white/10 hover:border-[#D4AF37]/50 focus:outline-none focus:border-[#D4AF37] cursor-pointer max-w-[150px] truncate"
                title="Link this topic to a goal"
              >
                <option value="">🎯 Link to Goal...</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    🎯 {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Topic Button */}
            <button
              onClick={() => handleExportTopicMarkdown(activeTopic)}
              className="p-2 rounded-xl bg-[#1C1811] hover:bg-[#D4AF37]/15 text-[#9E9689] hover:text-[#F5D77F] border border-white/5 transition"
              title="Export Notes as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* WhatsApp-Style Scrollable Notes Container - Left Aligned Fit-to-Screen */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 bg-gradient-to-b from-[#0D0B08] via-[#100E0A] to-[#0A0906] relative"
        >
          {/* Subtle WhatsApp-style decorative background pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]" />

          {activeTopicNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12 px-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-3 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="font-display font-bold text-base text-[#F5D77F] mb-1">
                No notes in {activeTopic} yet
              </h3>
              <p className="text-xs text-[#9E9689] max-w-sm mb-4">
                Type your thoughts, insights, or attach photos below and hit Save. Your notes will appear as a chat stream with timestamps!
              </p>
            </div>
          ) : (
            groupedNotes.map(group => (
              <div key={group.date} className="space-y-3 relative z-10">
                {/* Centered WhatsApp Date Badge */}
                <div className="flex justify-center my-3 sticky top-1 z-20">
                  <span className="px-3 py-1 rounded-full text-[10px] font-mono font-semibold tracking-wider bg-[#1B1710]/90 backdrop-blur-md text-[#A89F91] border border-white/5 shadow-md">
                    {formatGroupDateHeader(group.date)}
                  </span>
                </div>

                {/* Notes in this Date Group - Left-Aligned & Fit to Screen */}
                {group.notes.map(note => {
                  const isEditing = editingEntryId === note.id;

                  return (
                    <div
                      key={note.id}
                      className="group flex flex-col items-start w-full mr-auto animate-fadeIn"
                    >
                      {/* WhatsApp Note Bubble (Left-Aligned, Full Available Width) */}
                      <div className="relative rounded-2xl rounded-tl-xs bg-[#191610] hover:bg-[#1E1B13] border border-[#D4AF37]/20 hover:border-[#D4AF37]/40 p-3.5 shadow-md text-[#EDE8D0] transition w-full text-left">
                        {isEditing ? (
                          /* Inline Note Editor */
                          <div className="space-y-2.5 w-full">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              rows={3}
                              className="w-full bg-[#110F0A] border border-[#D4AF37]/40 rounded-xl p-2.5 text-xs text-[#EDE8D0] focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                              autoFocus
                            />

                            {/* Editing photos list */}
                            {editingImages.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {editingImages.map((img, i) => (
                                  <div key={i} className="relative group/editimg w-16 h-16 rounded-xl overflow-hidden border border-white/10">
                                    <img src={img} alt="attachment" className="w-full h-full object-cover" />
                                    <button
                                      type="button"
                                      onClick={() => setEditingImages(prev => prev.filter((_, idx) => idx !== i))}
                                      className="absolute top-1 right-1 p-0.5 rounded-full bg-black/80 text-rose-400 hover:text-white"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between gap-2 pt-1">
                              <label className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#D4AF37] hover:text-[#F5D77F] cursor-pointer flex items-center gap-1 text-[11px] font-mono">
                                <ImageIcon className="w-3.5 h-3.5" />
                                <span>Add Photo</span>
                                <input
                                  ref={editFileInputRef}
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={(e) => handlePhotoUpload(e, 'edit')}
                                  className="hidden"
                                />
                              </label>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingEntryId(null);
                                    setEditingImages([]);
                                  }}
                                  className="px-2.5 py-1 text-[11px] rounded-lg bg-white/5 hover:bg-white/10 text-[#9E9689]"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(note)}
                                  className="px-3 py-1 text-[11px] font-bold rounded-lg bg-[#D4AF37] text-black hover:bg-[#F5D77F]"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Attached Photos */}
                            {note.images && note.images.length > 0 && (
                              <div className={`grid gap-2 mb-2.5 ${note.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2 sm:grid-cols-3'}`}>
                                {note.images.map((img, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    onClick={() => setPreviewImage(img)}
                                    className="relative rounded-xl overflow-hidden border border-white/10 bg-black/40 group/photo cursor-pointer aspect-video sm:aspect-square"
                                  >
                                    <img
                                      src={img}
                                      alt={`Attachment ${imgIdx + 1}`}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover/photo:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-mono">
                                      Click to view
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Note Content (Text) */}
                            {note.content && (
                              <div className="text-[13px] leading-relaxed whitespace-pre-wrap break-words pr-2 text-[#F2ECE1] text-left">
                                {note.content}
                              </div>
                            )}

                            {/* Small Time & Date Stamp always present in bottom corner */}
                            <div className="flex items-center justify-end gap-1.5 mt-2 pt-1 border-t border-white/5 text-[10px] font-mono text-[#8A8275]">
                              {note.updatedAt && (
                                <span className="italic text-[9px] text-[#716A5E] mr-1">(edited)</span>
                              )}
                              <span>{note.date}</span>
                              <span>•</span>
                              <span>{note.time || '12:00'}</span>
                              <CheckCheck className="w-3 h-3 text-[#D4AF37]" />
                            </div>

                            {/* Quick Action Overlay (Edit, Copy, Delete) */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#14120D]/90 backdrop-blur-sm p-1 rounded-xl border border-white/10 shadow-lg">
                              {note.content && (
                                <button
                                  onClick={() => handleCopy(note.id, note.content)}
                                  className="p-1 rounded-lg text-[#9E9689] hover:text-[#F5D77F] hover:bg-white/5 transition"
                                  title="Copy note"
                                >
                                  {copiedId === note.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                </button>
                              )}
                              <button
                                onClick={() => handleStartEdit(note)}
                                className="p-1 rounded-lg text-[#9E9689] hover:text-[#F5D77F] hover:bg-white/5 transition"
                                title="Edit note"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  if (window.confirm('Delete this note?')) {
                                    onDeleteEntry(note.id);
                                  }
                                }}
                                className="p-1 rounded-lg text-[#9E9689] hover:text-rose-400 hover:bg-white/5 transition"
                                title="Delete note"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* WhatsApp-Style Bottom Input Bar with Photo Attachment */}
        <div className="p-3 bg-[#15120C] border-t border-white/5 shrink-0 z-10 text-left">
          {/* Photo Previews before sending */}
          {noteImages.length > 0 && (
            <div className="flex items-center gap-2 mb-2 px-1 overflow-x-auto pb-1">
              {noteImages.map((img, i) => (
                <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#D4AF37]/40 shrink-0">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setNoteImages(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white hover:text-rose-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 bg-[#1C1811] rounded-2xl border border-white/10 focus-within:border-[#D4AF37]/60 p-2 shadow-inner transition">
            {/* Photo Attachment Button */}
            <label
              title="Attach Photo"
              className="p-2 rounded-xl text-[#9E9689] hover:text-[#F5D77F] hover:bg-white/5 cursor-pointer transition shrink-0"
            >
              <ImageIcon className="w-4 h-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(e, 'note')}
                className="hidden"
              />
            </label>

            <textarea
              ref={textareaRef}
              value={noteInput}
              onChange={(e) => {
                setNoteInput(e.target.value);
                // Auto expand textarea up to 120px
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Write a note in "${activeTopic}"... (Enter to save)`}
              rows={1}
              className="flex-1 bg-transparent border-0 text-xs text-[#EDE8D0] placeholder-[#6E675B] focus:outline-none resize-none px-2 py-1.5 max-h-32 text-left"
            />

            {/* Prominent Save Button */}
            <button
              onClick={handleSaveNote}
              disabled={!noteInput.trim() && noteImages.length === 0}
              className={`px-4 py-2 rounded-xl flex items-center gap-1.5 font-bold text-xs transition shrink-0 ${
                noteInput.trim() || noteImages.length > 0
                  ? 'bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-black shadow-[0_0_12px_rgba(212,175,55,0.4)] active:scale-95 cursor-pointer'
                  : 'bg-white/5 text-[#5A5346] cursor-not-allowed'
              }`}
            >
              <span>Save</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Fullscreen Photo Lightbox Modal */}
        {previewImage && (
          <div
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn cursor-pointer"
          >
            <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={previewImage}
                alt="Enlarged photo"
                className="max-w-full max-h-[82vh] rounded-2xl object-contain border border-white/10 shadow-2xl"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute -top-3 -right-3 p-2 rounded-full bg-[#1C1811] border border-white/20 text-[#EDE8D0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: MAIN TOPICS PAGE (Scrollable Topic Cards Similar to Goals)
  // Clicking anywhere on card opens it. Plus icon moved to bottom of card.
  // =========================================================================
  return (
    <div className="space-y-6 w-full pb-16 text-left">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif-luxury text-2xl font-bold text-[#F3E5AB]">
            Knowledge & Topic Journals
          </h2>
          <p className="text-xs text-[#9E9689] mt-0.5">
            Organize notes & insights by topic, linked to your goals with WhatsApp-style threads
          </p>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8275]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics or notes..."
            className="w-full bg-[#14120E] border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#EDE8D0] placeholder-[#6E675B] focus:outline-none focus:border-[#D4AF37]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8A8275] hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Main Topic Cards - User can scroll through them */}
      {filteredTopics.length === 0 ? (
        <div className="p-8 text-center rounded-3xl bg-[#14120E] border border-dashed border-[#D4AF37]/20">
          <BookOpen className="w-8 h-8 text-[#D4AF37] mx-auto mb-2 opacity-60" />
          <p className="text-sm font-semibold text-[#F5D77F] mb-1">No topics found</p>
          <p className="text-xs text-[#9E9689] mb-4">
            {searchQuery ? 'Try clearing your search query' : 'Create your first topic to start recording notes'}
          </p>
          <button
            onClick={() => setIsNewTopicModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#D4AF37] text-black font-bold text-xs hover:bg-[#F5D77F] transition"
          >
            + Create New Topic
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredTopics.map(topicName => {
            const topicNotes = entries
              .filter(e => e.topic === topicName)
              .sort((a, b) => b.timestamp - a.timestamp);
            const latestNote = topicNotes[0];
            const linkedGoal = getTopicGoal(topicName);

            return (
              <div
                key={topicName}
                onClick={() => setActiveTopic(topicName)}
                className="group relative p-4 rounded-2xl bg-[#14120E] hover:bg-[#181510] border border-white/5 hover:border-[#D4AF37]/40 transition-all duration-200 shadow-md cursor-pointer flex flex-col justify-between text-left"
              >
                {/* Topic Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-base text-[#F5D77F] group-hover:text-[#FFF0B8] transition truncate">
                        {topicName}
                      </h3>
                      {linkedGoal && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#D4AF37] mt-0.5 truncate font-medium">
                          <Target className="w-3 h-3 text-[#D4AF37] shrink-0" />
                          <span>Goal: {linkedGoal.name}</span>
                        </div>
                      )}
                    </div>

                    {/* Delete Topic Button */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteTopic(topicName, e)}
                        className="p-1.5 rounded-xl opacity-0 group-hover:opacity-100 text-[#6E675B] hover:text-rose-400 hover:bg-white/5 transition"
                        title="Delete topic"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Latest Note Snippet or Placeholder */}
                  <div className="mt-2.5 p-2.5 rounded-xl bg-[#1B1812] border border-white/5 text-xs text-left">
                    {latestNote ? (
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-[#8A8275] font-mono mb-1">
                          <span>Latest note</span>
                          <span>{latestNote.date} • {latestNote.time || '12:00'}</span>
                        </div>
                        <p className="text-[#EDE8D0]/90 line-clamp-2 leading-relaxed text-left">
                          {latestNote.content || (latestNote.images ? '📷 [Photo note]' : '')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-[11px] text-[#6E675B] italic text-left">
                        No notes yet. Click the + button at bottom to write your first note.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Footer: Notes Count & Plus Symbol at Bottom of Card */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[11px] text-[#9E9689]">
                  <span className="font-mono">
                    {topicNotes.length} {topicNotes.length === 1 ? 'note' : 'notes'}
                  </span>

                  {/* Plus symbol for notes level at bottom of card */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setQuickAddTopic(topicName);
                    }}
                    className="flex items-center gap-1 py-1 px-2.5 rounded-xl bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#F5D77F] hover:text-black border border-[#D4AF37]/30 transition shadow-sm font-semibold text-xs"
                    title={`Add note to ${topicName}`}
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Add Note</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PLUS BUTTON TO CREATE NEW JOURNAL TOPIC AT BOTTOM OF MAIN TAB PAGE */}
      <div className="pt-4 flex justify-center">
        <button
          onClick={() => setIsNewTopicModalOpen(true)}
          className="w-full max-w-md py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-black font-bold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_28px_rgba(212,175,55,0.5)] active:scale-[0.99] transition cursor-pointer"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Create New Journal Topic</span>
        </button>
      </div>

      {/* MODAL: DIRECT QUICK ADD NOTE FROM CARD BOTTOM "+" */}
      {quickAddTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl bg-[#14120E] border border-[#D4AF37]/30 p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#F5D77F]">
                    Add Note to "{quickAddTopic}"
                  </h3>
                  <p className="text-[10px] text-[#8A8275]">
                    Timestamp: {todayStr} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setQuickAddTopic(null);
                  setQuickNoteImages([]);
                }}
                className="text-[#8A8275] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickNote} className="space-y-4">
              <div>
                <label className="block text-xs text-[#9E9689] mb-1 font-mono">
                  Your Note / Insight / Observation
                </label>
                <textarea
                  value={quickNoteText}
                  onChange={(e) => setQuickNoteText(e.target.value)}
                  placeholder="Type your notes here..."
                  rows={4}
                  className="w-full bg-[#1C1811] border border-white/10 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-[#EDE8D0] placeholder-[#6E675B] focus:outline-none"
                  autoFocus
                />
              </div>

              {/* Photo Previews in Quick Add */}
              {quickNoteImages.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {quickNoteImages.map((img, i) => (
                    <div key={i} className="relative w-14 h-14 rounded-xl overflow-hidden border border-[#D4AF37]/40 shrink-0">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setQuickNoteImages(prev => prev.filter((_, idx) => idx !== i))}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-black/80 text-white hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <label className="p-2 rounded-xl bg-[#1C1811] hover:bg-[#D4AF37]/15 text-[#D4AF37] hover:text-[#F5D77F] border border-white/10 cursor-pointer flex items-center gap-1.5 text-xs transition">
                  <ImageIcon className="w-4 h-4" />
                  <span>Attach Photo</span>
                  <input
                    ref={quickFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, 'quick')}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddTopic(null);
                      setQuickNoteImages([]);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#9E9689]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!quickNoteText.trim() && quickNoteImages.length === 0}
                    className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F5D77F] text-black font-bold text-xs disabled:opacity-40 transition"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW TOPIC */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl bg-[#14120E] border border-[#D4AF37]/30 p-5 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37]">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#F5D77F]">
                    Create New Journal Topic
                  </h3>
                  <p className="text-[10px] text-[#8A8275]">
                    Topics house your WhatsApp-style notes & insights
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsNewTopicModalOpen(false);
                  if (onCloseAddModal) onCloseAddModal();
                }}
                className="text-[#8A8275] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4">
              <div>
                <label className="block text-xs text-[#9E9689] mb-1.5 font-mono">
                  Topic Name *
                </label>
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="e.g. Distributed Systems, Fitness Strategy..."
                  className="w-full bg-[#1C1811] border border-white/10 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#EDE8D0] placeholder-[#6E675B] focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs text-[#9E9689] mb-1.5 font-mono">
                  Link to Goal (Optional)
                </label>
                <select
                  value={newTopicGoalId}
                  onChange={(e) => setNewTopicGoalId(e.target.value)}
                  className="w-full bg-[#1C1811] border border-white/10 focus:border-[#D4AF37] rounded-xl px-3 py-2 text-xs text-[#EDE8D0] focus:outline-none"
                >
                  <option value="">No linked goal</option>
                  {goals.map(g => (
                    <option key={g.id} value={g.id}>
                      🎯 {g.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsNewTopicModalOpen(false);
                    if (onCloseAddModal) onCloseAddModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#9E9689]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTopicName.trim()}
                  className="px-5 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F5D77F] text-black font-bold text-xs disabled:opacity-40 transition"
                >
                  Create & Open
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
