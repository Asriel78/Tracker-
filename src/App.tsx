import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Minus, ChevronDown, ChevronUp, Trash2, Dumbbell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ProgramConfig, WorkoutSession, WorkoutExerciseState, DayDef } from './types/workoutProgram';
import { COLORS, INITIAL_PROGRAM } from './data/initialProgram';
import {
  loadSessions,
  saveSessions,
  loadDraft,
  saveDraft,
  loadProgramConfig,
  saveProgramConfig,
} from './utils/localStorageManager';
import { PWAInstallButton } from './components/PWAInstallButton';
import { RecentSessionsBadge } from './components/RecentSessionsBadge';
import { ProgramEditorTab } from './components/ProgramEditorTab';

function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
}

function emptySetsFor(defs: { code: string | null; name: string; target: string }[]): WorkoutExerciseState[] {
  return defs.map((def) => ({
    code: def.code,
    name: def.name,
    target: def.target,
    sets: [{ weight: '', reps: '' }],
  }));
}

function num(v: any): number | null {
  const n = Number(String(v).trim().replace(',', '.'));
  return Number.isNaN(n) ? null : n;
}

function encodeSessions(list: WorkoutSession[]): string {
  return list
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((s) => {
      const parts = s.exercises.map((ex) => {
        const sets = ex.sets.map((st) => `${st.weight}x${st.reps}`).join(',');
        return ex.code ? `${ex.code}:${sets}` : `*${ex.name}:${sets}`;
      });
      return [s.date, s.day, ...parts].join('|');
    })
    .join('\n');
}

function decodeSessions(text: string, codeToName: Record<string, string>): WorkoutSession[] {
  const out: WorkoutSession[] = [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  lines.forEach((line, lineIdx) => {
    const parts = line.split('|').map((p) => p.trim()).filter(Boolean);
    if (parts.length < 3) throw new Error(`строка ${lineIdx + 1}: мало полей`);
    const date = parts[0];
    const day = parts[1];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error(`строка ${lineIdx + 1}: дата "${date}" не в формате ГГГГ-ММ-ДД`);
    }
    const exercises = parts.slice(2).map((chunk) => {
      const sep = chunk.indexOf(':');
      if (sep === -1) throw new Error(`строка ${lineIdx + 1}: нет двоеточия в "${chunk}"`);
      const key = chunk.slice(0, sep);
      const setsRaw = chunk.slice(sep + 1);
      const sets = setsRaw.split(',').map((pair) => {
        const [w, r] = pair.split('x');
        const weight = num(w);
        const reps = num(r);
        if (weight === null || reps === null) {
          throw new Error(`строка ${lineIdx + 1}: не разобрать подход "${pair}"`);
        }
        return { weight, reps };
      });
      if (key.startsWith('*')) return { code: null, name: key.slice(1), sets };
      const name = codeToName[key];
      if (!name) return { code: key, name: key, sets };
      return { code: key, name, sets };
    });
    out.push({ id: `${date}-${day}-${lineIdx}`, date, day, exercises });
  });
  return out;
}

export default function App() {
  const [view, setView] = useState<'new' | 'history' | 'progress' | 'program' | 'data'>('new');
  const [program, setProgram] = useState<ProgramConfig>(INITIAL_PROGRAM);
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string>('Пн');
  const [date, setDate] = useState<string>(todayISO());
  const [drafts, setDrafts] = useState<Record<string, WorkoutExerciseState[]>>({});
  const [customName, setCustomName] = useState<string>('');
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [progressExercise, setProgressExercise] = useState<string>('');
  const [savedFlash, setSavedFlash] = useState<boolean>(false);
  const [showWarmup, setShowWarmup] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string>('');
  const [importText, setImportText] = useState<string>('');
  const [importMessage, setImportMessage] = useState<string>('');
  const [copyMessage, setCopyMessage] = useState<string>('');
  const [exportScope, setExportScope] = useState<'day' | 'week' | 'all'>('all');
  const [storageStatus, setStorageStatus] = useState<string>('проверяю локальное хранилище...');

  const exportRef = useRef<HTMLTextAreaElement | null>(null);
  const loadedRef = useRef<boolean>(false);

  // 1. Initial Load from Local Storage
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [loadedProg, loadedSess, loadedDrft] = await Promise.all([
          loadProgramConfig(),
          loadSessions(),
          loadDraft(),
        ]);

        if (cancelled) return;

        if (loadedProg) setProgram(loadedProg);
        if (loadedSess) setSessions(loadedSess);
        if (loadedDrft) {
          if (loadedDrft.drafts) setDrafts(loadedDrft.drafts);
          if (loadedDrft.selectedDayKey) setSelectedDayKey(loadedDrft.selectedDayKey);
          if (loadedDrft.date && loadedDrft.updatedAt && Date.now() - loadedDrft.updatedAt < 12 * 3600000) {
            setDate(loadedDrft.date);
          }
        }
        setStorageStatus('локальное хранилище активно (офлайн)');
      } catch {
        if (!cancelled) setStorageStatus('ошибка доступа к хранилищу');
      } finally {
        if (!cancelled) loadedRef.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2. Persist Sessions
  useEffect(() => {
    if (!loadedRef.current) return;
    saveSessions(sessions);
  }, [sessions]);

  // 3. Persist Drafts
  useEffect(() => {
    if (!loadedRef.current) return;
    saveDraft({ drafts, selectedDayKey, date, updatedAt: Date.now() });
  }, [drafts, selectedDayKey, date]);

  // 4. Persist Program config
  const handleUpdateProgram = (newConfig: ProgramConfig) => {
    setProgram(newConfig);
    saveProgramConfig(newConfig);
  };

  const codeToName = useMemo(() => {
    const map: Record<string, string> = {};
    if (program.legacyCodes) {
      Object.assign(map, program.legacyCodes);
    }
    program.days.forEach((d) => {
      d.exercises.forEach((e) => {
        if (e.code) map[e.code] = e.name;
      });
    });
    return map;
  }, [program]);

  const activeDay: DayDef =
    program.days.find((d) => d.key === selectedDayKey) ||
    program.days[0] || {
      key: selectedDayKey,
      plate: '1',
      color: COLORS.neonEmerald,
      label: 'День',
      exercises: [],
    };

  const exercises = drafts[selectedDayKey] || emptySetsFor(activeDay.exercises);

  function setExercises(updater: (prev: WorkoutExerciseState[]) => WorkoutExerciseState[]) {
    setDrafts((prev) => {
      const current = prev[selectedDayKey] || emptySetsFor(activeDay.exercises);
      const next = updater(current);
      return { ...prev, [selectedDayKey]: next };
    });
  }

  function clearDraft() {
    setDrafts((prev) => {
      const n = { ...prev };
      delete n[selectedDayKey];
      return n;
    });
  }

  function updateSet(exIdx: number, setIdx: number, field: 'weight' | 'reps', value: string) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i !== exIdx
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, j) => (j === setIdx ? { ...s, [field]: value } : s)),
            }
      )
    );
  }

  function addSet(exIdx: number) {
    setExercises((prev) =>
      prev.map((ex, i) =>
        i === exIdx
          ? {
              ...ex,
              sets: [...ex.sets, { weight: '', reps: '' }],
            }
          : ex
      )
    );
  }

  function removeSet(exIdx: number, setIdx: number) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx || ex.sets.length === 1) return ex;
        return { ...ex, sets: ex.sets.filter((_, j) => j !== setIdx) };
      })
    );
  }

  function handleApplyLastWeights(exIdx: number, lastSets: { weight: number | string; reps: number | string }[]) {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        return {
          ...ex,
          sets: lastSets.map((st) => ({
            weight: String(st.weight),
            reps: String(st.reps),
          })),
        };
      })
    );
  }

  function addCustomExercise() {
    const name = customName.trim();
    if (!name) return;
    setExercises((prev) => [
      ...prev,
      { code: null, name, target: '', sets: [{ weight: '', reps: '' }] },
    ]);
    setCustomName('');
  }

  function removeExercise(exIdx: number) {
    setExercises((prev) => prev.filter((_, i) => i !== exIdx));
  }

  function saveSession() {
    setSaveError('');
    const cleaned = exercises
      .map((ex) => ({
        code: ex.code,
        name: ex.name,
        sets: ex.sets
          .filter((s) => String(s.weight).trim() !== '' && String(s.reps).trim() !== '')
          .map((s) => ({ weight: num(s.weight)!, reps: num(s.reps)! }))
          .filter((s) => s.weight !== null && s.reps !== null),
      }))
      .filter((ex) => ex.sets.length > 0);

    if (cleaned.length === 0) {
      setSaveError('Нет заполненных подходов.');
      return;
    }

    setSessions((prev) => [
      ...prev,
      { id: Date.now().toString(), date, day: selectedDayKey, exercises: cleaned },
    ]);
    clearDraft();
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  }

  function deleteSession(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }

  const sortedSessions = useMemo(
    () =>
      sessions
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date) || String(b.id).localeCompare(String(a.id))),
    [sessions]
  );

  const allExerciseNames = useMemo(() => {
    const set = new Set<string>();
    program.days.forEach((d) => d.exercises.forEach((e) => set.add(e.name)));
    sessions.forEach((s) => s.exercises.forEach((e) => set.add(e.name)));
    return Array.from(set).sort();
  }, [program, sessions]);

  const exportText = useMemo(() => {
    if (sessions.length === 0) return '';
    if (exportScope === 'day') return encodeSessions(sortedSessions.slice(0, 1));
    if (exportScope === 'week') {
      const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      return encodeSessions(sessions.filter((s) => s.date >= cutoff));
    }
    return encodeSessions(sessions);
  }, [sessions, sortedSessions, exportScope]);

  function importData() {
    setImportMessage('');
    try {
      const parsed = decodeSessions(importText, codeToName);
      if (parsed.length === 0) throw new Error('пусто');
      const map = new Map<string, WorkoutSession>();
      sessions.forEach((s) => map.set(`${s.date}|${s.day}`, s));
      parsed.forEach((s) => map.set(`${s.date}|${s.day}`, s));
      const nextSessions = Array.from(map.values());
      setSessions(nextSessions);
      setImportMessage(`Загружено: ${parsed.length}. Всего: ${map.size}`);
      setImportText('');
    } catch (e: any) {
      setImportMessage('Ошибка — ' + (e && e.message ? e.message : String(e)));
    }
  }

  async function copyExport() {
    setCopyMessage('');
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyMessage('скопировано');
      setTimeout(() => setCopyMessage(''), 2000);
      return;
    } catch {}
    try {
      const ta = exportRef.current;
      if (ta) {
        ta.focus();
        ta.select();
        if (document.execCommand('copy')) {
          setCopyMessage('скопировано');
          setTimeout(() => setCopyMessage(''), 2000);
          return;
        }
      }
    } catch {}
    setCopyMessage('выдели вручную');
  }

  const progressData = useMemo(() => {
    if (!progressExercise) return [];
    const rows: { date: string; weight: number }[] = [];
    sessions
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((s) => {
        const ex = s.exercises.find((e) => e.name.toLowerCase() === progressExercise.toLowerCase());
        if (ex && ex.sets.length > 0) {
          rows.push({
            date: s.date.slice(5),
            weight: Math.max(...ex.sets.map((st) => st.weight)),
          });
        }
      });
    return rows;
  }, [progressExercise, sessions]);

  const recentSetsDetail = useMemo(() => {
    if (!progressExercise) return [];
    return sortedSessions
      .filter((s) => s.exercises.some((e) => e.name.toLowerCase() === progressExercise.toLowerCase()))
      .slice(0, 5)
      .map((s) => ({
        date: s.date,
        sets: s.exercises.find((e) => e.name.toLowerCase() === progressExercise.toLowerCase())!.sets,
      }));
  }, [progressExercise, sortedSessions]);

  const TabButton = ({
    id,
    children,
  }: {
    id: 'new' | 'history' | 'progress' | 'program' | 'data';
    children: React.ReactNode;
  }) => {
    const active = view === id;
    return (
      <button
        onClick={() => setView(id)}
        className={`text-xs sm:text-sm font-mono font-bold tracking-wider px-2 py-2 border-b-2 transition-all ${
          active
            ? 'text-emerald-400 border-emerald-400'
            : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700'
        }`}
      >
        {children}
      </button>
    );
  };

  const ScopeButton = ({
    id,
    children,
  }: {
    id: 'day' | 'week' | 'all';
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => setExportScope(id)}
      className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-colors border ${
        exportScope === id
          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold'
          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
      }`}
    >
      {children}
    </button>
  );

  const currentWarmup = program.warmup?.[activeDay.key];
  const currentCardio = program.cardio?.[activeDay.key];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 selection:bg-emerald-500/30 selection:text-emerald-300">
      <div className="max-w-xl mx-auto px-4 pt-5">
        {/* Dark Neon Header */}
        <header className="pb-3.5 mb-4 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm shadow-emerald-500/20">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>ТРЕКЕР ТРЕНИРОВОК</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h1>
              <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                {storageStatus}
              </p>
            </div>
          </div>

          {/* Requirement 1: PWA Install Button */}
          <PWAInstallButton />
        </header>

        {/* Tabs Bar */}
        <nav className="flex items-center gap-1 sm:gap-2 mb-6 border-b border-slate-800/80 overflow-x-auto">
          <TabButton id="new">НОВАЯ</TabButton>
          <TabButton id="history">ИСТОРИЯ</TabButton>
          <TabButton id="progress">ПРОГРЕСС</TabButton>
          <TabButton id="program">ПРОГРАММА</TabButton>
          <TabButton id="data">ДАННЫЕ</TabButton>
        </nav>

        {/* VIEW 1: НОВАЯ ТРЕНИРОВКА */}
        {view === 'new' && (
          <div className="space-y-6">
            {/* Date Input */}
            <div>
              <label className="text-[11px] font-mono font-semibold text-slate-400 block mb-1.5 uppercase tracking-wider">
                ДАТА
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* 5-day picker with neon active tabs */}
            <div>
              <label className="text-[11px] font-mono font-semibold text-slate-400 block mb-2 uppercase tracking-wider">
                ДЕНЬ НЕДЕЛИ
              </label>
              <div className="grid grid-cols-5 gap-2">
                {program.days.map((d) => {
                  const active = selectedDayKey === d.key;
                  return (
                    <button
                      key={d.key}
                      onClick={() => setSelectedDayKey(d.key)}
                      style={{
                        borderColor: active ? d.color : undefined,
                        boxShadow: active ? `0 0 12px ${d.color}25` : undefined,
                      }}
                      className={`py-2 px-1 rounded-xl transition-all flex flex-col items-center justify-center border ${
                        active
                          ? 'bg-slate-900 text-white font-bold'
                          : 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 border-slate-800/80 hover:text-white'
                      }`}
                    >
                      <span className="text-base sm:text-lg font-mono font-black" style={{ color: active ? d.color : undefined }}>
                        {d.key}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                        День {d.plate}
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-slate-300 mt-2 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeDay.color }} />
                <span>{activeDay.label}</span>
              </p>
            </div>

            {/* Warmup / Cooldown / Cardio accordion */}
            {currentWarmup && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800/90 overflow-hidden">
                <button
                  onClick={() => setShowWarmup(!showWarmup)}
                  className="w-full flex items-center justify-between p-3.5 text-xs font-mono font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeDay.color }} />
                    <span>РАЗМИНКА / ЗАМИНКА / КАРДИО</span>
                  </span>
                  {showWarmup ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {showWarmup && (
                  <div className="p-4 pt-1 border-t border-slate-800/60 space-y-4">
                    {[['ДО', currentWarmup.before], ['ПОСЛЕ', currentWarmup.after]].map(([title, items]) => (
                      <div key={title as string}>
                        <p className="text-xs font-mono font-bold mb-1.5" style={{ color: activeDay.color }}>
                          {title}
                        </p>
                        <ul className="space-y-1">
                          {(items as string[]).map((item, i) => (
                            <li key={i} className="text-xs text-slate-300 leading-relaxed">
                              — {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {currentCardio && (
                      <div className="pt-1 border-t border-slate-800/60">
                        <p className="text-xs font-mono font-bold mb-1.5" style={{ color: activeDay.color }}>
                          КАРДИО
                        </p>
                        <ul className="space-y-1 text-xs text-slate-300">
                          {currentCardio.walk && <li>— {currentCardio.walk}</li>}
                          {currentCardio.row && <li>— {currentCardio.row}</li>}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Exercises List */}
            <div className="space-y-4">
              {exercises.map((ex, exIdx) => (
                <div
                  key={exIdx}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 transition-all hover:border-slate-700/80 shadow-md"
                  style={{ borderLeft: `4px solid ${activeDay.color}` }}
                >
                  <div className="flex items-start justify-between mb-1 gap-2">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-white">
                        {ex.name}
                      </span>
                      {ex.target && (
                        <span className="text-xs font-mono text-emerald-400/90 ml-2 font-semibold">
                          {ex.target}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeExercise(exIdx)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Удалить упражнение"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* REQUIREMENT 3: DARK NEON PLAQUE WITH LAST 3 SESSIONS */}
                  <RecentSessionsBadge
                    exerciseName={ex.name}
                    sessions={sessions}
                    onApplyLastWeights={(lastSets) => handleApplyLastWeights(exIdx, lastSets)}
                  />

                  {/* Dynamic Sets with '+' and '-' */}
                  <div className="space-y-2 mt-2.5">
                    {ex.sets.map((s, setIdx) => (
                      <div
                        key={setIdx}
                        className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/60 border border-slate-800/70"
                      >
                        <span className="text-xs font-mono font-bold text-slate-500 w-4 text-center">
                          {setIdx + 1}
                        </span>
                        <input
                          type="text"
                          inputMode="decimal"
                          placeholder="кг"
                          value={s.weight}
                          onChange={(e) => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                          className="flex-1 min-w-0 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-white text-center focus:outline-none focus:border-emerald-400"
                        />
                        <span className="text-slate-500 text-xs">×</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="повт"
                          value={s.reps}
                          onChange={(e) => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                          className="flex-1 min-w-0 bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-sm font-mono font-bold text-white text-center focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          onClick={() => removeSet(exIdx, setIdx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Удалить подход"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Dynamic + подход button */}
                  <button
                    onClick={() => addSet(exIdx)}
                    style={{ color: activeDay.color }}
                    className="mt-2.5 flex items-center gap-1 text-xs font-mono font-bold hover:underline"
                  >
                    <Plus className="w-3 h-3" /> подход
                  </button>
                </div>
              ))}
            </div>

            {/* Add Custom Exercise */}
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/50 border border-slate-800">
              <input
                type="text"
                placeholder="добавить упражнение"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 bg-transparent border-none text-xs text-white placeholder-slate-500 px-2 py-1 focus:outline-none"
              />
              <button
                onClick={addCustomExercise}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={saveSession}
              className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-base transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
            >
              {savedFlash ? '✓ СОХРАНЕНО' : 'СОХРАНИТЬ ТРЕНИРОВКУ'}
            </button>

            {saveError && (
              <p className="text-xs font-mono text-rose-400 text-center">{saveError}</p>
            )}

            {drafts[selectedDayKey] && (
              <button
                onClick={clearDraft}
                className="text-xs font-mono text-slate-500 hover:text-rose-400 mx-auto block transition-colors"
              >
                очистить введённое за этот день
              </button>
            )}
          </div>
        )}

        {/* VIEW 2: ИСТОРИЯ */}
        {view === 'history' && (
          <div className="space-y-3">
            {sortedSessions.length === 0 && (
              <p className="text-sm text-slate-500 py-10 text-center">Записей нет.</p>
            )}
            {sortedSessions.map((s) => {
              const d = program.days.find((day) => day.key === s.day) || {
                color: COLORS.neonEmerald,
                label: s.day,
              };
              return (
                <div
                  key={s.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setExpandedSession(expandedSession === s.id ? null : s.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-mono text-sm font-bold text-white">{s.date}</span>
                      <span className="text-xs text-slate-400">{d.label}</span>
                    </div>
                    {expandedSession === s.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {expandedSession === s.id && (
                    <div className="p-4 pt-1 border-t border-slate-800/70 bg-slate-950/40 space-y-2.5">
                      {s.exercises.map((ex, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-bold text-white">{ex.name}:</span>
                          <span className="font-mono text-emerald-400 ml-2">
                            {ex.sets.map((st) => `${st.weight}×${st.reps}`).join('   ')}
                          </span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-slate-800/60">
                        <button
                          onClick={() => deleteSession(s.id)}
                          className="text-xs font-mono text-rose-400 hover:underline"
                        >
                          удалить эту запись
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* VIEW 3: ПРОГРЕСС */}
        {view === 'progress' && (
          <div className="space-y-6">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-2 font-semibold uppercase tracking-wider">
                ВЫБЕРИТЕ УПРАЖНЕНИЕ
              </label>
              <select
                value={progressExercise}
                onChange={(e) => setProgressExercise(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="">выберите упражнение для графика...</option>
                {allExerciseNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {progressExercise && progressData.length === 0 && (
              <p className="text-sm text-slate-500 py-10 text-center">Данных по этому упражнению пока нет.</p>
            )}

            {progressData.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="text-xs font-mono text-slate-400 mb-2 font-semibold">
                  ДИНАМИКА МАКСИМАЛЬНОГО ВЕСА (КГ):
                </div>
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={progressData}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }}
                      width={32}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#020617',
                        border: '1px solid #334155',
                        borderRadius: '0.75rem',
                        fontFamily: 'monospace',
                        fontSize: 12,
                        color: '#f8fafc',
                      }}
                      labelStyle={{ color: '#10b981' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      name="вес"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6, fill: '#34d399' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {recentSetsDetail.length > 0 && (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
                <p className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider">
                  ПОСЛЕДНИЕ {recentSetsDetail.length} ТРЕНИРОВОК — ВСЕ ПОДХОДЫ:
                </p>
                <div className="space-y-2">
                  {recentSetsDetail.map((entry, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-400">{entry.date}</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {entry.sets.map((st) => `${st.weight}×${st.reps}`).join('   ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: REQUIREMENT 2 — ПРОГРАММА (ЧЕЛОВЕК И КОД) */}
        {view === 'program' && (
          <ProgramEditorTab program={program} onUpdateProgram={handleUpdateProgram} />
        )}

        {/* VIEW 5: ДАННЫЕ */}
        {view === 'data' && (
          <div className="space-y-6">
            {/* Export */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label className="font-mono font-bold text-slate-400 uppercase tracking-wider">
                  ЭКСПОРТ ДАННЫХ
                </label>
                <button
                  onClick={copyExport}
                  className="font-mono font-bold text-emerald-400 hover:text-emerald-300"
                >
                  {copyMessage || 'копировать'}
                </button>
              </div>
              <div className="flex gap-2">
                <ScopeButton id="day">последний день</ScopeButton>
                <ScopeButton id="week">неделя</ScopeButton>
                <ScopeButton id="all">всё ({sessions.length})</ScopeButton>
              </div>
              <textarea
                ref={exportRef}
                readOnly
                value={exportText}
                onFocus={(e) => e.target.select()}
                rows={5}
                className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Import */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <label className="text-xs font-mono font-bold text-slate-400 block uppercase tracking-wider">
                ИМПОРТ ДАННЫХ — ДОБАВЛЯЕТ БЕЗ УДАЛЕНИЯ
              </label>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="вставьте сюда строки тренировок в формате: ГГГГ-ММ-ДД|День|код:весxповт"
                rows={5}
                className="w-full text-xs font-mono p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-400"
              />
              <button
                onClick={importData}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono font-bold text-xs transition-colors"
              >
                ЗАГРУЗИТЬ
              </button>
              {importMessage && (
                <p className={`text-xs font-mono ${importMessage.startsWith('Ошибка') ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {importMessage}
                </p>
              )}
            </div>

            {/* Format info */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 space-y-1">
              <p className="font-mono font-bold text-slate-300">ФОРМАТ СТРОК:</p>
              <p>Одна строка = одна тренировка. Дата | День | код:вес×повт.</p>
              <p className="font-mono text-emerald-400/90 break-all text-[11px] pt-1">
                2026-09-15|Пн|lp:120x10,140x10|ht:70x12
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
