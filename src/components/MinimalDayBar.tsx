import React from 'react';
import { DayWorkoutTemplate } from '../types/workout';

interface MinimalDayBarProps {
  days: DayWorkoutTemplate[];
  selectedDayId: string;
  onSelectDay: (dayId: string) => void;
  completedDayIds?: string[];
}

export function MinimalDayBar({
  days,
  selectedDayId,
  onSelectDay,
  completedDayIds = [],
}: MinimalDayBarProps) {
  const currentDayOfWeek = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isSelected = day.id === selectedDayId;
          const isToday = idx === currentDayOfWeek;
          const isCompleted = completedDayIds.includes(day.id);

          return (
            <button
              key={day.id}
              onClick={() => onSelectDay(day.id)}
              className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center text-center ${
                isSelected
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="text-xs sm:text-sm">{day.dayName}</span>
                {isToday && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? 'bg-slate-950' : 'bg-emerald-400'
                    }`}
                  />
                )}
              </div>

              <span
                className={`text-[10px] mt-0.5 truncate max-w-full font-normal ${
                  isSelected ? 'text-slate-900/90 font-medium' : 'text-slate-500'
                }`}
              >
                {day.isRestDay ? 'Отдых' : day.title.split(' ')[0]}
              </span>

              {isCompleted && !isSelected && (
                <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
