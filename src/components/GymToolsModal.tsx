import React, { useState } from 'react';
import { Disc, Calculator, Flame, Scale, Layers } from 'lucide-react';

export function GymToolsModal() {
  const [activeTool, setActiveTool] = useState<'plates' | 'oneRM' | 'warmup'>('plates');

  // Plate Calculator State
  const [targetWeight, setTargetWeight] = useState(100);
  const [barWeight, setBarWeight] = useState(20);

  // 1RM Calculator State
  const [rmWeight, setRmWeight] = useState(80);
  const [rmReps, setRmReps] = useState(8);

  // Warmup Calculator State
  const [warmupWorkWeight, setWarmupWorkWeight] = useState(100);

  // Plate calculations
  const plateSizes = [25, 20, 15, 10, 5, 2.5, 1.25];
  const plateColors: Record<number, { bg: string; text: string; label: string }> = {
    25: { bg: 'bg-rose-600', text: 'text-white', label: '25' },
    20: { bg: 'bg-blue-600', text: 'text-white', label: '20' },
    15: { bg: 'bg-amber-500', text: 'text-slate-950', label: '15' },
    10: { bg: 'bg-emerald-600', text: 'text-white', label: '10' },
    5: { bg: 'bg-slate-200', text: 'text-slate-900', label: '5' },
    2.5: { bg: 'bg-slate-700', text: 'text-white', label: '2.5' },
    1.25: { bg: 'bg-slate-400', text: 'text-slate-950', label: '1.25' },
  };

  const calculatePlatesPerSide = () => {
    let remainder = Math.max(0, (targetWeight - barWeight) / 2);
    const result: { weight: number; count: number }[] = [];

    for (const p of plateSizes) {
      if (remainder >= p) {
        const count = Math.floor(remainder / p);
        result.push({ weight: p, count });
        remainder = remainder - count * p;
        remainder = Math.round(remainder * 100) / 100;
      }
    }
    return { plates: result, unreachedRemainder: remainder * 2 };
  };

  const { plates: platesPerSide, unreachedRemainder } = calculatePlatesPerSide();

  // 1RM calculations (Epley formula: W * (1 + r/30))
  const calculated1RM = Math.round(rmWeight * (1 + rmReps / 30));
  const percentages = [
    { pct: 95, reps: '1–2' },
    { pct: 90, reps: '3–4' },
    { pct: 85, reps: '5–6' },
    { pct: 80, reps: '7–8' },
    { pct: 75, reps: '9–10' },
    { pct: 70, reps: '11–12' },
    { pct: 60, reps: '15+' },
  ];

  // Warmup set calculations
  const warmupSteps = [
    { name: '1. Пустой гриф', weight: barWeight, reps: '10 повт', focus: 'Суставная разминка' },
    {
      name: '2. 45% от рабочего',
      weight: Math.round((warmupWorkWeight * 0.45) / 2.5) * 2.5,
      reps: '5 повт',
      focus: 'Активация двигательного паттерна',
    },
    {
      name: '3. 65% от рабочего',
      weight: Math.round((warmupWorkWeight * 0.65) / 2.5) * 2.5,
      reps: '3 повт',
      focus: 'Скорость и включение волокон',
    },
    {
      name: '4. 85% от рабочего',
      weight: Math.round((warmupWorkWeight * 0.85) / 2.5) * 2.5,
      reps: '1-2 повт',
      focus: 'Подготовка ЦНС без закисления',
    },
    {
      name: '5. Рабочий подход',
      weight: warmupWorkWeight,
      reps: 'Рабочий диапазон',
      focus: 'Основная гипертрофийная нагрузка',
    },
  ];

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-xl space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white">
            Инструменты атлета
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Быстрый расчет дисков для штанги, одноповторного максимума и правильной пирамиды разминки.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTool('plates')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTool === 'plates'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Disc className="w-3.5 h-3.5 text-emerald-400" />
            <span>Калькулятор блинов</span>
          </button>

          <button
            onClick={() => setActiveTool('oneRM')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTool === 'oneRM'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>1RM (Максимум)</span>
          </button>

          <button
            onClick={() => setActiveTool('warmup')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
              activeTool === 'warmup'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Разминочные подходы</span>
          </button>
        </div>
      </div>

      {/* Tool 1: Plate Calculator */}
      {activeTool === 'plates' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Целевой общий вес (кг):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="2.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(Math.max(barWeight, parseFloat(e.target.value) || barWeight))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold font-mono text-white focus:outline-none focus:border-emerald-500 tabular-nums"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => setTargetWeight((w) => Math.max(barWeight, w - 5))}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-mono text-xs"
                  >
                    -5
                  </button>
                  <button
                    onClick={() => setTargetWeight((w) => w + 5)}
                    className="px-2.5 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-mono text-xs"
                  >
                    +5
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Вес грифа (кг):
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[20, 15, 10].map((w) => (
                  <button
                    key={w}
                    onClick={() => setBarWeight(w)}
                    className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      barWeight === w
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {w} кг {w === 20 ? '(стандарт)' : ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Visual Barbell Sleeve */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-4">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Навесить на каждую сторону грифа ({((targetWeight - barWeight) / 2).toFixed(1)} кг):
            </div>

            {/* Visual Sleeve Representation */}
            <div className="flex items-center justify-center gap-1.5 min-h-[90px] py-4 bg-slate-900/60 rounded-xl px-4 overflow-x-auto">
              {/* Sleeve shaft */}
              <div className="w-12 h-4 bg-slate-600 rounded-l-sm shrink-0" title="Втулка грифа" />

              {platesPerSide.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  Только пустой гриф ({barWeight} кг)
                </span>
              ) : (
                platesPerSide.map((item) =>
                  Array.from({ length: item.count }, (_, i) => {
                    const cfg = plateColors[item.weight] || {
                      bg: 'bg-slate-500',
                      text: 'text-white',
                      label: `${item.weight}`,
                    };
                    const heightClass =
                      item.weight >= 20
                        ? 'h-24 w-5'
                        : item.weight >= 10
                        ? 'h-18 w-4'
                        : item.weight >= 5
                        ? 'h-14 w-3.5'
                        : 'h-10 w-3';

                    return (
                      <div
                        key={`${item.weight}-${i}`}
                        className={`${heightClass} ${cfg.bg} ${cfg.text} rounded-sm flex items-center justify-center shadow-md shrink-0 font-mono text-[9px] font-bold select-none`}
                        title={`${item.weight} кг`}
                      >
                        <span className="-rotate-90">{cfg.label}</span>
                      </div>
                    );
                  })
                )
              )}

              {/* Collar clip */}
              <div className="w-3 h-8 bg-slate-400 rounded-r-md shrink-0" title="Замок" />
            </div>

            {/* Breakdown List */}
            <div className="flex flex-wrap justify-center gap-2 pt-2">
              {platesPerSide.map((p) => (
                <div
                  key={p.weight}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs font-mono text-slate-200"
                >
                  <strong className="text-white">{p.weight} кг</strong> × {p.count} шт на сторону
                </div>
              ))}
            </div>

            {unreachedRemainder > 0 && (
              <div className="text-xs text-amber-400">
                Остаток {unreachedRemainder.toFixed(2)} кг не делится на имеющиеся диски.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tool 2: 1RM Calculator */}
      {activeTool === 'oneRM' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Поднятый вес (кг):
              </label>
              <input
                type="number"
                step="2.5"
                value={rmWeight}
                onChange={(e) => setRmWeight(Math.max(1, parseFloat(e.target.value) || 0))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold font-mono text-white focus:outline-none focus:border-blue-500 tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Количество повторений:
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={rmReps}
                onChange={(e) => setRmReps(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold font-mono text-white focus:outline-none focus:border-blue-500 tabular-nums"
              />
            </div>
          </div>

          {/* Result Highlight */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">Расчетный разовый максимум (1RM):</div>
              <div className="text-3xl font-extrabold font-mono text-blue-400 tabular-nums mt-0.5">
                ~{calculated1RM} <span className="text-sm font-normal text-slate-400">кг</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 sm:text-right max-w-xs">
              Формула Эпли (Epley Formula). Точность выше всего в диапазоне 2–10 повторений.
            </div>
          </div>

          {/* Zones breakdown table */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Процентные зоны нагрузки:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {percentages.map((p) => {
                const targetW = Math.round((calculated1RM * (p.pct / 100)) / 2.5) * 2.5;
                return (
                  <div
                    key={p.pct}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-left"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{p.pct}%</span>
                      <span className="text-[11px] text-slate-500">{p.reps} повт</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-white tabular-nums mt-1">
                      {targetW} <span className="text-xs text-slate-400 font-normal">кг</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tool 3: Warm-up Sets Calculator */}
      {activeTool === 'warmup' && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-5 sm:p-6 space-y-6">
          <div className="max-w-xs">
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              Плановый рабочий вес (кг):
            </label>
            <input
              type="number"
              step="2.5"
              value={warmupWorkWeight}
              onChange={(e) => setWarmupWorkWeight(Math.max(20, parseFloat(e.target.value) || 20))}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-lg font-bold font-mono text-white focus:outline-none focus:border-amber-500 tabular-nums"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Оптимальная пирамида разминки без закисления:
            </h3>

            {warmupSteps.map((step, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                  idx === warmupSteps.length - 1
                    ? 'bg-amber-950/20 border-amber-500/40 text-white'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div>
                  <div className="text-xs font-bold flex items-center gap-2">
                    <span className={idx === warmupSteps.length - 1 ? 'text-amber-400' : 'text-slate-400'}>
                      {step.name}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{step.focus}</div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white tabular-nums">
                      {step.weight} кг
                    </div>
                    <div className="text-[11px] text-slate-400">{step.reps}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
