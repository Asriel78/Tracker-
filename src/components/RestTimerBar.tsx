import React, { useEffect, useRef } from 'react';
import { Play, Pause, X, Plus, Minus, Volume2, VolumeX, Timer as TimerIcon } from 'lucide-react';
import { playCountdownTick, playTimerFinishBeep } from '../utils/audio';

interface RestTimerBarProps {
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  soundEnabled: boolean;
  exerciseName?: string;
  onTogglePlay: () => void;
  onAdjustSeconds: (delta: number) => void;
  onCloseTimer: () => void;
  onToggleSound: () => void;
}

export function RestTimerBar({
  totalSeconds,
  remainingSeconds,
  isRunning,
  soundEnabled,
  exerciseName,
  onTogglePlay,
  onAdjustSeconds,
  onCloseTimer,
  onToggleSound,
}: RestTimerBarProps) {
  const lastSecondRef = useRef(remainingSeconds);

  useEffect(() => {
    if (!isRunning || !soundEnabled) return;

    // Countdown beeps at 3, 2, 1
    if (remainingSeconds <= 3 && remainingSeconds > 0 && remainingSeconds !== lastSecondRef.current) {
      playCountdownTick();
    } else if (remainingSeconds === 0 && lastSecondRef.current !== 0) {
      playTimerFinishBeep();
    }
    lastSecondRef.current = remainingSeconds;
  }, [remainingSeconds, isRunning, soundEnabled]);

  const progressPercent = totalSeconds > 0 ? Math.max(0, Math.min(100, (remainingSeconds / totalSeconds) * 100)) : 0;
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const formattedTime = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
        {/* Top row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <TimerIcon className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-medium text-slate-400 truncate">
                {exerciseName ? `Отдых: ${exerciseName}` : 'Таймер отдыха'}
              </div>
              <div className="text-xl font-bold font-mono tracking-tight text-white tabular-nums flex items-baseline gap-1.5">
                <span>{formattedTime}</span>
                <span className="text-xs text-slate-400 font-normal">из {Math.floor(totalSeconds / 60)}:{((totalSeconds % 60)).toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Выключить звук' : 'Включить звук'}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            <button
              onClick={onCloseTimer}
              title="Закрыть таймер"
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              remainingSeconds <= 5 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Quick controls row */}
        <div className="flex items-center justify-between gap-1.5 pt-0.5">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onAdjustSeconds(-15)}
              className="px-2 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors flex items-center gap-0.5"
            >
              <Minus className="w-3 h-3" />
              <span>15с</span>
            </button>
            <button
              onClick={() => onAdjustSeconds(30)}
              className="px-2 py-1 text-xs font-mono font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" />
              <span>30с</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={onTogglePlay}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors flex items-center gap-1"
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Пауза</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Старт</span>
                </>
              )}
            </button>
            <button
              onClick={onCloseTimer}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors whitespace-nowrap"
            >
              Готов
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
