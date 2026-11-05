import React, { useState } from 'react';
import { ProgramConfig, DayDef, ExerciseDef } from '../types/workoutProgram';
import { INITIAL_PROGRAM } from '../data/initialProgram';
import { Plus, Trash2, ArrowUp, ArrowDown, Code, Sliders, RotateCcw, Copy, Check, Info } from 'lucide-react';

interface ProgramEditorTabProps {
  program: ProgramConfig;
  onUpdateProgram: (newConfig: ProgramConfig) => void;
}

export function ProgramEditorTab({ program, onUpdateProgram }: ProgramEditorTabProps) {
  const [mode, setMode] = useState<'visual' | 'code'>('visual');
  const [selectedDayKey, setSelectedDayKey] = useState<string>(program.days[0]?.key || 'Пн');

  // Code editor state
  const [codeText, setCodeText] = useState<string>(() => JSON.stringify(program, null, 2));
  const [codeError, setCodeError] = useState<string>('');
  const [codeSuccess, setCodeSuccess] = useState<string>('');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const handleSwitchToCode = () => {
    setCodeText(JSON.stringify(program, null, 2));
    setCodeError('');
    setCodeSuccess('');
    setMode('code');
  };

  const handleApplyCode = () => {
    setCodeError('');
    setCodeSuccess('');
    try {
      const parsed = JSON.parse(codeText);
      if (!parsed || !Array.isArray(parsed.days) || parsed.days.length === 0) {
        throw new Error('Конфигурация должна содержать массив "days" минимум с 1 днем.');
      }

      for (const d of parsed.days) {
        if (!d.key || !d.label || !Array.isArray(d.exercises)) {
          throw new Error(`В дне "${d.key || 'без ключа'}" отсутствуют обязательные поля (key, label, exercises).`);
        }
      }

      onUpdateProgram(parsed);
      setCodeSuccess('Программа успешно обновлена из кода!');
      setTimeout(() => setCodeSuccess(''), 3000);
    } catch (e: any) {
      setCodeError('Ошибка парсинга JSON: ' + (e?.message || String(e)));
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      // Ignored
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Сбросить программу к стандартным 5 дням? Все кастомные изменения будут сброшены.')) {
      onUpdateProgram(INITIAL_PROGRAM);
      setCodeText(JSON.stringify(INITIAL_PROGRAM, null, 2));
    }
  };

  // Visual Editor State
  const currentDay = program.days.find((d) => d.key === selectedDayKey) || program.days[0];

  const updateCurrentDay = (updater: (prev: DayDef) => DayDef) => {
    const updatedDays = program.days.map((d) => (d.key === currentDay.key ? updater(d) : d));
    const nextProgram = { ...program, days: updatedDays };
    onUpdateProgram(nextProgram);
  };

  const handleUpdateDayLabel = (newLabel: string) => {
    updateCurrentDay((d) => ({ ...d, label: newLabel }));
  };

  const handleUpdateExercise = (index: number, field: keyof ExerciseDef, val: string) => {
    updateCurrentDay((d) => {
      const exs = [...d.exercises];
      exs[index] = { ...exs[index], [field]: val };
      return { ...d, exercises: exs };
    });
  };

  const handleAddExercise = () => {
    updateCurrentDay((d) => ({
      ...d,
      exercises: [
        ...d.exercises,
        {
          code: `ex_${Date.now().toString(36).slice(-3)}`,
          name: 'Новое упражнение',
          target: '3×10',
        },
      ],
    }));
  };

  const handleRemoveExercise = (index: number) => {
    updateCurrentDay((d) => ({
      ...d,
      exercises: d.exercises.filter((_, i) => i !== index),
    }));
  };

  const handleMoveExercise = (index: number, dir: -1 | 1) => {
    const targetIdx = index + dir;
    if (targetIdx < 0 || targetIdx >= currentDay.exercises.length) return;
    updateCurrentDay((d) => {
      const exs = [...d.exercises];
      const temp = exs[index];
      exs[index] = exs[targetIdx];
      exs[targetIdx] = temp;
      return { ...d, exercises: exs };
    });
  };

  // Warmup/Cardio cues
  const currentWarmup = program.warmup?.[currentDay.key] || { before: [], after: [] };
  const currentCardio = program.cardio?.[currentDay.key] || { walk: '', row: '' };

  const updateWarmupItem = (type: 'before' | 'after', index: number, text: string) => {
    const list = [...(currentWarmup[type] || [])];
    list[index] = text;
    const nextWarmup = {
      ...program.warmup,
      [currentDay.key]: {
        ...currentWarmup,
        [type]: list,
      },
    };
    onUpdateProgram({ ...program, warmup: nextWarmup });
  };

  const addWarmupItem = (type: 'before' | 'after') => {
    const list = [...(currentWarmup[type] || []), 'Новый пункт'];
    const nextWarmup = {
      ...program.warmup,
      [currentDay.key]: {
        ...currentWarmup,
        [type]: list,
      },
    };
    onUpdateProgram({ ...program, warmup: nextWarmup });
  };

  const removeWarmupItem = (type: 'before' | 'after', index: number) => {
    const list = (currentWarmup[type] || []).filter((_, i) => i !== index);
    const nextWarmup = {
      ...program.warmup,
      [currentDay.key]: {
        ...currentWarmup,
        [type]: list,
      },
    };
    onUpdateProgram({ ...program, warmup: nextWarmup });
  };

  const updateCardio = (field: 'walk' | 'row', val: string) => {
    const nextCardio = {
      ...program.cardio,
      [currentDay.key]: {
        ...currentCardio,
        [field]: val,
      },
    };
    onUpdateProgram({ ...program, cardio: nextCardio });
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Sub-header switcher: Визуально vs Код */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
          <button
            onClick={() => setMode('visual')}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'visual'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>ВИЗУАЛЬНЫЙ РЕДАКТОР</span>
          </button>

          <button
            onClick={handleSwitchToCode}
            className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              mode === 'code'
                ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>КОД ПРОГРАММЫ (JSON)</span>
          </button>
        </div>

        <button
          onClick={handleResetToDefault}
          className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors font-mono"
          title="Сбросить к исходным 5 дням"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden sm:inline">сброс к стандарту</span>
        </button>
      </div>

      {/* MODE 1: VISUAL EDITOR */}
      {mode === 'visual' && (
        <div className="space-y-5">
          {/* Day Selector */}
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
              ВЫБОР ДНЯ ДЛЯ РЕДАКТИРОВАНИЯ
            </label>
            <div className="grid grid-cols-5 gap-2">
              {program.days.map((d) => {
                const active = selectedDayKey === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setSelectedDayKey(d.key)}
                    style={{
                      borderBottom: active ? `3px solid ${d.color}` : '3px solid transparent',
                    }}
                    className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center ${
                      active
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 border border-slate-800/80'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-bold font-mono" style={{ color: active ? d.color : undefined }}>
                      {d.key}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                      День {d.plate}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Day Label Input */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2" style={{ borderLeft: `4px solid ${currentDay.color}` }}>
            <label className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider">
              НАЗВАНИЕ И АКЦЕНТ ДНЯ ({currentDay.key})
            </label>
            <input
              type="text"
              value={currentDay.label}
              onChange={(e) => handleUpdateDayLabel(e.target.value)}
              className="w-full text-base sm:text-lg font-bold text-white bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Exercises List Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                УПРАЖНЕНИЯ ДНЯ ({currentDay.exercises.length})
              </label>
              <button
                onClick={handleAddExercise}
                className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> добавить упражнение
              </button>
            </div>

            <div className="space-y-2">
              {currentDay.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all hover:border-slate-700"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-mono font-bold text-slate-500 w-5 shrink-0">
                      {idx + 1}.
                    </span>

                    <input
                      type="text"
                      placeholder="Код"
                      value={ex.code || ''}
                      onChange={(e) => handleUpdateExercise(idx, 'code', e.target.value)}
                      className="w-14 text-xs font-mono text-slate-400 bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 shrink-0 focus:outline-none focus:border-emerald-400"
                      title="Короткий код (напр. lp, bench)"
                    />

                    <input
                      type="text"
                      placeholder="Название упражнения"
                      value={ex.name}
                      onChange={(e) => handleUpdateExercise(idx, 'name', e.target.value)}
                      className="flex-1 text-sm font-semibold text-white bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 min-w-0 focus:outline-none focus:border-emerald-400"
                    />

                    <input
                      type="text"
                      placeholder="Цель (3×10)"
                      value={ex.target || ''}
                      onChange={(e) => handleUpdateExercise(idx, 'target', e.target.value)}
                      className="w-24 text-xs font-mono text-emerald-400 font-bold bg-slate-950 border border-slate-700/80 rounded-lg px-2 py-1.5 shrink-0 focus:outline-none focus:border-emerald-400"
                      title="Целевые подходы и повторы"
                    />
                  </div>

                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button
                      onClick={() => handleMoveExercise(idx, -1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                      title="Вверх"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveExercise(idx, 1)}
                      disabled={idx === currentDay.exercises.length - 1}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20"
                      title="Вниз"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleRemoveExercise(idx)}
                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 ml-1"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warmup & Cardio Cues */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider" style={{ color: currentDay.color }}>
              ПОДСКАЗКИ ДЛЯ ДНЯ: РАЗМИНКА / ЗАМИНКА / КАРДИО
            </h4>

            {/* Before Warmup */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 font-semibold">РАЗМИНКА ДО:</span>
                <button
                  onClick={() => addWarmupItem('before')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  + пункт
                </button>
              </div>
              {currentWarmup.before?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">—</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateWarmupItem('before', idx, e.target.value)}
                    className="flex-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-400"
                  />
                  <button onClick={() => removeWarmupItem('before', idx)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* After Cooldown */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-slate-400 font-semibold">ЗАМИНКА / РАСТЯЖКА ПОСЛЕ:</span>
                <button
                  onClick={() => addWarmupItem('after')}
                  className="text-xs text-emerald-400 hover:underline"
                >
                  + пункт
                </button>
              </div>
              {currentWarmup.after?.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs">—</span>
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateWarmupItem('after', idx, e.target.value)}
                    className="flex-1 text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-400"
                  />
                  <button onClick={() => removeWarmupItem('after', idx)} className="text-slate-500 hover:text-rose-400">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Cardio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  КАРДИО: ХОДЬБА
                </label>
                <input
                  type="text"
                  value={currentCardio.walk || ''}
                  onChange={(e) => updateCardio('walk', e.target.value)}
                  className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">
                  КАРДИО: ГРЕБЛЯ / АЛЬТЕРНАТИВА
                </label>
                <input
                  type="text"
                  value={currentCardio.row || ''}
                  onChange={(e) => updateCardio('row', e.target.value)}
                  className="w-full text-xs text-slate-200 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: CODE EDITOR (JSON) */}
      {mode === 'code' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-mono text-slate-400 font-semibold flex items-center gap-1.5">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>РЕДАКТИРОВАНИЕ КОДА ПРОГРАММЫ (JSON)</span>
            </span>

            <button
              onClick={handleCopyCode}
              className="text-xs font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              {copySuccess ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copySuccess ? 'скопировано' : 'копировать код'}</span>
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Здесь можно напрямую редактировать дни, названия, упражнения, цели и разминки. Любая программа, скрипт или AI может выдать готовую JSON-структуру для вставки сюда.
            </span>
          </div>

          <textarea
            value={codeText}
            onChange={(e) => setCodeText(e.target.value)}
            rows={18}
            spellCheck={false}
            className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-800 rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/30 selection:bg-emerald-500/30"
          />

          {codeError && (
            <div className="text-xs font-mono text-rose-400 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              {codeError}
            </div>
          )}

          {codeSuccess && (
            <div className="text-xs font-mono text-emerald-400 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 font-bold">
              {codeSuccess}
            </div>
          )}

          <button
            onClick={handleApplyCode}
            className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99]"
          >
            ПРИМЕНИТЬ КОД ПРОГРАММЫ
          </button>
        </div>
      )}
    </div>
  );
}
