import React from 'react';
import { CompletedWorkout } from '../types/workout';
import { X, Calendar } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workouts: CompletedWorkout[];
}

export function HistoryDrawer({ isOpen, onClose, workouts }: HistoryDrawerProps) {
  if (!isOpen) return null;

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>История тренировок</span>
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 overflow-y-auto flex-1">
          {workouts.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              Пока нет сохраненных тренировок
            </div>
          ) : (
            workouts.map((w) => (
              <div
                key={w.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{w.dayTitle}</div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    {formatDate(w.date)} · {w.completedSetsCount} подходов
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-400">
                    {w.totalTonnageKg.toLocaleString('ru-RU')} кг
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {Math.round(w.durationSeconds / 60)} мин
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
