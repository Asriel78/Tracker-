import React from 'react';
import { Dumbbell, Calendar, History, Wrench, Layers } from 'lucide-react';

export type NavTab = 'workout' | 'program' | 'history' | 'tools';

interface TopBarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeWorkoutDuration?: number;
  isWorkoutInProgress: boolean;
  onOpenProgramsList: () => void;
  programTitle: string;
}

export function TopBar({
  currentTab,
  onSelectTab,
  activeWorkoutDuration = 0,
  isWorkoutInProgress,
  onOpenProgramsList,
  programTitle,
}: TopBarProps) {
  const formatDuration = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element Brand wordmark */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Dumbbell className="w-4 h-4" />
          </div>
          <button
            onClick={() => onSelectTab('workout')}
            className="text-base font-extrabold tracking-tight text-white hover:text-emerald-400 transition-colors"
          >
            IronTrack
          </button>
        </div>

        {/* Zone 2: Clean text navigation tabs */}
        <nav className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium text-slate-400">
          <button
            onClick={() => onSelectTab('workout')}
            className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'workout'
                ? 'text-white bg-slate-800/80 font-semibold'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Сегодня</span>
            {isWorkoutInProgress && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>

          <button
            onClick={() => onSelectTab('program')}
            className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'program'
                ? 'text-white bg-slate-800/80 font-semibold'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Программа</span>
          </button>

          <button
            onClick={() => onSelectTab('history')}
            className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'history'
                ? 'text-white bg-slate-800/80 font-semibold'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>История</span>
          </button>

          <button
            onClick={() => onSelectTab('tools')}
            className={`px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'tools'
                ? 'text-white bg-slate-800/80 font-semibold'
                : 'hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Инструменты</span>
          </button>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-2 shrink-0">
          {isWorkoutInProgress && activeWorkoutDuration > 0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{formatDuration(activeWorkoutDuration)}</span>
            </div>
          )}

          <button
            onClick={onOpenProgramsList}
            title="Сменить программу"
            className="px-2.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 hover:text-white transition-colors flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[160px]"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{programTitle}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
