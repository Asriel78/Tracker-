import React from 'react';
import { WorkoutSession } from '../types/workoutProgram';
import { History, ArrowDownToLine } from 'lucide-react';

interface RecentSessionsBadgeProps {
  exerciseName: string;
  sessions: WorkoutSession[];
  onApplyLastWeights?: (weights: { weight: number | string; reps: number | string }[]) => void;
}

export function RecentSessionsBadge({
  exerciseName,
  sessions,
  onApplyLastWeights,
}: RecentSessionsBadgeProps) {
  // Find up to 3 most recent sessions containing this exercise
  const recentOccurrences = sessions
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
    .filter((s) => s.exercises.some((e) => e.name.toLowerCase() === exerciseName.toLowerCase()))
    .slice(0, 3)
    .map((s) => {
      const ex = s.exercises.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase());
      return {
        date: s.date,
        day: s.day,
        sets: ex ? ex.sets : [],
      };
    });

  if (recentOccurrences.length === 0) {
    return (
      <div className="font-mono text-slate-500 border border-dashed border-slate-800/80 px-2.5 py-1 text-[11px] rounded-lg mt-1 mb-2 inline-block">
        история: пока нет прошлых записей
      </div>
    );
  }

  const latestSets = recentOccurrences[0]?.sets || [];

  return (
    <div className="mt-1.5 mb-2.5 py-2 px-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs font-mono">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-emerald-400" />
          <span>ПОСЛЕДНИЕ {recentOccurrences.length} ЗАНЯТИЯ:</span>
        </span>

        {onApplyLastWeights && latestSets.length > 0 && (
          <button
            type="button"
            onClick={() => onApplyLastWeights(latestSets)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors hover:underline"
            title="Заполнить этими весами"
          >
            <ArrowDownToLine className="w-3 h-3" />
            <span>вставить веса</span>
          </button>
        )}
      </div>

      <div className="space-y-1">
        {recentOccurrences.map((occ, idx) => (
          <div key={idx} className="flex items-baseline gap-2 text-[11px]">
            <span className="text-slate-400 shrink-0 w-16">
              {occ.date.slice(5)} ({occ.day}):
            </span>
            <span className="text-slate-200 font-medium truncate">
              {occ.sets.map((st, sIdx) => (
                <span key={sIdx} className="inline-block mr-2">
                  <span className="text-emerald-400 font-bold">{st.weight}</span>
                  <span className="text-slate-500 text-[10px]">×</span>
                  <span className="text-slate-100">{st.reps}</span>
                </span>
              ))}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
