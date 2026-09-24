import React from 'react';
import { Home, CheckSquare, CircleDot, Calendar, Settings, Plus, Sparkles } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onFloatingAddClick: () => void;
  layoutMode?: 'b' | 'c';
  onOpenSettings?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  onFloatingAddClick,
}) => {
  // 5 Focused Executive Tabs: Today, Habits, Goals, Timeline, Settings
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Today', icon: <Home className="w-5 h-5" /> },
    { id: 'habits', label: 'Habits', icon: <CheckSquare className="w-5 h-5" /> },
    { id: 'goals', label: 'Goals', icon: <CircleDot className="w-5 h-5" /> },
    { id: 'calendar', label: 'Timeline', icon: <Calendar className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none">
      <div className="max-w-md mx-auto relative px-3 pb-2">
        {/* Floating Quick Action Button (+ button positioned on right thumb zone) */}
        <div className="absolute -top-16 right-3 pointer-events-auto z-50">
          <button
            onClick={onFloatingAddClick}
            aria-label="Add new item"
            className="group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#AA7C11] via-[#D4AF37] to-[#F5D77F] text-[#090807] shadow-[0_8px_25px_rgba(212,175,55,0.45)] border-2 border-[#14120E] active:scale-90 hover:scale-105 transition-all duration-200"
          >
            <Plus className="w-6 h-6 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
            <span className="sr-only">Quick Add</span>
          </button>
        </div>

        {/* Bottom Nav Bar - Clean, spacious 5-tab bar */}
        <nav className="pointer-events-auto flex items-center justify-between px-1.5 py-2 bg-[#12100C]/90 dark:bg-[#12100C]/95 backdrop-blur-xl rounded-2xl border border-[#D4AF37]/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {tabs.map((t) => {
            const isActive = currentTab === t.id;

            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`relative flex flex-col items-center justify-center flex-1 py-1 px-1 transition-all duration-200 select-none ${
                  isActive ? 'text-[#F5D77F]' : 'text-[#8A8275] hover:text-[#C5BEAF]'
                }`}
              >
                {/* Active Indicator Glow Pill */}
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#F5D77F] to-transparent shadow-[0_0_8px_#F5D77F]" />
                )}
                <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
                  {t.icon}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#F5D77F]' : 'font-medium'}`}>
                  {t.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
