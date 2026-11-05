import React, { useState } from 'react';
import { WorkoutProgram, DayWorkoutTemplate } from '../types/workout';
import { DEFAULT_PROGRAMS } from '../data/defaultPrograms';
import {
  Layers,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Moon,
  Clock,
  RotateCcw,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';

interface ProgramOverviewProps {
  currentProgram: WorkoutProgram;
  onSelectProgram: (program: WorkoutProgram) => void;
  onUpdateProgram: (program: WorkoutProgram) => void;
  onClose?: () => void;
}

export function ProgramOverviewModal({
  currentProgram,
  onSelectProgram,
  onUpdateProgram,
  onClose,
}: ProgramOverviewProps) {
  const [expandedDayId, setExpandedDayId] = useState<string | null>(
    currentProgram.days.find((d) => !d.isRestDay)?.id || null
  );

  const [addingToDayId, setAddingToDayId] = useState<string | null>(null);
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState('Грудь');

  const toggleDay = (dayId: string) => {
    setExpandedDayId((prev) => (prev === dayId ? null : dayId));
  };

  const handleResetToDefault = () => {
    const defaultProg = DEFAULT_PROGRAMS.find((p) => p.id === currentProgram.id) || DEFAULT_PROGRAMS[0];
    onUpdateProgram(JSON.parse(JSON.stringify(defaultProg)));
  };

  const handleAddExerciseToDay = (dayId: string) => {
    if (!newExName.trim()) return;

    const updatedDays = currentProgram.days.map((d) => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: [
          ...d.exercises,
          {
            id: `ex-custom-${Date.now()}`,
            name: newExName.trim(),
            muscle: newExMuscle as any,
            equipment: 'Тренажер' as const,
            targetSetsCount: 3,
            defaultReps: '10–12',
            targetRestSeconds: 75,
            cue: 'Контролируемый темп, полная амплитуда.',
            sets: Array.from({ length: 3 }, (_, i) => ({
              id: `set-${Math.random().toString(36).slice(2, 8)}`,
              setNumber: i + 1,
              type: 'working' as const,
              targetReps: '10–12',
              actualWeightKg: 20,
              actualReps: 10,
              completed: false,
            })),
          },
        ],
      };
    });

    onUpdateProgram({ ...currentProgram, days: updatedDays });
    setNewExName('');
    setAddingToDayId(null);
  };

  const handleDeleteExerciseFromDay = (dayId: string, exId: string) => {
    const updatedDays = currentProgram.days.map((d) => {
      if (d.id !== dayId) return d;
      return {
        ...d,
        exercises: d.exercises.filter((ex) => ex.id !== exId),
      };
    });
    onUpdateProgram({ ...currentProgram, days: updatedDays });
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Program Selector & Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span className="text-emerald-400 font-semibold">{currentProgram.level} уровень</span>
              <span aria-hidden="true">·</span>
              <span>{currentProgram.daysPerWeek} тренировки в неделю</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {currentProgram.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              {currentProgram.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetToDefault}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить к стандарту</span>
            </button>
          </div>
        </div>

        {/* Switch presets */}
        <div className="pt-2 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Доступные фиксированные программы:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DEFAULT_PROGRAMS.map((prog) => {
              const isCurrent = prog.id === currentProgram.id;
              return (
                <button
                  key={prog.id}
                  onClick={() => onSelectProgram(JSON.parse(JSON.stringify(prog)))}
                  className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                    isCurrent
                      ? 'bg-emerald-950/30 border-emerald-500/60 shadow-sm shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      {prog.title}
                      {isCurrent && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <div className="text-xs text-slate-400">
                      {prog.daysPerWeek} дня/нед · {prog.level}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Weekday breakdown */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Структура недели по дням:
        </h2>

        {currentProgram.days.map((day) => {
          const isExpanded = expandedDayId === day.id;

          return (
            <div
              key={day.id}
              className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
            >
              {/* Day accordion header */}
              <button
                onClick={() => toggleDay(day.id)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      day.isRestDay
                        ? 'bg-slate-800 text-slate-400'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {day.isRestDay ? (
                      <Moon className="w-4 h-4" />
                    ) : (
                      <Dumbbell className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-400">{day.dayName}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="text-sm font-bold text-white">{day.title}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {day.isRestDay
                        ? 'День восстановления'
                        : `${day.exercises.length} фиксированных упражнений · ~${day.estimatedMinutes} мин`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </div>
              </button>

              {/* Day exercises content */}
              {isExpanded && (
                <div className="p-4 pt-1 border-t border-slate-800/80 bg-slate-950/40 space-y-3">
                  {day.isRestDay ? (
                    <div className="p-3 text-xs text-slate-400 bg-slate-900/40 rounded-xl">
                      {day.restDescription || 'Запланированный день восстановления мышц и ЦНС.'}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {day.exercises.map((ex, exIdx) => (
                        <div
                          key={ex.id}
                          className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <span className="font-mono font-bold text-slate-500 mt-0.5">
                              {(exIdx + 1).toString().padStart(2, '0')}
                            </span>
                            <div>
                              <div className="font-bold text-white text-sm">
                                {ex.name}
                              </div>
                              <div className="text-slate-400 text-xs mt-0.5">
                                {ex.muscle} · {ex.equipment} · {ex.sets.length} подходов по {ex.defaultReps} повторов · отдых {ex.targetRestSeconds}с
                              </div>
                              {ex.cue && (
                                <div className="text-[11px] text-slate-500 mt-1 italic">
                                  {ex.cue}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleDeleteExerciseFromDay(day.id, ex.id)}
                              title="Удалить из программы"
                              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add exercise row */}
                      {addingToDayId === day.id ? (
                        <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
                          <div className="text-xs font-semibold text-white">Добавить упражнение в {day.dayName}</div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <input
                              type="text"
                              placeholder="Название упражнения..."
                              value={newExName}
                              onChange={(e) => setNewExName(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                            />
                            <select
                              value={newExMuscle}
                              onChange={(e) => setNewExMuscle(e.target.value)}
                              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none"
                            >
                              <option value="Грудь">Грудь</option>
                              <option value="Спина">Спина</option>
                              <option value="Квадрицепсы">Квадрицепсы</option>
                              <option value="Бицепс бедра">Бицепс бедра</option>
                              <option value="Плечи">Плечи</option>
                              <option value="Бицепс">Бицепс</option>
                              <option value="Трицепс">Трицепс</option>
                              <option value="Пресс">Пресс</option>
                              <option value="Икры">Икры</option>
                            </select>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleAddExerciseToDay(day.id)}
                                disabled={!newExName.trim()}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-lg transition-colors"
                              >
                                Добавить
                              </button>
                              <button
                                onClick={() => setAddingToDayId(null)}
                                className="px-2 py-1.5 text-slate-400 hover:text-white text-xs"
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAddingToDayId(day.id)}
                          className="w-full py-2 border border-dashed border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Добавить упражнение в программу этого дня</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
