import { WODOutput } from './types';

const STORAGE_KEY = 'wod-history';
const MAX_HISTORY = 50;

export interface StoredWorkout extends WODOutput {
  id: string;
  createdAt: string;
  isFavorite?: boolean;
}

export function saveWorkout(wod: WODOutput): StoredWorkout {
  const storedWorkout: StoredWorkout = {
    ...wod,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  const history = getWorkoutHistory();
  const updatedHistory = [storedWorkout, ...history].slice(0, MAX_HISTORY);
  
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  }

  return storedWorkout;
}

export function getWorkoutHistory(): StoredWorkout[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as StoredWorkout[];
  } catch (error) {
    console.error('Error reading workout history:', error);
    return [];
  }
}

export function deleteWorkout(id: string): void {
  if (typeof window === 'undefined') return;

  const history = getWorkoutHistory();
  const updatedHistory = history.filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
}

export function clearWorkoutHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function toggleFavorite(id: string): void {
  if (typeof window === 'undefined') return;

  const history = getWorkoutHistory();
  const updatedHistory = history.map((w) =>
    w.id === id ? { ...w, isFavorite: !w.isFavorite } : w
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
}

