import React, { useState } from 'react';
import {
  DayWorkoutTemplate,
  Exercise,
  ExerciseSet,
  SetType,
} from '../types/workout';
import {
  Check,
  Plus,
  Minus,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Trophy,
  Info,
  Clock,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { SubstituteModal } from './SubstituteModal';

interface WorkoutActiveViewProps {
  dayTemplate: DayWorkoutTemplate;
  onUpdateDayTemplate: (updated: DayWorkoutTemplate) => void;
  onStartRestTimer: (seconds: number, exerciseName: string) => void;
  onFinishWorkout: (summary: {
    durationSeconds: number;
    totalTonnage: number;
    completedSets: number;
    totalSets: number;
  }) => void;
  workoutDurationSeconds: number;
  isWorkoutRunning: boolean;
  onToggleWorkoutTimer: () => void;
  onResetWorkoutTimer: () => void;
}

export function WorkoutActiveView({
  dayTemplate,
  onUpdateDayTemplate,
  onStartRestTimer,
  onFinishWorkout,
  workoutDurationSeconds,
  isWorkoutRunning,
  onToggleWorkoutTimer,
  onResetWorkoutTimer,
}: WorkoutActiveViewProps) {
  const [substitutingExercise, setSubstitutingExercise] = useState<Exercise | null>(null);

  // Compute live statistics
  let totalSets = 0;
  let completedSets = 0;
  let totalTonnage = 0;

  for (const ex of dayTemplate.exercises) {
    for (const set of ex.sets) {
      totalSets++;
      if (set.completed) {
        completedSets++;
        totalTonnage += (set.actualWeightKg || 0) * (set.actualReps || 0);
      }
    }
  }

  const completionPercent = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const formatTimer = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Handlers for set adjustments
  const handleToggleSetCompleted = (exerciseId: string, setId: string) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => {
        if (s.id !== setId) return s;
        const nextCompleted = !s.completed;
        if (nextCompleted) {
          // Trigger rest timer
          onStartRestTimer(ex.targetRestSeconds || 90, ex.name);
          // If workout timer isn't running, start it
          if (!isWorkoutRunning) {
            onToggleWorkoutTimer();
          }
        }
        return { ...s, completed: nextCompleted };
      });
      return { ...ex, sets: updatedSets };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  const handleUpdateSetField = (
    exerciseId: string,
    setId: string,
    field: 'actualWeightKg' | 'actualReps',
    value: number
  ) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => {
        if (s.id !== setId) return s;
        return { ...s, [field]: Math.max(0, value) };
      });
      return { ...ex, sets: updatedSets };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  const handleCycleSetType = (exerciseId: string, setId: string) => {
    const order: SetType[] = ['working', 'warmup', 'drop', 'failure'];
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => {
        if (s.id !== setId) return s;
        const currentIndex = order.indexOf(s.type);
        const nextType = order[(currentIndex + 1) % order.length];
        return { ...s, type: nextType };
      });
      return { ...ex, sets: updatedSets };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  const handleAddSet = (exerciseId: string) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: ExerciseSet = {
        id: `set-${Math.random().toString(36).slice(2, 9)}`,
        setNumber: ex.sets.length + 1,
        type: 'working',
        targetReps: ex.defaultReps,
        actualWeightKg: lastSet ? lastSet.actualWeightKg : 20,
        actualReps: lastSet ? lastSet.actualReps : 10,
        completed: false,
        prevHistory: lastSet?.prevHistory,
      };
      return { ...ex, sets: [...ex.sets, newSet] };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  const handleRemoveSet = (exerciseId: string, setId: string) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      if (ex.sets.length <= 1) return ex; // maintain at least 1 set
      const remainingSets = ex.sets
        .filter((s) => s.id !== setId)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...ex, sets: remainingSets };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  const handleSubstitute = (exerciseId: string, newName: string, equipment: Exercise['equipment']) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      return {
        ...ex,
        name: newName,
        equipment: equipment,
      };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Hero Section of the Fixed Workout */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent z-0" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-xl">
            {/* Metadata as unboxed text */}
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-emerald-400">{dayTemplate.dayName}</span>
              <span aria-hidden="true">·</span>
              <span>Фиксированная программа</span>
              <span aria-hidden="true">·</span>
              <span>~{dayTemplate.estimatedMinutes} минут</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {dayTemplate.title}
            </h1>

            {/* Target muscle groups */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Целевые зоны:</span>
              <span className="text-slate-300 font-medium">
                {dayTemplate.targetMuscles.join(' · ')}
              </span>
            </div>
          </div>

          {/* Workout stopwatch & stats cluster */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
            {/* Stopwatch */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-800">
              <div className="text-left">
                <div className="text-[10px] text-slate-400 font-medium">Время тренировки</div>
                <div className="text-lg font-bold font-mono text-white tabular-nums">
                  {formatTimer(workoutDurationSeconds)}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={onToggleWorkoutTimer}
                  title={isWorkoutRunning ? 'Пауза' : 'Старт таймера'}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                >
                  {isWorkoutRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                </button>
                <button
                  onClick={onResetWorkoutTimer}
                  title="Сброс таймера"
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Total Volume */}
            <div className="px-2">
              <div className="text-[10px] text-slate-400 font-medium">Общий тоннаж</div>
              <div className="text-lg font-bold font-mono text-emerald-400 tabular-nums">
                {totalTonnage.toLocaleString('ru-RU')} <span className="text-xs font-normal text-slate-400">кг</span>
              </div>
            </div>

            {/* Progress */}
            <div className="pl-3 border-l border-slate-800">
              <div className="text-[10px] text-slate-400 font-medium">Прогресс подходов</div>
              <div className="text-sm font-bold font-mono text-white tabular-nums flex items-center gap-1.5">
                <span>{completedSets} / {totalSets}</span>
                <span className="text-xs text-slate-400 font-normal">({completionPercent}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Linear progress bar */}
        <div className="relative z-10 mt-4 w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Concrete Exercise Cards */}
      <div className="space-y-4">
        {dayTemplate.exercises.map((exercise, exIndex) => {
          const exCompletedSets = exercise.sets.filter((s) => s.completed).length;
          const isExDone = exCompletedSets === exercise.sets.length && exercise.sets.length > 0;

          return (
            <div
              key={exercise.id}
              className={`rounded-2xl border transition-all ${
                isExDone
                  ? 'bg-slate-900/40 border-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              } p-4 sm:p-5`}
            >
              {/* Exercise Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-800/80">
                <div className="flex items-start gap-3">
                  <span className="text-xs font-mono font-bold text-slate-500 mt-1 shrink-0">
                    {(exIndex + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-white tracking-tight">
                        {exercise.name}
                      </h3>
                      {isExDone && (
                        <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Выполнено
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{exercise.muscle}</span>
                      <span aria-hidden="true">·</span>
                      <span>{exercise.equipment}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        Отдых {exercise.targetRestSeconds}с
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setSubstitutingExercise(exercise)}
                    title="Заменить на аналог (если тренажер занят)"
                    className="px-2.5 py-1 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3 text-slate-400" />
                    <span>Заменить</span>
                  </button>
                </div>
              </div>

              {/* Coaching cue banner */}
              {exercise.cue && (
                <div className="mt-2.5 mb-3 px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-200">Фокус техники:</strong> {exercise.cue}
                  </span>
                </div>
              )}

              {/* Sets Table */}
              <div className="overflow-x-auto mt-2">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="text-slate-400 font-semibold border-b border-slate-800/80 text-[11px] uppercase tracking-wider">
                      <th className="py-2 px-2 w-12 text-center">Сет</th>
                      <th className="py-2 px-2 w-20">Тип</th>
                      <th className="py-2 px-2 hidden sm:table-cell text-slate-400">Прошлый раз</th>
                      <th className="py-2 px-2">Вес (кг)</th>
                      <th className="py-2 px-2">Повторы</th>
                      <th className="py-2 px-2 w-14 text-center">Готово</th>
                      <th className="py-2 px-1 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {exercise.sets.map((set, sIdx) => {
                      const typeLabel =
                        set.type === 'warmup'
                          ? 'Разминка'
                          : set.type === 'drop'
                          ? 'Дроп'
                          : set.type === 'failure'
                          ? 'Отказ'
                          : 'Рабочий';

                      const typeColor =
                        set.type === 'warmup'
                          ? 'text-amber-400 bg-amber-400/10'
                          : set.type === 'drop'
                          ? 'text-purple-400 bg-purple-400/10'
                          : set.type === 'failure'
                          ? 'text-rose-400 bg-rose-400/10'
                          : 'text-slate-300 bg-slate-800/60';

                      return (
                        <tr
                          key={set.id}
                          className={`transition-colors ${
                            set.completed ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'
                          }`}
                        >
                          {/* Set number */}
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-400 text-xs">
                            {sIdx + 1}
                          </td>

                          {/* Type toggle */}
                          <td className="py-2.5 px-2">
                            <button
                              onClick={() => handleCycleSetType(exercise.id, set.id)}
                              title="Нажмите, чтобы сменить тип (Рабочий / Разминка / Дроп / Отказ)"
                              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${typeColor}`}
                            >
                              {typeLabel}
                            </button>
                          </td>

                          {/* Previous history reference */}
                          <td className="py-2.5 px-2 hidden sm:table-cell text-slate-400 text-xs font-mono tabular-nums">
                            {set.prevHistory
                              ? `${set.prevHistory.weightKg} кг × ${set.prevHistory.reps}`
                              : '—'}
                          </td>

                          {/* Weight input with quick steppers */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() =>
                                  handleUpdateSetField(
                                    exercise.id,
                                    set.id,
                                    'actualWeightKg',
                                    (set.actualWeightKg || 0) - 2.5
                                  )
                                }
                                className="w-6 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                              >
                                <Minus className="w-3 h-3" />
                              </button>

                              <input
                                type="number"
                                step="0.5"
                                min="0"
                                value={set.actualWeightKg || ''}
                                onChange={(e) =>
                                  handleUpdateSetField(
                                    exercise.id,
                                    set.id,
                                    'actualWeightKg',
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="w-14 sm:w-16 px-1.5 py-1 text-center font-mono font-bold text-white bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 tabular-nums"
                              />

                              <button
                                onClick={() =>
                                  handleUpdateSetField(
                                    exercise.id,
                                    set.id,
                                    'actualWeightKg',
                                    (set.actualWeightKg || 0) + 2.5
                                  )
                                }
                                className="w-6 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>

                          {/* Reps input */}
                          <td className="py-2.5 px-2">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                value={set.actualReps || ''}
                                onChange={(e) =>
                                  handleUpdateSetField(
                                    exercise.id,
                                    set.id,
                                    'actualReps',
                                    parseInt(e.target.value) || 0
                                  )
                                }
                                className="w-12 sm:w-14 px-1.5 py-1 text-center font-mono font-bold text-white bg-slate-950 border border-slate-700 rounded-lg focus:outline-none focus:border-emerald-500 tabular-nums"
                              />
                              <span className="text-[11px] text-slate-400 hidden sm:inline whitespace-nowrap">
                                (цель {set.targetReps})
                              </span>
                            </div>
                          </td>

                          {/* Complete Check Button */}
                          <td className="py-2.5 px-2 text-center">
                            <button
                              onClick={() => handleToggleSetCompleted(exercise.id, set.id)}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                set.completed
                                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 active:scale-95'
                                  : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
                              }`}
                            >
                              <Check className={`w-4 h-4 ${set.completed ? 'stroke-[3]' : ''}`} />
                            </button>
                          </td>

                          {/* Delete set option if > 1 set */}
                          <td className="py-2.5 px-1 text-center">
                            {exercise.sets.length > 1 && (
                              <button
                                onClick={() => handleRemoveSet(exercise.id, set.id)}
                                title="Удалить подход"
                                className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Add set button */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => handleAddSet(exercise.id)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Добавить подход</span>
                </button>

                <div className="text-[11px] text-slate-400 font-mono">
                  {exCompletedSets} из {exercise.sets.length} выполнено
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky-like Action Card */}
      <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">
              Завершение сегодняшней программы
            </div>
            <div className="text-xs text-slate-400">
              Выполнено {completedSets} из {totalSets} подходов · {totalTonnage.toLocaleString('ru-RU')} кг тоннаж
            </div>
          </div>
        </div>

        <button
          onClick={() =>
            onFinishWorkout({
              durationSeconds: workoutDurationSeconds || 3600,
              totalTonnage,
              completedSets,
              totalSets,
            })
          }
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Завершить тренировку</span>
        </button>
      </div>

      {/* Substitute Modal */}
      {substitutingExercise && (
        <SubstituteModal
          exercise={substitutingExercise}
          isOpen={true}
          onClose={() => setSubstitutingExercise(null)}
          onSelectSubstitute={(newName, equipment) => {
            handleSubstitute(substitutingExercise.id, newName, equipment);
            setSubstitutingExercise(null);
          }}
        />
      )}
    </div>
  );
}
