export type MuscleGroup =
  | 'Грудь'
  | 'Спина'
  | 'Квадрицепсы'
  | 'Бицепс бедра'
  | 'Плечи'
  | 'Бицепс'
  | 'Трицепс'
  | 'Руки'
  | 'Пресс'
  | 'Икры'
  | 'Трапеции'
  | 'Кардио';

export type SetType = 'warmup' | 'working' | 'drop' | 'failure';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  type: SetType;
  targetReps: string; // e.g. "8-10" or "12"
  targetWeightKg?: number;
  actualWeightKg: number;
  actualReps: number;
  completed: boolean;
  prevHistory?: {
    weightKg: number;
    reps: number;
    date: string;
  };
}

export interface Exercise {
  id: string;
  name: string;
  muscle: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: 'Штанга' | 'Гантели' | 'Тренажер' | 'Свой вес' | 'Блоки';
  targetSetsCount: number;
  defaultReps: string;
  targetRestSeconds: number;
  cue: string; // Технический фокус, напр. "Локти 45 градусов, пауза 1 сек"
  substitutes?: string[]; // Альтернативные упражнения
  sets: ExerciseSet[];
}

export interface DayWorkoutTemplate {
  id: string;
  dayNumber: number; // 1 to 7
  dayName: string; // "Понедельник", "День 1"
  title: string; // "Грудь и Трицепс"
  isRestDay: boolean;
  restDescription?: string;
  estimatedMinutes: number;
  targetMuscles: MuscleGroup[];
  exercises: Exercise[];
}

export interface WorkoutProgram {
  id: string;
  title: string;
  description: string;
  daysPerWeek: number;
  level: 'Начальный' | 'Средний' | 'Продвинутый';
  days: DayWorkoutTemplate[];
}

export interface CompletedWorkout {
  id: string;
  programId: string;
  dayId: string;
  dayTitle: string;
  date: string; // ISO string
  durationSeconds: number;
  totalTonnageKg: number;
  completedSetsCount: number;
  totalSetsCount: number;
  rpeRating: number; // 1-10
  notes: string;
  recordsAchieved?: string[];
  exercisesSnapshot: {
    name: string;
    sets: { weightKg: number; reps: number; completed: boolean }[];
  }[];
}

export interface PersonalRecord {
  exerciseName: string;
  maxWeightKg: number;
  repsAtMax: number;
  calculated1RM: number;
  achievedDate: string;
}
