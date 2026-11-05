export interface ExerciseDef {
  code: string | null;
  name: string;
  target: string;
}

export interface DayDef {
  key: string; // 'Пн', 'Чт', 'Пт', 'Сб', 'Вс'
  plate: string;
  color: string;
  label: string;
  exercises: ExerciseDef[];
}

export interface WarmupDef {
  before: string[];
  after: string[];
}

export interface CardioDef {
  walk: string;
  row: string;
}

export interface ProgramConfig {
  days: DayDef[];
  warmup: Record<string, WarmupDef>;
  cardio: Record<string, CardioDef>;
  legacyCodes?: Record<string, string>;
}

export interface SetEntry {
  weight: string | number;
  reps: string | number;
}

export interface WorkoutExerciseState {
  code: string | null;
  name: string;
  target: string;
  sets: SetEntry[];
}

export interface SavedSet {
  weight: number;
  reps: number;
}

export interface SavedExercise {
  code: string | null;
  name: string;
  sets: SavedSet[];
}

export interface WorkoutSession {
  id: string;
  date: string; // YYYY-MM-DD
  day: string;  // 'Пн', etc.
  exercises: SavedExercise[];
}
