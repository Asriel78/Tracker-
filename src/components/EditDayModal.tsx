import React, { useState } from 'react';
import { DayWorkoutTemplate, Exercise } from '../types/workout';
import { X, Plus, Trash2 } from 'lucide-react';

interface EditDayModalProps {
  dayTemplate: DayWorkoutTemplate;
  isOpen: boolean;
  onClose: () => void;
  onSaveDay: (updated: DayWorkoutTemplate) => void;
}

export function EditDayModal({
  dayTemplate,
  isOpen,
  onClose,
  onSaveDay,
}: EditDayModalProps) {
  const [exercises, setExercises] = useState<Exercise[]>(dayTemplate.exercises);
  const [newExerciseName, setNewExerciseName] = useState('');

  if (!isOpen) return null;

  const handleRemove = (id: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== id));
  };

  const handleAdd = () => {
    if (!newExerciseName.trim()) return;
    const newEx: Exercise = {
      id: `ex-${Date.now()}`,
      name: newExerciseName.trim(),
      muscle: 'Грудь',
      equipment: 'Штанга',
      targetSetsCount: 3,
      defaultReps: '10',
      targetRestSeconds: 90,
      cue: '',
      sets: Array.from({ length: 3 }, (_, i) => ({
        id: `set-${Math.random().toString(36).slice(2, 8)}`,
        setNumber: i + 1,
        type: 'working',
        targetReps: '10',
        actualWeightKg: 20,
        actualReps: 10,
        completed: false,
      })),
    };
    setExercises((prev) => [...prev, newEx]);
    setNewExerciseName('');
  };

  const handleSave = () => {
    onSaveDay({
      ...dayTemplate,
      exercises,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-base font-bold text-white">
            Настройка программы: {dayTemplate.dayName}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-2.5 overflow-y-auto flex-1">
          <div className="text-xs text-slate-400">
            Список фиксированных упражнений на этот день:
          </div>

          <div className="space-y-2">
            {exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-slate-500 font-bold">{idx + 1}.</span>
                  <span className="font-medium text-white">{ex.name}</span>
                </div>
                <button
                  onClick={() => handleRemove(ex.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add exercise input */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              placeholder="Добавить упражнение..."
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              className="flex-1 px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleAdd}
              disabled={!newExerciseName.trim()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Добавить</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-slate-400 hover:text-white"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
