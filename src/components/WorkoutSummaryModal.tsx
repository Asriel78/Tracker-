import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Dumbbell, Star, CheckCircle, X } from 'lucide-react';
import { CompletedWorkout } from '../types/workout';

interface WorkoutSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayTitle: string;
  durationSeconds: number;
  totalTonnage: number;
  completedSets: number;
  totalSets: number;
  onSaveCompletedWorkout: (data: { rpeRating: number; notes: string }) => void;
}

export function WorkoutSummaryModal({
  isOpen,
  onClose,
  dayTitle,
  durationSeconds,
  totalTonnage,
  completedSets,
  totalSets,
  onSaveCompletedWorkout,
}: WorkoutSummaryModalProps) {
  const [rpe, setRpe] = useState(8);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#6ee7b7', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const mins = Math.floor(durationSeconds / 60);
  const secs = durationSeconds % 60;
  const formattedDuration = `${mins} мин ${secs > 0 ? `${secs} сек` : ''}`;

  const rpeLabels: Record<number, string> = {
    5: 'Разминочная нагрузка',
    6: 'Легко, большой запас',
    7: 'Умеренно, запас 3 повтора',
    8: 'Идеально, запас 2 повтора',
    9: 'Очень тяжело, запас 1 повтор',
    10: 'Максимальный отказ (RPE 10)',
  };

  const handleSave = () => {
    onSaveCompletedWorkout({
      rpeRating: rpe,
      notes,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white">Тренировка завершена!</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">{dayTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-2.5 my-5">
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-slate-500 mb-1">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-400">Время</div>
            <div className="text-base font-bold font-mono text-white mt-0.5">
              {formattedDuration}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-emerald-500 mb-1">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-400">Тоннаж</div>
            <div className="text-base font-bold font-mono text-emerald-400 mt-0.5 tabular-nums">
              {totalTonnage.toLocaleString('ru-RU')} <span className="text-xs font-normal">кг</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center">
            <div className="flex items-center justify-center text-blue-400 mb-1">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="text-xs text-slate-400">Подходы</div>
            <div className="text-base font-bold font-mono text-white mt-0.5 tabular-nums">
              {completedSets} / {totalSets}
            </div>
          </div>
        </div>

        {/* RPE & Fatigue Assessment */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Оценка нагрузки (RPE):</span>
            <span className="font-mono font-bold text-emerald-400">
              {rpe}/10 — {rpeLabels[rpe] || 'Средне'}
            </span>
          </div>
          <input
            type="range"
            min="5"
            max="10"
            step="1"
            value={rpe}
            onChange={(e) => setRpe(parseInt(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
        </div>

        {/* Notes */}
        <div className="space-y-1.5 mb-6">
          <label className="text-xs font-semibold text-slate-300 block">
            Заметки по самочувствию и весам:
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Например: В жиме запас 1 повтор, отличный памп в трицепсе..."
            className="w-full px-3 py-2 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSave}
          className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
        >
          Сохранить тренировку в историю
        </button>
      </div>
    </div>
  );
}
