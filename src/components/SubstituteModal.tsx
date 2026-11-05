import React, { useState } from 'react';
import { X, RefreshCw, Check, Info } from 'lucide-react';
import { Exercise } from '../types/workout';

interface SubstituteModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
  onSelectSubstitute: (newExerciseName: string, equipment: Exercise['equipment']) => void;
}

const COMMON_ALTERNATIVES: Record<string, { name: string; equipment: Exercise['equipment'] }[]> = {
  Грудь: [
    { name: 'Жим штанги лежа на горизонтальной скамье', equipment: 'Штанга' },
    { name: 'Жим гантелей лежа на горизонтальной скамье', equipment: 'Гантели' },
    { name: 'Жим гантелей на наклонной скамье (30°)', equipment: 'Гантели' },
    { name: 'Жим штанги на наклонной скамье', equipment: 'Штанга' },
    { name: 'Жим в Хаммере на грудные', equipment: 'Тренажер' },
    { name: 'Жим в тренажере Смита', equipment: 'Тренажер' },
    { name: 'Отжимания на брусьях с наклоном', equipment: 'Свой вес' },
    { name: 'Сведение рук в кроссовере стоя', equipment: 'Блоки' },
    { name: 'Сведение рук в тренажере «Бабочка»', equipment: 'Тренажер' },
  ],
  Спина: [
    { name: 'Подтягивания широким хватом к груди', equipment: 'Свой вес' },
    { name: 'Тяга верхнего блока к груди', equipment: 'Блоки' },
    { name: 'Тяга штанги в наклоне к поясу', equipment: 'Штанга' },
    { name: 'Тяга Т-грифа с упором в грудь', equipment: 'Тренажер' },
    { name: 'Тяга горизонтального блока к поясу', equipment: 'Блоки' },
    { name: 'Тяга гантели одной рукой в упоре', equipment: 'Гантели' },
    { name: 'Пуловер с гантелью / на блоке', equipment: 'Гантели' },
  ],
  Квадрицепсы: [
    { name: 'Классические приседания со штангой', equipment: 'Штанга' },
    { name: 'Жим ногами в наклонном тренажере', equipment: 'Тренажер' },
    { name: 'Гакк-приседания в тренажере', equipment: 'Тренажер' },
    { name: 'Фронтальные приседания со штангой', equipment: 'Штанга' },
    { name: 'Болгарские сплит-приседы с гантелями', equipment: 'Гантели' },
    { name: 'Разгибания ног в тренажере сидя', equipment: 'Тренажер' },
  ],
  'Бицепс бедра': [
    { name: 'Румынская тяга с гантелями', equipment: 'Гантели' },
    { name: 'Румынская тяга со штангой', equipment: 'Штанга' },
    { name: 'Сгибания ног лежа в тренажере', equipment: 'Тренажер' },
    { name: 'Сгибания ног сидя в тренажере', equipment: 'Тренажер' },
    { name: 'Ягодичный мост со штангой', equipment: 'Штанга' },
  ],
  Плечи: [
    { name: 'Жим гантелей сидя на скамье', equipment: 'Гантели' },
    { name: 'Армейский жим стоя со штангой', equipment: 'Штанга' },
    { name: 'Жим в тренажере на плечи сидя', equipment: 'Тренажер' },
    { name: 'Махи гантелями через стороны', equipment: 'Гантели' },
    { name: 'Махи в кроссовере с нижнего блока', equipment: 'Блоки' },
    { name: 'Тяга каната к лицу (Face Pull)', equipment: 'Блоки' },
  ],
  Трицепс: [
    { name: 'Французский жим с EZ-штангой', equipment: 'Штанга' },
    { name: 'Разгибание на блоке с канатом', equipment: 'Блоки' },
    { name: 'Разгибание на блоке с прямой рукоятью', equipment: 'Блоки' },
    { name: 'Отжимания на брусьях узким хватом', equipment: 'Свой вес' },
    { name: 'Французский жим с гантелями лежа', equipment: 'Гантели' },
  ],
  Бицепс: [
    { name: 'Подъем штанги на бицепс стоя', equipment: 'Штанга' },
    { name: 'Подъем гантелей с супинацией', equipment: 'Гантели' },
    { name: 'Молотковые сгибания с гантелями', equipment: 'Гантели' },
    { name: 'Сгибания на скамье Скотта', equipment: 'Тренажер' },
    { name: 'Сгибания на нижнем блоке', equipment: 'Блоки' },
  ],
  Пресс: [
    { name: 'Подъем ног в висе на перекладине', equipment: 'Свой вес' },
    { name: 'Скручивания на наклонной скамье', equipment: 'Свой вес' },
    { name: 'Молитва (скручивания на блоке)', equipment: 'Блоки' },
    { name: 'Планка с упором на предплечья', equipment: 'Свой вес' },
  ],
  Икры: [
    { name: 'Подъем на носки стоя в тренажере', equipment: 'Тренажер' },
    { name: 'Подъем на носки сидя в тренажере', equipment: 'Тренажер' },
  ],
  Трапеции: [
    { name: 'Шраги со штангой', equipment: 'Штанга' },
    { name: 'Шраги с гантелями стоя', equipment: 'Гантели' },
  ],
  Кардио: [
    { name: 'Беговая дорожка (ходьба в гору)', equipment: 'Тренажер' },
    { name: 'Гребной тренажер', equipment: 'Тренажер' },
    { name: 'Велотренажер', equipment: 'Тренажер' },
  ],
};

export function SubstituteModal({
  exercise,
  isOpen,
  onClose,
  onSelectSubstitute,
}: SubstituteModalProps) {
  const [customName, setCustomName] = useState('');
  const [customEquipment, setCustomEquipment] = useState<Exercise['equipment']>('Тренажер');

  if (!isOpen) return null;

  // Specific substitutes recommended for this exercise
  const recommended = exercise.substitutes || [];

  // General fallback list for this muscle
  const muscleList = COMMON_ALTERNATIVES[exercise.muscle] || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">Замена упражнения</h3>
              <p className="text-xs text-slate-400 truncate max-w-xs">
                Текущее: {exercise.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Замена сохраняет фиксированную структуру программы (подходы, целевые повторы и время отдыха остаются согласованными).
            </span>
          </div>

          {/* Recommended list */}
          {recommended.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Рекомендуемые аналоги для мышечной группы ({exercise.muscle})
              </h4>
              <div className="space-y-1.5">
                {recommended.map((altName) => (
                  <button
                    key={altName}
                    onClick={() => {
                      onSelectSubstitute(altName, 'Тренажер');
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                  >
                    <span className="text-sm font-medium text-slate-200 group-hover:text-emerald-300">
                      {altName}
                    </span>
                    <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                      Выбрать <Check className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* More options for this muscle */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Все упражнения на целевую зону ({exercise.muscle})
            </h4>
            <div className="space-y-1.5">
              {muscleList
                .filter((item) => item.name !== exercise.name && !recommended.includes(item.name))
                .map((item) => (
                  <button
                    key={item.name}
                    onClick={() => {
                      onSelectSubstitute(item.name, item.equipment);
                      onClose();
                    }}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-emerald-500/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-200 group-hover:text-emerald-300">
                        {item.name}
                      </div>
                      <div className="text-xs text-slate-400">
                        Оборудование: {item.equipment}
                      </div>
                    </div>
                    <span className="text-xs text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 font-semibold">
                      Выбрать <Check className="w-3.5 h-3.5" />
                    </span>
                  </button>
                ))}
            </div>
          </div>

          {/* Custom substitute option */}
          <div className="pt-2 border-t border-slate-800">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Свой вариант
            </h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Название упражнения..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <div className="flex items-center justify-between gap-2">
                <select
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value as Exercise['equipment'])}
                  className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                >
                  <option value="Штанга">Штанга</option>
                  <option value="Гантели">Гантели</option>
                  <option value="Тренажер">Тренажер</option>
                  <option value="Блоки">Блоки</option>
                  <option value="Свой вес">Свой вес</option>
                </select>
                <button
                  type="button"
                  disabled={!customName.trim()}
                  onClick={() => {
                    if (customName.trim()) {
                      onSelectSubstitute(customName.trim(), customEquipment);
                      onClose();
                    }
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 text-xs font-bold rounded-lg transition-colors"
                >
                  Применить замену
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
