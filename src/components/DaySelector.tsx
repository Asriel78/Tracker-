import React from 'react';
import { DayWorkoutTemplate } from '../types/workout';
import { Moon, Dumbbell, Check } from 'lucide-react';

interface DaySelectorProps {
  days: DayWorkoutTemplate[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  completedDayIds?: string[];
}

export function DaySelector({
  days,
  selectedDayId,
  onSelectDay,
  completedDayIds = [],
}: DaySelectorProps) {
  // Current real weekday (0=Sun, 1=Mon, ..., 6=Sat)
  const realDayOfWeekIndex = (new Date().getDay() + 6) % 7; // 0=Mon ... 6=Sun

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Фиксированный график недели
        </h2>
        <span className="text-xs text-slate-500">
          7-дневный цикл
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isSelected = day.id === selectedDayId;
          const isToday = idx === realDayOfWeekIndex;
          const isCompleted = completedDayIds.includes(day.id);

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`relative flex flex-col items-center justify-between p-2 sm:p-2.5 rounded-xl border text-left transition-all ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500/80 shadow-sm shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {/* Today marker */}
              {isToday && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-emerald-500 text-slate-950 text-[9px] font-bold rounded-full uppercase tracking-tighter">
                  Сегодня
                </span>
              )}

              {/* Day short label */}
              <span className={`text-[11px] sm:text-xs font-semibold ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                {day.dayName.slice(0, 2)}
              </span>

              {/* Icon for Workout vs Rest */}
              <div className="my-1.5">
                {isCompleted ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                ) : day.isRestDay ? (
                  <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                    <Moon className="w-3 h-3" />
                  </div>
                ) : (
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    <Dumbbell className="w-3 h-3" />
                  </div>
                )}
              </div>

              {/* Exercise count or rest label */}
              <span className="text-[10px] text-slate-400 text-center truncate max-w-full">
                {day.isRestDay ? 'Отдых' : `${day.exercises.length} упр`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
