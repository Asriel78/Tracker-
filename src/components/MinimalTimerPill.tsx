import React, { useEffect, useRef } from 'react';
import { Timer, X, Plus, Minus } from 'lucide-react';
import { playCountdownTick, playTimerFinishBeep } from '../utils/audio';

interface MinimalTimerPillProps {
  remainingSeconds: number;
  isRunning: boolean;
  onAdjust: (delta: number) => void;
  onClose: () => void;
}

export function MinimalTimerPill({
  remainingSeconds,
  isRunning,
  onAdjust,
  onClose,
}: MinimalTimerPillProps) {
  const lastSecondRef = useRef(remainingSeconds);

  useEffect(() => {
    if (!isRunning) return;
    if (remainingSeconds <= 3 && remainingSeconds > 0 && remainingSeconds !== lastSecondRef.current) {
      playCountdownTick();
    } else if (remainingSeconds === 0 && lastSecondRef.current !== 0) {
      playTimerFinishBeep();
    }
    lastSecondRef.current = remainingSeconds;
  }, [remainingSeconds, isRunning]);

  if (remainingSeconds <= 0) return null;

  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeFormatted = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 animate-slideUp">
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <Timer className="w-4 h-4 animate-spin-slow" />
          <span className="text-xs font-medium text-slate-400">Отдых:</span>
          <span className="font-mono font-bold text-sm text-white tabular-nums">
            {timeFormatted}
          </span>
        </div>

        <div className="flex items-center gap-1 pl-1 border-l border-slate-700/60">
          <button
            onClick={() => onAdjust(-15)}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px]"
            title="-15 сек"
          >
            <Minus className="w-3 h-3" />
          </button>
          <button
            onClick={() => onAdjust(30)}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-[10px]"
            title="+30 сек"
          >
            <Plus className="w-3 h-3" />
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
            title="Пропустить отдых"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
