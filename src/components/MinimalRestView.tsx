import React from 'react';
import { DayWorkoutTemplate } from '../types/workout';
import { Moon, ArrowRight } from 'lucide-react';

interface MinimalRestViewProps {
  dayTemplate: DayWorkoutTemplate;
  nextWorkoutDay?: DayWorkoutTemplate;
  onGoToNextWorkout: (dayId: string) => void;
}

export function MinimalRestView({
  dayTemplate,
  nextWorkoutDay,
  onGoToNextWorkout,
}: MinimalRestViewProps) {
  return (
    <div className="space-y-6 py-6 max-w-lg mx-auto text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400">
        <Moon className="w-7 h-7" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-bold text-white">Сегодня день отдыха</h2>
        <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
          {dayTemplate.restDescription ||
            'По программе сегодня восстановление. Спите не менее 8 часов, пейте воду и дайте мышцам восстановиться.'}
        </p>
      </div>

      {nextWorkoutDay && (
        <div className="pt-4 border-t border-slate-800/80">
          <div className="text-xs text-slate-500 mb-2">Следующая тренировка:</div>
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-emerald-400">
                {nextWorkoutDay.dayName}
              </div>
              <div className="text-sm font-bold text-white">
                {nextWorkoutDay.title}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {nextWorkoutDay.exercises.length} упражнения
              </div>
            </div>

            <button
              onClick={() => onGoToNextWorkout(nextWorkoutDay.id)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Начать</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
