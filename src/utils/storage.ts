import { WorkoutProgram, CompletedWorkout, PersonalRecord } from '../types/workout';
import { DEFAULT_PROGRAMS } from '../data/defaultPrograms';

const STORAGE_KEYS = {
  ACTIVE_PROGRAM: 'irontrack_active_program_v1',
  SELECTED_DAY_ID: 'irontrack_selected_day_id_v1',
  ACTIVE_SESSION: 'irontrack_active_session_v1',
  COMPLETED_WORKOUTS: 'irontrack_completed_workouts_v1',
  PERSONAL_RECORDS: 'irontrack_personal_records_v1',
  SETTINGS: 'irontrack_settings_v1',
};

export interface AppSettings {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  autoStartTimer: boolean;
  barbellWeightKg: number; // default 20kg
  themeMode: 'dark' | 'light';
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  vibrationEnabled: true,
  autoStartTimer: true,
  barbellWeightKg: 20,
  themeMode: 'dark',
};

// Seed sample completed workouts for rich first-turn UX
const INITIAL_HISTORY: CompletedWorkout[] = [
  {
    id: 'hist-1',
    programId: 'program-classic-split',
    dayId: 'split-mon',
    dayTitle: 'День 1: Грудь, Передняя дельта и Трицепс',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    durationSeconds: 3840, // 64 minutes
    totalTonnageKg: 7850,
    completedSetsCount: 19,
    totalSetsCount: 19,
    rpeRating: 8,
    notes: 'Отличная тренировка. В жиме лежа чувствовал запас сил, техника чистая.',
    recordsAchieved: ['Жим штанги лежа: 80 кг × 8 повт'],
    exercisesSnapshot: [
      {
        name: 'Жим штанги лежа',
        sets: [
          { weightKg: 70, reps: 10, completed: true },
          { weightKg: 77.5, reps: 8, completed: true },
          { weightKg: 80, reps: 8, completed: true },
          { weightKg: 80, reps: 7, completed: true },
        ],
      },
      {
        name: 'Жим гантелей 30°',
        sets: [
          { weightKg: 26, reps: 10, completed: true },
          { weightKg: 26, reps: 9, completed: true },
          { weightKg: 26, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: 'hist-2',
    programId: 'program-classic-split',
    dayId: 'split-wed',
    dayTitle: 'День 2: Спина, Задняя дельта и Бицепс',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    durationSeconds: 4120, // 68 minutes
    totalTonnageKg: 8420,
    completedSetsCount: 20,
    totalSetsCount: 20,
    rpeRating: 9,
    notes: 'Тяжелая тяга в наклоне, спина забилась отлично. Добавил 2.5кг в подъеме на бицепс.',
    recordsAchieved: ['Подтягивания с весом: +5 кг × 9 повт'],
    exercisesSnapshot: [
      {
        name: 'Подтягивания широким хватом',
        sets: [
          { weightKg: 0, reps: 10, completed: true },
          { weightKg: 5, reps: 9, completed: true },
          { weightKg: 5, reps: 8, completed: true },
          { weightKg: 5, reps: 7, completed: true },
        ],
      },
    ],
  },
];

const INITIAL_PRS: PersonalRecord[] = [
  {
    exerciseName: 'Жим штанги лежа',
    maxWeightKg: 80,
    repsAtMax: 8,
    calculated1RM: 100,
    achievedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
  },
  {
    exerciseName: 'Приседания со штангой',
    maxWeightKg: 100,
    repsAtMax: 8,
    calculated1RM: 125,
    achievedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
  },
  {
    exerciseName: 'Тяга штанги в наклоне',
    maxWeightKg: 70,
    repsAtMax: 9,
    calculated1RM: 89,
    achievedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString('ru-RU'),
  },
];

export function getActiveProgram(): WorkoutProgram {
  if (typeof window === 'undefined') return DEFAULT_PROGRAMS[0];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_PROGRAM);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to load active program from storage', e);
  }
  return DEFAULT_PROGRAMS[0];
}

export function saveActiveProgram(program: WorkoutProgram): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PROGRAM, JSON.stringify(program));
  } catch (e) {
    console.error('Failed to save program', e);
  }
}

export function getSelectedDayId(program: WorkoutProgram): string {
  if (typeof window === 'undefined') return program.days[0].id;
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_DAY_ID);
    if (saved && program.days.some((d) => d.id === saved)) {
      return saved;
    }
  } catch {
    // ignore
  }

  // Auto-detect based on current day of week (1 = Mon, 7 = Sun)
  const currentDayIndex = (new Date().getDay() + 6) % 7; // Mon is 0
  const match = program.days[currentDayIndex];
  return match ? match.id : program.days[0].id;
}

export function saveSelectedDayId(dayId: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SELECTED_DAY_ID, dayId);
  } catch {
    // ignore
  }
}

export function getCompletedWorkouts(): CompletedWorkout[] {
  if (typeof window === 'undefined') return INITIAL_HISTORY;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPLETED_WORKOUTS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return INITIAL_HISTORY;
}

export function saveCompletedWorkout(workout: CompletedWorkout): void {
  try {
    const list = getCompletedWorkouts();
    const updated = [workout, ...list];
    localStorage.setItem(STORAGE_KEYS.COMPLETED_WORKOUTS, JSON.stringify(updated));

    // Update PR records
    updatePersonalRecordsFromWorkout(workout);
  } catch (e) {
    console.error('Failed to save workout', e);
  }
}

export function getPersonalRecords(): PersonalRecord[] {
  if (typeof window === 'undefined') return INITIAL_PRS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PERSONAL_RECORDS);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return INITIAL_PRS;
}

function updatePersonalRecordsFromWorkout(workout: CompletedWorkout) {
  const currentPRs = getPersonalRecords();
  const prMap = new Map(currentPRs.map((pr) => [pr.exerciseName, pr]));

  for (const ex of workout.exercisesSnapshot) {
    for (const set of ex.sets) {
      if (!set.completed || set.weightKg <= 0 || set.reps <= 0) continue;
      // Epley formula: 1RM = weight * (1 + reps / 30)
      const est1RM = Math.round(set.weightKg * (1 + set.reps / 30));
      const existing = prMap.get(ex.name);

      if (!existing || est1RM > existing.calculated1RM) {
        prMap.set(ex.name, {
          exerciseName: ex.name,
          maxWeightKg: set.weightKg,
          repsAtMax: set.reps,
          calculated1RM: est1RM,
          achievedDate: new Date().toLocaleDateString('ru-RU'),
        });
      }
    }
  }

  try {
    localStorage.setItem(
      STORAGE_KEYS.PERSONAL_RECORDS,
      JSON.stringify(Array.from(prMap.values()))
    );
  } catch {
    // ignore
  }
}

export function getSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {
    // ignore
  }
}
