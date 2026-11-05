import React, { useState } from 'react';
import { DayWorkoutTemplate } from '../types/workout';
import { Moon, CheckCircle2, Circle, ArrowRight, Activity, Droplets, BedDouble, Utensils } from 'lucide-react';

interface RestDayViewProps {
  dayTemplate: DayWorkoutTemplate;
  nextWorkoutDay?: DayWorkoutTemplate;
  onGoToWorkoutDay: (dayId: string) => void;
}

export function RestDayView({
  dayTemplate,
  nextWorkoutDay,
  onGoToWorkoutDay,
}: RestDayViewProps) {
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    sleep: true,
    water: false,
    protein: false,
    steps: false,
    mobility: false,
  });

  const toggleItem = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;

  return (
    <div className="space-y-6 pb-20">
      {/* Rest Day Hero */}
      <div className="rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span className="font-semibold text-indigo-400">{dayTemplate.dayName}</span>
          <span aria-hidden="true">·</span>
          <span>Запланированный отдых</span>
          <span aria-hidden="true">·</span>
          <span>Фиксированный график</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <Moon className="w-7 h-7 text-indigo-400" />
              <span>{dayTemplate.title}</span>
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              {dayTemplate.restDescription ||
                'Мышцы растут и адаптируются не на тренировке, а во время качественного восстановления. Сегодня снизьте общий стресс и дайте нервной системе перезагрузиться.'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 shrink-0 text-center sm:text-right">
            <div className="text-xs text-slate-400">Чек-лист восстановления</div>
            <div className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {completedCount} / {totalCount}
            </div>
            <div className="text-[11px] text-slate-500">
              {completedCount === totalCount ? 'Все цели закрыты!' : 'Действий выполнено'}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interactive Checklist */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>Протокол восстановления</span>
          </h3>

          <div className="space-y-2 text-sm">
            <button
              onClick={() => toggleItem('sleep')}
              className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <BedDouble className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className={`font-medium ${checklist.sleep ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    Сон 8+ часов
                  </div>
                  <div className="text-xs text-slate-500">Пик выработки гормона роста и восстановление ЦНС</div>
                </div>
              </div>
              {checklist.sleep ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 shrink-0" />
              )}
            </button>

            <button
              onClick={() => toggleItem('water')}
              className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className={`font-medium ${checklist.water ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    Гидратация 2.5–3.0 л
                  </div>
                  <div className="text-xs text-slate-500">Вымывание метаболитов и питание суставных сумок</div>
                </div>
              </div>
              {checklist.water ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 shrink-0" />
              )}
            </button>

            <button
              onClick={() => toggleItem('protein')}
              className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Utensils className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className={`font-medium ${checklist.protein ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    Норма белка (1.6–2.0 г/кг)
                  </div>
                  <div className="text-xs text-slate-500">Аминокислоты для синтеза мышечного белка (MPS)</div>
                </div>
              </div>
              {checklist.protein ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 shrink-0" />
              )}
            </button>

            <button
              onClick={() => toggleItem('steps')}
              className="w-full p-3 rounded-xl bg-slate-950/60 hover:bg-slate-950 border border-slate-800/80 flex items-center justify-between transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className={`font-medium ${checklist.steps ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    Легкая активность: 8 000 шагов
                  </div>
                  <div className="text-xs text-slate-500">Улучшение кровотока без накопления утомления</div>
                </div>
              </div>
              {checklist.steps ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-slate-600 shrink-0" />
              )}
            </button>
          </div>
        </div>

        {/* Next Workout Preview */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Следующая запланированная тренировка
            </div>

            {nextWorkoutDay ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                  <div className="text-xs font-medium text-emerald-400 mb-0.5">
                    {nextWorkoutDay.dayName}
                  </div>
                  <div className="text-base font-bold text-white mb-1">
                    {nextWorkoutDay.title}
                  </div>
                  <div className="text-xs text-slate-400">
                    {nextWorkoutDay.exercises.length} фиксированных упражнений · ~{nextWorkoutDay.estimatedMinutes} мин
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1 text-[11px] text-slate-300">
                    {nextWorkoutDay.exercises.slice(0, 3).map((ex) => (
                      <span key={ex.id} className="bg-slate-800/60 px-2 py-0.5 rounded">
                        {ex.name.split(' ')[0]} {ex.name.split(' ')[1] || ''}
                      </span>
                    ))}
                    {nextWorkoutDay.exercises.length > 3 && (
                      <span className="text-slate-500 self-center">
                        +{nextWorkoutDay.exercises.length - 3} ещё
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-400">
                  Хотите провести тренировку сегодня вне графика? Вы можете перейти к ней прямо сейчас.
                </p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Все дни текущего цикла завершены. Отдыхайте перед новым циклом!
              </p>
            )}
          </div>

          {nextWorkoutDay && (
            <button
              onClick={() => onGoToWorkoutDay(nextWorkoutDay.id)}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <span>Перейти к тренировке «{nextWorkoutDay.dayName}»</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
