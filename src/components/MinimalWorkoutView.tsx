import React from 'react';
import { DayWorkoutTemplate, Exercise, ExerciseSet } from '../types/workout';
import { Check, Plus, Trash2, Edit3, RotateCcw, CheckCircle2 } from 'lucide-react';

interface MinimalWorkoutViewProps {
  dayTemplate: DayWorkoutTemplate;
  onUpdateDayTemplate: (updated: DayWorkoutTemplate) => void;
  onStartRest: (seconds: number) => void;
  onFinishWorkout: () => void;
  onOpenEditDay: () => void;
}

export function MinimalWorkoutView({
  dayTemplate,
  onUpdateDayTemplate,
  onStartRest,
  onFinishWorkout,
  onOpenEditDay,
}: MinimalWorkoutViewProps) {
  // Stats
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

  const handleToggleSet = (exerciseId: string, setId: string) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => {
        if (s.id !== setId) return s;
        const nextCompleted = !s.completed;
        if (nextCompleted) {
          onStartRest(ex.targetRestSeconds || 90);
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

  const handleUpdateValue = (
    exerciseId: string,
    setId: string,
    field: 'actualWeightKg' | 'actualReps',
    val: number
  ) => {
    const updatedExercises = dayTemplate.exercises.map((ex) => {
      if (ex.id !== exerciseId) return ex;
      const updatedSets = ex.sets.map((s) => {
        if (s.id !== setId) return s;
        return { ...s, [field]: Math.max(0, val) };
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
        id: `set-${Math.random().toString(36).slice(2, 8)}`,
        setNumber: ex.sets.length + 1,
        type: 'working',
        targetReps: ex.defaultReps,
        actualWeightKg: lastSet ? lastSet.actualWeightKg : 20,
        actualReps: lastSet ? lastSet.actualReps : 10,
        completed: false,
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
      if (ex.sets.length <= 1) return ex;
      const filtered = ex.sets
        .filter((s) => s.id !== setId)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      return { ...ex, sets: filtered };
    });

    onUpdateDayTemplate({
      ...dayTemplate,
      exercises: updatedExercises,
    });
  };

  const handleResetCheckmarks = () => {
    const resetExercises = dayTemplate.exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s, completed: false })),
    }));
    onUpdateDayTemplate({ ...dayTemplate, exercises: resetExercises });
  };

  return (
    <div className="space-y-5 pb-16">
      {/* Quiet Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {dayTemplate.title}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {dayTemplate.exercises.length} упражнения · {completedSets} из {totalSets} подходов
            {totalTonnage > 0 && ` · ${totalTonnage.toLocaleString('ru-RU')} кг`}
          </p>
        </div>

        <div className="flex items-center gap-1">
          {completedSets > 0 && (
            <button
              onClick={handleResetCheckmarks}
              title="Сбросить отметки"
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors text-xs flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сброс</span>
            </button>
          )}

          <button
            onClick={onOpenEditDay}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Изменить упражнения дня"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Настроить</span>
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        {dayTemplate.exercises.map((ex, exIdx) => {
          const isDone = ex.sets.length > 0 && ex.sets.every((s) => s.completed);

          return (
            <div
              key={ex.id}
              className={`rounded-2xl border transition-all p-4 ${
                isDone
                  ? 'bg-slate-900/40 border-emerald-500/30'
                  : 'bg-slate-900/80 border-slate-800'
              }`}
            >
              {/* Exercise Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-bold text-slate-500">
                    {(exIdx + 1).toString().padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {ex.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {ex.sets.length} подх × {ex.defaultReps} повт · {ex.targetRestSeconds}с отдых
                    </div>
                  </div>
                </div>

                {isDone && (
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              {/* Minimal Sets List */}
              <div className="mt-3 space-y-2">
                {ex.sets.map((set, sIdx) => (
                  <div
                    key={set.id}
                    className={`flex items-center justify-between gap-3 p-2 rounded-xl transition-all ${
                      set.completed ? 'bg-emerald-950/20' : 'bg-slate-950/40'
                    }`}
                  >
                    <span className="w-6 text-center text-xs font-mono font-bold text-slate-400">
                      {sIdx + 1}
                    </span>

                    {/* Weight Input */}
                    <div className="flex items-center gap-1.5 flex-1 max-w-[140px]">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={set.actualWeightKg === 0 ? '' : set.actualWeightKg}
                        placeholder="0"
                        onChange={(e) =>
                          handleUpdateValue(
                            ex.id,
                            set.id,
                            'actualWeightKg',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full text-center py-1 px-2 text-sm font-bold font-mono text-white bg-slate-900 border border-slate-700/80 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-slate-400 shrink-0">кг</span>
                    </div>

                    <span className="text-slate-600 text-xs">×</span>

                    {/* Reps Input */}
                    <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
                      <input
                        type="number"
                        min="1"
                        value={set.actualReps === 0 ? '' : set.actualReps}
                        placeholder="0"
                        onChange={(e) =>
                          handleUpdateValue(
                            ex.id,
                            set.id,
                            'actualReps',
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full text-center py-1 px-2 text-sm font-bold font-mono text-white bg-slate-900 border border-slate-700/80 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-xs text-slate-400 shrink-0">повт</span>
                    </div>

                    {/* Completion Checkmark */}
                    <button
                      onClick={() => handleToggleSet(ex.id, set.id)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                        set.completed
                          ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm shadow-emerald-500/20 active:scale-95'
                          : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${set.completed ? 'stroke-[3]' : ''}`} />
                    </button>

                    {/* Quick remove button */}
                    {ex.sets.length > 1 && (
                      <button
                        onClick={() => handleRemoveSet(ex.id, set.id)}
                        className="p-1 text-slate-600 hover:text-rose-400 transition-colors"
                        title="Удалить подход"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add set button */}
              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => handleAddSet(ex.id)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors py-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Добавить подход</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Clean Single Bottom Action Button */}
      <div className="pt-2">
        <button
          onClick={onFinishWorkout}
          className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/10 active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Завершить тренировку</span>
        </button>
      </div>
    </div>
  );
}
