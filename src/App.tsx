import React, { useState, useEffect, useRef } from 'react';
import { AppState, CalendarEvent, CelebrationData, Goal, Habit, MoodType, Subtask, TabType, ThemePalette, UnlockedBadge } from './types';
import {
  calculateGoalProgress,
  calculateLevel,
  getInitialState,
  getTodayString,
  saveState,
  updateStreak
} from './utils/storage';
import { playChime, playCompletionTick, playFanfare, playLevelUp, sounds } from './utils/audio';
import { fireConfetti } from './utils/confetti';
import { checkNewStreakBadges } from './utils/badges';
import { applyPaletteToDOM } from './utils/themePalettes';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { HomeDashboard } from './components/HomeDashboard';
import { HabitsTracker } from './components/HabitsTracker';
import { GoalsTracker } from './components/GoalsTracker';
import { CalendarView } from './components/CalendarView';
import { MoodTracker } from './components/MoodTracker';
import { CelebrationModal } from './components/CelebrationModal';
import { SubtasksModal } from './components/SubtasksModal';
import { GoalNoteModal } from './components/GoalNoteModal';
import { LinkedHabitsModal } from './components/LinkedHabitsModal';
import { ExportModal } from './components/ExportModal';
import { AchievementsModal } from './components/AchievementsModal';
import { ThemePaletteModal } from './components/ThemePaletteModal';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [state, setState] = useState<AppState>(() => getInitialState());
  const [currentTab, setCurrentTab] = useState<TabType>('home');

  // Modals state
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isPaletteModalOpen, setIsPaletteModalOpen] = useState<boolean>(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState<boolean>(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState<boolean>(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);

  // Goal specific modals
  const [activeSubtasksGoal, setActiveSubtasksGoal] = useState<Goal | null>(null);
  const [activeNoteGoal, setActiveNoteGoal] = useState<Goal | null>(null);
  const [activeLinkedHabitsGoal, setActiveLinkedHabitsGoal] = useState<Goal | null>(null);

  // Celebration state
  const [celebrationData, setCelebrationData] = useState<CelebrationData | null>(null);

  // Save to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Keep sound manager state in sync
  useEffect(() => {
    sounds.enabled = state.soundEnabled;
  }, [state.soundEnabled]);

  // Keep dark/light theme class on html/body
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Apply luxury theme palette to DOM CSS variables
  useEffect(() => {
    applyPaletteToDOM(state.palette || 'gold');
  }, [state.palette]);

  // -------------------------------------------------------------
  // XP & Level-up Engine Helper
  // -------------------------------------------------------------
  const awardXP = (amount: number, reason: string) => {
    setState(prev => {
      const newXP = prev.stats.xp + amount;
      const currentLevel = prev.stats.level;
      const newLevel = calculateLevel(newXP);

      if (newLevel > currentLevel) {
        playLevelUp();
        fireConfetti();
        setCelebrationData({
          title: `Ascended to Level ${newLevel}!`,
          subtitle: `Prestige rank unlocked with distinction. Keep building daily momentum.`,
          type: 'levelup',
          xpEarned: amount,
        });
      }

      return {
        ...prev,
        stats: {
          ...prev.stats,
          xp: newXP,
          level: newLevel,
        }
      };
    });
  };

  // -------------------------------------------------------------
  // Swipe Left/Right Navigation on Screen (iPhone gesture feel)
  // -------------------------------------------------------------
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const tabList: TabType[] = ['home', 'habits', 'goals', 'calendar', 'settings'];

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    // Must be predominantly horizontal gesture with at least 60px swipe
    if (Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      const currentIndex = tabList.indexOf(currentTab);
      if (deltaX < 0 && currentIndex < tabList.length - 1) {
        // Swipe left -> Next tab
        setCurrentTab(tabList[currentIndex + 1]);
        playChime();
      } else if (deltaX > 0 && currentIndex > 0) {
        // Swipe right -> Previous tab
        setCurrentTab(tabList[currentIndex - 1]);
        playChime();
      }
    }
  };

  // -------------------------------------------------------------
  // Theme & Sound Toggle
  // -------------------------------------------------------------
  const handleToggleTheme = () => {
    setState(prev => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  };

  const handleSelectPalette = (palette: ThemePalette) => {
    setState(prev => ({
      ...prev,
      palette,
    }));
    applyPaletteToDOM(palette);
    playChime();
  };

  const handleToggleSound = () => {
    setState(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  // -------------------------------------------------------------
  // Habit Operations
  // -------------------------------------------------------------
  const handleToggleHabit = (habitId: string, customDate?: string) => {
    const targetDate = customDate || getTodayString();
    let wasCompleted = false;

    setState(prev => {
      const updatedHabits = prev.habits.map(habit => {
        if (habit.id === habitId) {
          const isDone = habit.completedDates.includes(targetDate);
          let newDates: string[];
          if (isDone) {
            newDates = habit.completedDates.filter(d => d !== targetDate);
          } else {
            newDates = [...habit.completedDates, targetDate];
            wasCompleted = true;
          }
          return { ...habit, completedDates: newDates };
        }
        return habit;
      });

      // Update streak
      const newStreak = updateStreak(updatedHabits);

      // Check for streak badges (7, 14, 21, 30, 100 days)
      const currentBadges = prev.unlockedBadges || [];
      const newBadges = checkNewStreakBadges(newStreak, currentBadges);

      let updatedBadges = [...currentBadges];
      let bonusXP = 0;

      if (newBadges.length > 0) {
        newBadges.forEach(badge => {
          const newUnlock: UnlockedBadge = {
            badgeId: badge.id,
            unlockedAt: targetDate,
            timestamp: Date.now(),
          };
          updatedBadges.push(newUnlock);
          bonusXP += badge.xpReward;
        });

        // Trigger celebration pop-up for the newly earned badge
        const latestBadge = newBadges[0];
        setTimeout(() => {
          playFanfare();
          fireConfetti();
          setCelebrationData({
            title: `Badge Unlocked: ${latestBadge.title}!`,
            subtitle: `${latestBadge.codename} (${latestBadge.daysRequired} Days Streak). ${latestBadge.description}`,
            type: 'badge',
            xpEarned: latestBadge.xpReward,
          });
        }, 350);
      }

      const updatedXP = prev.stats.xp + bonusXP;
      const updatedLevel = calculateLevel(updatedXP);

      return {
        ...prev,
        habits: updatedHabits,
        unlockedBadges: updatedBadges,
        stats: {
          ...prev.stats,
          streak: newStreak,
          xp: updatedXP,
          level: updatedLevel,
        }
      };
    });

    if (wasCompleted) {
      playCompletionTick();
      awardXP(25, 'Habit completed');
    }
  };

  const handleAddHabit = (name: string, icon: string, color: string) => {
    setState(prev => {
      const newHabit: Habit = {
        id: `habit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        icon,
        color,
        createdAt: getTodayString(),
        order: prev.habits.length,
        completedDates: [],
      };
      return {
        ...prev,
        habits: [...prev.habits, newHabit],
      };
    });

    playChime();
    awardXP(10, 'Habit created');
  };

  const handleDeleteHabit = (id: string) => {
    setState(prev => ({
      ...prev,
      habits: prev.habits.filter(h => h.id !== id),
    }));
  };

  const handleReorderHabits = (reordered: Habit[]) => {
    setState(prev => ({
      ...prev,
      habits: reordered,
    }));
  };

  // -------------------------------------------------------------
  // Goal Operations
  // -------------------------------------------------------------
  const handleAddGoal = (name: string, startDate: string, targetDate?: string) => {
    setState(prev => {
      const newGoal: Goal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name,
        startDate,
        targetDate,
        isDone: false,
        order: prev.goals.length,
        subtasks: [],
        notes: [],
        linkedHabitIds: [],
      };
      return {
        ...prev,
        goals: [newGoal, ...prev.goals],
      };
    });

    playChime();
    awardXP(20, 'Goal established');
  };

  const handleEditGoal = (goalId: string, name: string, startDate: string, targetDate?: string) => {
    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          return { ...g, name, startDate, targetDate };
        }
        return g;
      })
    }));
  };

  const handleToggleGoalComplete = (goalId: string) => {
    let nowDone = false;
    let goalName = '';

    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          nowDone = !g.isDone;
          goalName = g.name;
          return {
            ...g,
            isDone: nowDone,
            doneDate: nowDone ? getTodayString() : undefined,
          };
        }
        return g;
      })
    }));

    if (nowDone) {
      playFanfare();
      fireConfetti();
      awardXP(100, 'Goal completed');
      setCelebrationData({
        title: 'Mastery Achieved!',
        subtitle: `"${goalName}" marked complete. Strategic objective accomplished.`,
        type: 'goal',
        xpEarned: 100,
      });
    }
  };

  const handleReorderGoals = (reordered: Goal[]) => {
    setState(prev => ({
      ...prev,
      goals: reordered,
    }));
  };

  // Subtasks Operations
  const handleToggleSubtask = (goalId: string, subtaskId: string) => {
    let completed = false;
    let newProgress = 0;
    let goalName = '';

    setState(prev => {
      const updatedGoals = prev.goals.map(goal => {
        if (goal.id === goalId) {
          goalName = goal.name;
          const prevProgress = calculateGoalProgress(goal);
          const updatedSubtasks = goal.subtasks.map(st => {
            if (st.id === subtaskId) {
              completed = !st.isDone;
              return { ...st, isDone: completed };
            }
            return st;
          });

          const updatedGoal = { ...goal, subtasks: updatedSubtasks };
          newProgress = calculateGoalProgress(updatedGoal);

          // Milestone check: 25%, 50%, 75%
          if (completed) {
            const milestones = [25, 50, 75];
            for (const m of milestones) {
              if (prevProgress < m && newProgress >= m) {
                setTimeout(() => {
                  playFanfare();
                  fireConfetti();
                  setCelebrationData({
                    title: `${m}% Milestone Unlocked!`,
                    subtitle: `Surpassed ${m}% of "${goalName}". Great consistency!`,
                    type: 'milestone',
                    milestonePercentage: m,
                    xpEarned: 50,
                  });
                }, 100);
              }
            }
            if (newProgress === 100) {
              setTimeout(() => {
                playFanfare();
                fireConfetti();
                setCelebrationData({
                  title: 'All Subtasks Done!',
                  subtitle: `Ready to mark "${goalName}" complete!`,
                  type: 'subtasks',
                  xpEarned: 50,
                });
              }, 100);
            }
          }

          return updatedGoal;
        }
        return goal;
      });

      return { ...prev, goals: updatedGoals };
    });

    if (completed) {
      playCompletionTick();
      awardXP(15, 'Subtask completed');
    }

    // Update active modal reference if open
    setActiveSubtasksGoal(prev => {
      if (prev && prev.id === goalId) {
        const found = state.goals.find(g => g.id === goalId);
        return found || null;
      }
      return prev;
    });
  };

  const handleAddSubtask = (goalId: string, name: string) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const newSubtask: Subtask = {
            id: `st_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            name,
            isDone: false,
            order: g.subtasks.length,
          };
          const updated = { ...g, subtasks: [...g.subtasks, newSubtask] };
          setActiveSubtasksGoal(updated);
          return updated;
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });

    playChime();
    awardXP(15, 'Subtask added');
  };

  const handleDeleteSubtask = (goalId: string, subtaskId: string) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const updated = { ...g, subtasks: g.subtasks.filter(s => s.id !== subtaskId) };
          setActiveSubtasksGoal(updated);
          return updated;
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleUpdateSubtaskDate = (goalId: string, subtaskId: string, dueDate?: string) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const updated = {
            ...g,
            subtasks: g.subtasks.map(s => (s.id === subtaskId ? { ...s, dueDate } : s))
          };
          setActiveSubtasksGoal(updated);
          return updated;
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleUpdateSubtaskNote = (goalId: string, subtaskId: string, note?: string) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const updated = {
            ...g,
            subtasks: g.subtasks.map(s => (s.id === subtaskId ? { ...s, note } : s))
          };
          setActiveSubtasksGoal(updated);
          return updated;
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  const handleReorderSubtasks = (goalId: string, reordered: Subtask[]) => {
    setState(prev => {
      const updatedGoals = prev.goals.map(g => {
        if (g.id === goalId) {
          const updated = { ...g, subtasks: reordered };
          setActiveSubtasksGoal(updated);
          return updated;
        }
        return g;
      });
      return { ...prev, goals: updatedGoals };
    });
  };

  // Goal Notes & Linked Habits
  const handleSaveGoalNote = (text: string) => {
    if (!activeNoteGoal) return;
    const goalId = activeNoteGoal.id;
    const newNote = {
      id: `note_${Date.now()}`,
      date: getTodayString(),
      text,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          return {
            ...g,
            notes: [...(g.notes || []), newNote]
          };
        }
        return g;
      })
    }));

    playChime();
    awardXP(10, 'Goal note logged');
  };

  const handleSaveLinkedHabits = (selectedIds: string[]) => {
    if (!activeLinkedHabitsGoal) return;
    const goalId = activeLinkedHabitsGoal.id;

    setState(prev => ({
      ...prev,
      goals: prev.goals.map(g => {
        if (g.id === goalId) {
          return { ...g, linkedHabitIds: selectedIds };
        }
        return g;
      })
    }));

    playChime();
  };

  // -------------------------------------------------------------
  // Calendar Events Operations
  // -------------------------------------------------------------
  const handleAddEvent = (title: string, date: string, time?: string) => {
    const newEvent: CalendarEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      date,
      time,
    };

    setState(prev => ({
      ...prev,
      calendarEvents: [...prev.calendarEvents, newEvent],
    }));

    playChime();
  };

  // -------------------------------------------------------------
  // Mood Operations
  // -------------------------------------------------------------
  const handleSaveMood = (mood: MoodType, emoji: string, label: string, note?: string) => {
    const todayStr = getTodayString();
    const newEntry = {
      id: `mood_${Date.now()}`,
      date: todayStr,
      timestamp: Date.now(),
      mood,
      emoji,
      label,
      note,
    };

    setState(prev => {
      // Overwrite if entry on same day exists
      const filtered = prev.moodEntries.filter(m => m.date !== todayStr);
      return {
        ...prev,
        moodEntries: [newEntry, ...filtered],
      };
    });

    playCompletionTick();
    awardXP(10, 'Mood logged');
  };

  // -------------------------------------------------------------
  // Floating + Button Click Behavior
  // -------------------------------------------------------------
  const handleFloatingAdd = () => {
    playChime();
    if (currentTab === 'home' || currentTab === 'habits') {
      setIsAddHabitModalOpen(true);
    } else if (currentTab === 'goals') {
      setIsAddGoalModalOpen(true);
    } else if (currentTab === 'calendar') {
      setIsAddEventModalOpen(true);
    } else {
      setIsAddHabitModalOpen(true);
    }
  };

  // -------------------------------------------------------------
  // Export / Backup State Updates
  // -------------------------------------------------------------
  const handleRecordExport = () => {
    setState(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        lastExportTimestamp: Date.now(),
      }
    }));
  };

  const handleImportState = (newState: AppState) => {
    setState(newState);
    playLevelUp();
    fireConfetti();
  };

  const handleResetData = () => {
    localStorage.clear();
    const fresh = getInitialState();
    fresh.habits = [];
    fresh.goals = [];
    fresh.calendarEvents = [];
    fresh.moodEntries = [];
    fresh.unlockedBadges = [];
    fresh.palette = 'gold';
    fresh.stats.xp = 0;
    fresh.stats.level = 1;
    fresh.stats.streak = 0;
    setState(fresh);
  };

  // Ensure activeSubtasksGoal stays synced with current state
  const currentSubtasksGoal = activeSubtasksGoal
    ? state.goals.find(g => g.id === activeSubtasksGoal.id) || null
    : null;

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundColor: 'var(--apex-bg, #090807)',
        color: 'var(--apex-text, #EDE8D0)',
      }}
      className="apex-app-root min-h-screen font-sans antialiased selection:bg-[#D4AF37]/30 selection:text-[#FFF0B8] transition-colors duration-300"
    >
      {/* Safe Area & Centered App Shell for iPhone 16 Pro Max */}
      <div className="max-w-md mx-auto min-h-screen flex flex-col pt-safe px-4 relative">
        {/* Top Header - ONLY displayed on 1st tab (Today / Home) */}
        {currentTab === 'home' && (
          <Header
            stats={state.stats}
            theme={state.theme}
            soundEnabled={state.soundEnabled}
            onToggleTheme={handleToggleTheme}
            onToggleSound={handleToggleSound}
            onOpenExport={() => setIsExportModalOpen(true)}
            onOpenAchievements={() => setIsAchievementsOpen(true)}
            onOpenPalettes={() => setIsPaletteModalOpen(true)}
            onOpenSettings={() => setCurrentTab('settings')}
          />
        )}

        {/* Tab Views */}
        <main className="flex-1 mt-2">
          {currentTab === 'home' && (
            <HomeDashboard
              state={state}
              onToggleHabit={handleToggleHabit}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenExport={() => setIsExportModalOpen(true)}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              onOpenPalettes={() => setIsPaletteModalOpen(true)}
              onOpenSettings={() => setCurrentTab('settings')}
              onSaveMood={handleSaveMood}
            />
          )}

          {currentTab === 'habits' && (
            <HabitsTracker
              habits={state.habits}
              onToggleHabit={handleToggleHabit}
              onAddHabit={handleAddHabit}
              onDeleteHabit={handleDeleteHabit}
              onReorderHabits={handleReorderHabits}
              isAddModalOpen={isAddHabitModalOpen}
              onCloseAddModal={() => setIsAddHabitModalOpen(false)}
              streak={state.stats.streak}
            />
          )}

          {currentTab === 'goals' && (
            <GoalsTracker
              goals={state.goals}
              habits={state.habits}
              onToggleGoalComplete={handleToggleGoalComplete}
              onOpenSubtasksModal={(goal) => setActiveSubtasksGoal(goal)}
              onOpenNoteModal={(goal) => setActiveNoteGoal(goal)}
              onOpenLinkedHabitsModal={(goal) => setActiveLinkedHabitsGoal(goal)}
              onAddGoal={handleAddGoal}
              onEditGoal={handleEditGoal}
              onReorderGoals={handleReorderGoals}
              onToggleHabit={handleToggleHabit}
              isAddModalOpen={isAddGoalModalOpen}
              onCloseAddModal={() => setIsAddGoalModalOpen(false)}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarView
              state={state}
              onToggleHabitOnDate={handleToggleHabit}
              onAddEvent={handleAddEvent}
              isAddEventModalOpen={isAddEventModalOpen}
              onCloseAddEventModal={() => setIsAddEventModalOpen(false)}
            />
          )}

          {currentTab === 'mood' && (
            <MoodTracker
              moodEntries={state.moodEntries}
              onSaveMood={handleSaveMood}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              currentPalette={state.palette || 'gold'}
              onSelectPalette={handleSelectPalette}
              theme={state.theme}
              onToggleTheme={handleToggleTheme}
              soundEnabled={state.soundEnabled}
              onToggleSound={handleToggleSound}
              stats={state.stats}
              unlockedBadges={state.unlockedBadges || []}
              totalHabits={state.habits.length}
              totalGoals={state.goals.length}
              onOpenAchievements={() => setIsAchievementsOpen(true)}
              onOpenExport={() => setIsExportModalOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <Navigation
          currentTab={currentTab}
          onSelectTab={(tab) => {
            playChime();
            setCurrentTab(tab);
          }}
          onFloatingAddClick={handleFloatingAdd}
        />
      </div>

      {/* Global Modals */}
      {/* 1. Subtasks Modal */}
      {currentSubtasksGoal && (
        <SubtasksModal
          goal={currentSubtasksGoal}
          isOpen={!!activeSubtasksGoal}
          onClose={() => setActiveSubtasksGoal(null)}
          onToggleSubtask={handleToggleSubtask}
          onAddSubtask={handleAddSubtask}
          onDeleteSubtask={handleDeleteSubtask}
          onUpdateSubtaskDate={handleUpdateSubtaskDate}
          onUpdateSubtaskNote={handleUpdateSubtaskNote}
          onReorderSubtasks={handleReorderSubtasks}
        />
      )}

      {/* 2. Goal Note Modal */}
      {activeNoteGoal && (
        <GoalNoteModal
          goalName={activeNoteGoal.name}
          isOpen={!!activeNoteGoal}
          onClose={() => setActiveNoteGoal(null)}
          onSaveNote={handleSaveGoalNote}
        />
      )}

      {/* 3. Linked Habits Modal */}
      {activeLinkedHabitsGoal && (
        <LinkedHabitsModal
          goalName={activeLinkedHabitsGoal.name}
          allHabits={state.habits}
          linkedHabitIds={activeLinkedHabitsGoal.linkedHabitIds || []}
          isOpen={!!activeLinkedHabitsGoal}
          onClose={() => setActiveLinkedHabitsGoal(null)}
          onSaveLinkedHabits={handleSaveLinkedHabits}
        />
      )}

      {/* 4. Export & Data Vault Modal */}
      <ExportModal
        state={state}
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onImportState={handleImportState}
        onResetData={handleResetData}
        onRecordExport={handleRecordExport}
      />

      {/* 5. Full Screen Celebration Overlay */}
      <CelebrationModal
        data={celebrationData}
        onDismiss={() => setCelebrationData(null)}
      />

      {/* 6. Hall of Achievements Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
        streak={state.stats.streak}
        unlockedBadges={state.unlockedBadges || []}
      />

      {/* 7. Theme & Color Palette Selector Modal */}
      <ThemePaletteModal
        isOpen={isPaletteModalOpen}
        onClose={() => setIsPaletteModalOpen(false)}
        currentPalette={state.palette || 'gold'}
        onSelectPalette={handleSelectPalette}
      />
    </div>
  );
}
