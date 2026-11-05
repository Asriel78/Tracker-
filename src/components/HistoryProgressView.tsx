import React, { useState } from 'react';
import { CompletedWorkout, PersonalRecord } from '../types/workout';
import { Trophy, Calendar, Clock, Dumbbell, ChevronDown, ChevronUp, Star } from 'lucide-react';

interface HistoryProgressViewProps {
  completedWorkouts: CompletedWorkout[];
  personalRecords: PersonalRecord[];
}

export function HistoryProgressView({
  completedWorkouts,
  personalRecords,
}: HistoryProgressViewProps) {
  const [expandedWorkoutId, setExpandedWorkoutId] = useState<string | null>(
    completedWorkouts[0]?.id || null
  );

  const toggleWorkout = (id: string) => {
    setExpandedWorkoutId((prev) => (prev === id ? null : id));
  };

  const totalAllTimeTonnage = completedWorkouts.reduce(
    (acc, curr) => acc + (curr.totalTonnageKg || 0),
    0
  );

  const totalSetsDone = completedWorkouts.reduce(
    (acc, curr) => acc + (curr.completedSetsCount || 0),
    0
  );

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Overview Cards */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-4">
          Прогресс и история тренировок
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-xs text-slate-400">Тренировок выполнено</div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums mt-1">
              {completedWorkouts.length}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-xs text-slate-400">Общий поднятый вес</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1">
              {totalAllTimeTonnage.toLocaleString('ru-RU')} <span className="text-xs font-normal text-slate-400">кг</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-xs text-slate-400">Подходов закрыто</div>
            <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums mt-1">
              {totalSetsDone}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-left">
            <div className="text-xs text-slate-400">Рекордов зафиксировано</div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums mt-1">
              {personalRecords.length}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Records Showcase */}
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Личные рекорды в ключевых движениях</span>
          </h2>
          <span className="text-xs text-slate-400">Расчетный 1RM</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {personalRecords.map((pr) => (
            <div
              key={pr.exerciseName}
              className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 line-clamp-1">{pr.exerciseName}</div>
                <div className="text-xl font-bold font-mono text-white tabular-nums mt-1">
                  {pr.maxWeightKg} кг <span className="text-xs text-slate-400 font-normal">× {pr.repsAtMax} повт</span>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-amber-400 font-bold font-mono">1RM: ~{pr.calculated1RM} кг</span>
                <span className="text-slate-500 text-[11px]">{pr.achievedDate}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Workouts Log */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Журнал выполненных тренировок:
        </h2>

        {completedWorkouts.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm">
            Вы пока не завершили ни одной тренировки. Выполните сегодняшнюю программу во вкладке «Сегодня»!
          </div>
        ) : (
          completedWorkouts.map((workout) => {
            const isExpanded = expandedWorkoutId === workout.id;
            const mins = Math.floor(workout.durationSeconds / 60);

            return (
              <div
                key={workout.id}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggleWorkout(workout.id)}
                  className="w-full p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-slate-800/40 transition-colors"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-0.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{formatDate(workout.date)}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        {mins} мин
                      </span>
                      {workout.rpeRating && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-amber-400 font-semibold font-mono">RPE {workout.rpeRating}</span>
                        </>
                      )}
                    </div>
                    <div className="text-base font-bold text-white">
                      {workout.dayTitle}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <div className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                        {workout.totalTonnageKg.toLocaleString('ru-RU')} кг
                      </div>
                      <div className="text-xs text-slate-400">
                        {workout.completedSetsCount} подходов
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                    {workout.notes && (
                      <div className="p-3 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-xl italic">
                        «{workout.notes}»
                      </div>
                    )}

                    {workout.recordsAchieved && workout.recordsAchieved.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Рекорды сессии: {workout.recordsAchieved.join(', ')}</span>
                      </div>
                    )}

                    {/* Sets snapshot */}
                    {workout.exercisesSnapshot && workout.exercisesSnapshot.length > 0 && (
                      <div className="space-y-2 mt-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Выполненные веса и подходы:
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {workout.exercisesSnapshot.map((ex, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs"
                            >
                              <div className="font-bold text-white mb-1.5">{ex.name}</div>
                              <div className="flex flex-wrap gap-1.5">
                                {ex.sets.map((s, sIdx) => (
                                  <span
                                    key={sIdx}
                                    className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 font-mono text-slate-300 tabular-nums"
                                  >
                                    {s.weightKg} кг × {s.reps}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
