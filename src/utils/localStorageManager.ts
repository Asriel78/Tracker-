import { ProgramConfig, WorkoutSession } from '../types/workoutProgram';
import { INITIAL_PROGRAM, SEED_SESSIONS } from '../data/initialProgram';

const STORAGE_KEYS = {
  SESSIONS: 'wt2-sessions',
  DRAFT: 'wt2-draft',
  PROGRAM: 'wt2-program-config',
};

async function getStoredValue(key: string): Promise<string | null> {
  // Try window.storage if provided by platform
  if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.get === 'function') {
    try {
      const res = await (window as any).storage.get(key, false);
      if (res && res.value) return res.value;
    } catch {
      // Fallback to localStorage
    }
  }

  // Fallback to standard browser localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
  return null;
}

async function setStoredValue(key: string, value: string): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).storage && typeof (window as any).storage.set === 'function') {
    try {
      await (window as any).storage.set(key, value, false);
    } catch {
      // Fallback
    }
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Ignore
    }
  }
}

export async function loadSessions(): Promise<WorkoutSession[]> {
  try {
    const raw = await getStoredValue(STORAGE_KEYS.SESSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading sessions', e);
  }
  return SEED_SESSIONS;
}

export async function saveSessions(sessions: WorkoutSession[]): Promise<void> {
  try {
    await setStoredValue(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Error saving sessions', e);
  }
}

export async function loadDraft(): Promise<any> {
  try {
    const raw = await getStoredValue(STORAGE_KEYS.DRAFT);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading draft', e);
  }
  return null;
}

export async function saveDraft(draft: any): Promise<void> {
  try {
    await setStoredValue(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
  } catch (e) {
    console.error('Error saving draft', e);
  }
}

export async function loadProgramConfig(): Promise<ProgramConfig> {
  try {
    const raw = await getStoredValue(STORAGE_KEYS.PROGRAM);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error loading program config', e);
  }
  return INITIAL_PROGRAM;
}

export async function saveProgramConfig(config: ProgramConfig): Promise<void> {
  try {
    await setStoredValue(STORAGE_KEYS.PROGRAM, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving program config', e);
  }
}
