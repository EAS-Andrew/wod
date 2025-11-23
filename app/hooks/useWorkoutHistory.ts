'use client';

import { useState, useEffect } from 'react';
import { getWorkoutHistory, saveWorkout, deleteWorkout, clearWorkoutHistory, toggleFavorite, StoredWorkout } from '@/lib/storage';
import { WODOutput } from '@/lib/types';

export function useWorkoutHistory() {
  const [history, setHistory] = useState<StoredWorkout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHistory(getWorkoutHistory());
    setIsLoading(false);
  }, []);

  const addWorkout = (wod: WODOutput) => {
    const stored = saveWorkout(wod);
    setHistory(getWorkoutHistory());
    return stored;
  };

  const removeWorkout = (id: string) => {
    deleteWorkout(id);
    setHistory(getWorkoutHistory());
  };

  const clearHistory = () => {
    clearWorkoutHistory();
    setHistory([]);
  };

  const favoriteWorkout = (id: string) => {
    toggleFavorite(id);
    setHistory(getWorkoutHistory());
  };

  return {
    history,
    isLoading,
    addWorkout,
    removeWorkout,
    clearHistory,
    favoriteWorkout,
  };
}

