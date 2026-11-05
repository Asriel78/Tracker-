import { ProgramConfig, WorkoutSession } from '../types/workoutProgram';

export const COLORS = {
  bg: '#030712',
  card: '#0f172a',
  cardBorder: '#1e293b',
  text: '#f8fafc',
  steel: '#94a3b8',
  steelLight: '#64748b',
  line: '#1e293b',
  neonEmerald: '#10b981',
  neonCyan: '#06b6d4',
  neonViolet: '#8b5cf6',
  neonRose: '#f43f5e',
  neonAmber: '#f59e0b',
  // Backwards compatibility mappings
  paper: '#030712',
  ink: '#f8fafc',
  red: '#f43f5e',
  blue: '#06b6d4',
  yellow: '#f59e0b',
  green: '#10b981',
  grey: '#8b5cf6',
};

export const INITIAL_PROGRAM: ProgramConfig = {
  days: [
    {
      key: 'Пн',
      plate: '1',
      color: COLORS.neonEmerald,
      label: 'Ноги A (квадрицепс)',
      exercises: [
        { code: 'lp', name: 'Жим ногами', target: '4×8-10' },
        { code: 'ht', name: 'Тазовый мост (Hip Thrust, плечи на скамье)', target: '3×10-12' },
        { code: 'le', name: 'Разгибание ног', target: '3×12-15' },
        { code: 'lc', name: 'Сгибание ног', target: '3×10-12' },
        { code: 'cf', name: 'Подъём на носки в тренажёре', target: '4×15-20' },
        { code: 'cw', name: 'Прогулка с гирей в одной руке (корпус)', target: '3×20-30м' },
      ],
    },
    {
      key: 'Чт',
      plate: '2',
      color: COLORS.neonCyan,
      label: 'Верх смешанный (лёгкий) + кор',
      exercises: [
        { code: 'cp', name: 'Жим от груди сидя', target: '3×10-12' },
        { code: 'cr', name: 'Тяга гантелей лёжа грудью на наклонной скамье', target: '3×10-12' },
        { code: 'lr', name: 'Подъём гантелей в стороны (средняя дельта)', target: '3×12-15' },
        { code: 'bc', name: 'Бицепс', target: '2×10-12' },
        { code: 'tp', name: 'Трицепс в кроссовере (канат)', target: '2-3×10-15' },
        { code: 'pl', name: 'Планка', target: '3×30-60 сек' },
        { code: 'pp', name: 'Pallof Press в кроссовере (антиротация, стоя боком)', target: '3×10-12 на сторону' },
      ],
    },
    {
      key: 'Пт',
      plate: '3',
      color: COLORS.neonViolet,
      label: 'Ноги B (задняя цепь)',
      exercises: [
        { code: 'pt', name: 'Протяжка через кроссовер (Pull-Through, наклон в тазу)', target: '3×12-15' },
        { code: 'lp', name: 'Жим ногами', target: '3×10-12' },
        { code: 'lc', name: 'Сгибание ног', target: '3×12-15' },
        { code: 'cf', name: 'Подъём на носки в тренажёре', target: '3×15-20' },
        { code: 'ab', name: 'Отведение бедра', target: '2×15' },
        { code: 'ad', name: 'Приведение бедра', target: '2×15' },
      ],
    },
    {
      key: 'Сб',
      plate: '4',
      color: COLORS.neonRose,
      label: 'Грудь / Плечи',
      exercises: [
        { code: 'cp', name: 'Жим от груди сидя', target: '3×8-10' },
        { code: 'ic', name: 'Жим от груди на наклонной', target: '3×10-12' },
        { code: 'sp', name: 'Жим плечами', target: '3×8-12' },
        { code: 'pd', name: 'Сведение рук (Pec Deck)', target: '2×12-15' },
        { code: 'lr', name: 'Подъём гантелей в стороны (средняя дельта)', target: '3×12-15' },
      ],
    },
    {
      key: 'Вс',
      plate: '5',
      color: COLORS.neonAmber,
      label: 'Спина / Руки',
      exercises: [
        { code: 'ld', name: 'Тяга вертикальная (хват чуть шире плеч, валик над коленом)', target: '4×8-10' },
        { code: 'cr', name: 'Тяга гантелей лёжа грудью на наклонной скамье', target: '4×8-10' },
        { code: 'fp', name: 'Тяга к лицу (канат, локти на уровне плеч)', target: '3×15-20' },
        { code: 'bc', name: 'Бицепс', target: '3×10-12' },
      ],
    },
  ],
  warmup: {
    'Пн': {
      before: [
        '5 мин лёгкого кардио',
        'Махи ногами в стороны и вперёд-назад',
        '10-15 приседаний с собственным весом',
        '1-2 подхода тазового моста без веса',
        '2-3 разминочных подхода на жиме ногами с нарастающим весом',
      ],
      after: [
        'Растяжка квадрицепса',
        'Растяжка ягодиц',
        'Растяжка икр',
        'Лёгкая растяжка поясницы',
      ],
    },
    'Чт': {
      before: [
        '5 мин лёгкого кардио',
        'Вращения плечами и руками',
        'По одному лёгкому подходу на первом жиме и первой тяге',
      ],
      after: ['Растяжка груди, спины и плеч — коротко'],
    },
    'Пт': {
      before: [
        '5 мин лёгкого кардио',
        'Махи ногами',
        '10-15 протяжек с минимальным весом — отрабатывай наклон в тазу, не в пояснице',
        '1-2 разминочных подхода на жиме ногами',
      ],
      after: [
        'Растяжка задней поверхности бедра',
        'Растяжка ягодиц',
        'Растяжка икр',
        'Лёгкая растяжка поясницы',
      ],
    },
    'Сб': {
      before: [
        '5 мин лёгкого кардио',
        'Вращения руками и плечами',
        'Разминочный подход на жиме с лёгким весом',
      ],
      after: [
        'Растяжка груди в дверном проёме, 20-30 сек',
        'Растяжка передних дельт',
        'Лёгкая растяжка трицепса',
      ],
    },
    'Вс': {
      before: [
        '5 мин лёгкого кардио',
        'Вращения плечами',
        'Разминочный подход на вертикальной тяге с лёгким весом',
      ],
      after: ['Растяжка широчайших', 'Растяжка бицепса и предплечий'],
    },
  },
  cardio: {
    'Пн': { walk: 'Ходьба 45-60 мин (≈4-6 км)', row: 'Пропуск или 10-15 мин легко — ноги нагружены' },
    'Чт': { walk: 'Ходьба 45-60 мин (≈4-6 км)', row: 'Гребля 40-50 мин, умеренно (≈8-10 км)' },
    'Пт': { walk: 'Ходьба 45-60 мин (≈4-6 км)', row: 'Пропуск или 10-15 мин легко — ноги нагружены' },
    'Сб': { walk: 'Ходьба 45-60 мин (≈4-6 км)', row: 'Гребля 40-50 мин, умеренно (≈8-10 км)' },
    'Вс': { walk: 'Ходьба 45-60 мин (≈4-6 км)', row: 'Гребля 40-50 мин, умеренно (≈8-10 км)' },
  },
  legacyCodes: {
    ac: 'Скручивания (тренажёр)',
    db: 'Dead Bug',
    sr: 'Тяга горизонтальная сидя',
  },
};

export const SEED_SESSIONS: WorkoutSession[] = [
  {
    id: 'seed-1',
    date: '2026-09-15',
    day: 'Пн',
    exercises: [
      {
        code: 'lp',
        name: 'Жим ногами',
        sets: [
          { weight: 120, reps: 10 },
          { weight: 140, reps: 10 },
          { weight: 150, reps: 8 },
          { weight: 150, reps: 8 },
        ],
      },
      {
        code: 'ht',
        name: 'Тазовый мост (Hip Thrust, плечи на скамье)',
        sets: [
          { weight: 70, reps: 12 },
          { weight: 80, reps: 10 },
          { weight: 85, reps: 10 },
        ],
      },
      {
        code: 'le',
        name: 'Разгибание ног',
        sets: [
          { weight: 45, reps: 15 },
          { weight: 50, reps: 12 },
          { weight: 50, reps: 12 },
        ],
      },
    ],
  },
  {
    id: 'seed-2',
    date: '2026-09-22',
    day: 'Пн',
    exercises: [
      {
        code: 'lp',
        name: 'Жим ногами',
        sets: [
          { weight: 130, reps: 10 },
          { weight: 145, reps: 10 },
          { weight: 155, reps: 9 },
          { weight: 155, reps: 8 },
        ],
      },
      {
        code: 'ht',
        name: 'Тазовый мост (Hip Thrust, плечи на скамье)',
        sets: [
          { weight: 75, reps: 12 },
          { weight: 85, reps: 10 },
          { weight: 90, reps: 10 },
        ],
      },
      {
        code: 'le',
        name: 'Разгибание ног',
        sets: [
          { weight: 50, reps: 15 },
          { weight: 55, reps: 13 },
          { weight: 55, reps: 12 },
        ],
      },
    ],
  },
  {
    id: 'seed-3',
    date: '2026-09-29',
    day: 'Пн',
    exercises: [
      {
        code: 'lp',
        name: 'Жим ногами',
        sets: [
          { weight: 140, reps: 10 },
          { weight: 150, reps: 10 },
          { weight: 160, reps: 8 },
          { weight: 160, reps: 8 },
        ],
      },
      {
        code: 'ht',
        name: 'Тазовый мост (Hip Thrust, плечи на скамье)',
        sets: [
          { weight: 80, reps: 12 },
          { weight: 90, reps: 10 },
          { weight: 95, reps: 10 },
        ],
      },
      {
        code: 'le',
        name: 'Разгибание ног',
        sets: [
          { weight: 55, reps: 15 },
          { weight: 60, reps: 12 },
          { weight: 60, reps: 12 },
        ],
      },
    ],
  },
  {
    id: 'seed-4',
    date: '2026-10-01',
    day: 'Чт',
    exercises: [
      {
        code: 'cp',
        name: 'Жим от груди сидя',
        sets: [
          { weight: 50, reps: 12 },
          { weight: 55, reps: 10 },
          { weight: 60, reps: 10 },
        ],
      },
      {
        code: 'cr',
        name: 'Тяга гантелей лёжа грудью на наклонной скамье',
        sets: [
          { weight: 18, reps: 12 },
          { weight: 20, reps: 10 },
          { weight: 20, reps: 10 },
        ],
      },
    ],
  },
];
