'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CoachInterface from './components/CoachInterface';
import FirstTimeSetup from './components/FirstTimeSetup';
import WODDisplay from './components/WODDisplay';
import LoadingState from './components/LoadingState';
import ActionBar from './components/ActionBar';
import WorkoutTimer from './components/WorkoutTimer';
import HistoryPage from './components/HistoryPage';
import SettingsPage from './components/SettingsPage';
import HomePage from './components/HomePage';
import SuccessAnimation from './components/SuccessAnimation';
import BottomNav from './components/BottomNav';
import { useWorkoutHistory } from './hooks/useWorkoutHistory';
import { useConfig } from './hooks/useConfig';
import { useOrientation } from './hooks/useOrientation';
import { WODInput, WODOutput } from '@/lib/types';
import { StoredWorkout } from '@/lib/storage';

type ViewMode = 'setup' | 'home' | 'workout' | 'history' | 'settings';

export default function Home() {
  const [wod, setWod] = useState<WODOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [savedWorkoutId, setSavedWorkoutId] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<WODInput | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { history, addWorkout, removeWorkout } = useWorkoutHistory();
  const { hasConfig, config } = useConfig();
  const isLandscape = useOrientation();

  // Detect first-time user
  useEffect(() => {
    if (!hasConfig) {
      setViewMode('setup');
    } else {
      setViewMode('home');
    }
  }, [hasConfig]);

  const generateWorkout = async (data: WODInput) => {
    setIsLoading(true);
    setError(null);
    setWod(null);
    setSavedWorkoutId(null);
    setLastInput(data);

    try {
      const response = await fetch('/api/generate-wod', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate WOD');
      }

      const wodData = await response.json();
      setWod(wodData);
      setViewMode('workout');
      
      // Auto-save to history
      const stored = addWorkout(wodData);
      setSavedWorkoutId(stored.id);
      
      // Show success animation
      setShowSuccess(true);
      
      // Scroll to workout
      setTimeout(() => {
        document.getElementById('workout-display')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = generateWorkout;

  const handleRegenerate = () => {
    if (lastInput) {
      generateWorkout(lastInput);
    } else if (wod) {
      // Regenerate based on current workout
      const input: WODInput = {
        goal: wod.wod_title + ' - similar workout',
        available_equipment: config.available_equipment || '',
        preferences: wod.notes || config.preferences || '',
        limitations: config.limitations || '',
        notes: config.notes || '',
      };
      generateWorkout(input);
    }
  };

  const handleVariation = (workout: StoredWorkout, intensity: 'harder' | 'easier') => {
    const modifier = intensity === 'harder' ? 'Make it more challenging and intense' : 'Make it easier and lighter';
    const input: WODInput = {
      goal: workout.wod_title + ` - ${intensity} version`,
      available_equipment: config.available_equipment || '',
      preferences: `${modifier}. ${config.preferences || ''}`,
      limitations: config.limitations || '',
      notes: config.notes || '',
    };
    generateWorkout(input);
  };

  const handleSelectHistory = (workout: StoredWorkout) => {
    setWod(workout);
    setSavedWorkoutId(workout.id);
    setViewMode('workout');
    setTimeout(() => {
      document.getElementById('workout-display')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRegenerateFromHistory = (workout: StoredWorkout) => {
    const input: WODInput = {
      goal: workout.wod_title + ' - regenerate',
      available_equipment: config.available_equipment || '',
      preferences: workout.notes || config.preferences || '',
      limitations: config.limitations || '',
      notes: config.notes || '',
    };
    generateWorkout(input);
    setViewMode('workout');
  };

  const handleNewWorkout = () => {
    setWod(null);
    setSavedWorkoutId(null);
    setViewMode('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSetupComplete = () => {
    setViewMode('home');
  };

  const handleShowHistory = () => {
    setViewMode('history');
  };

  const handleShowSettings = () => {
    setViewMode('settings');
  };

  const handleBackToHome = () => {
    setViewMode('home');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 safe-area-inset-bottom">
      <main className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {/* First-Time Setup */}
          {viewMode === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="min-h-screen flex items-center px-6 pt-8 pb-32 safe-area-inset-top"
            >
              <FirstTimeSetup onComplete={handleSetupComplete} />
            </motion.div>
          )}

          {/* Home Page */}
          {viewMode === 'home' && !wod && (
            <HomePage
              key="home"
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          )}

          {/* History Page */}
          {viewMode === 'history' && (
            <HistoryPage
              key="history"
              workouts={history}
              onSelect={handleSelectHistory}
              onDelete={removeWorkout}
              onRegenerate={handleRegenerateFromHistory}
              onVariation={handleVariation}
              onBack={handleBackToHome}
            />
          )}

          {/* Settings Page */}
          {viewMode === 'settings' && (
            <SettingsPage
              key="settings"
              onBack={handleBackToHome}
            />
          )}

          {/* Workout Display */}
          {wod && viewMode === 'workout' && (
            <motion.div
              key="workout"
              id="workout-display"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className={`h-screen px-4 pt-4 pb-4 safe-area-inset-top safe-area-inset-bottom overflow-hidden flex flex-col ${
                isLandscape ? 'pr-[50%]' : ''
              }`}
            >
              <div className="flex-1 overflow-y-auto">
                <WODDisplay wod={wod} />
              </div>
              <WorkoutTimer wod={wod} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation - Hidden in landscape mode */}
      {viewMode !== 'workout' && viewMode !== 'setup' && !isLandscape && (
        <BottomNav
          onShowHome={handleBackToHome}
          onShowHistory={handleShowHistory}
          onShowConfig={handleShowSettings}
          currentView={viewMode === 'home' ? 'home' : viewMode === 'history' ? 'history' : viewMode === 'settings' ? 'settings' : 'home'}
        />
      )}

      {/* Action Bar - Only when viewing workout, hidden in landscape */}
      {wod && viewMode === 'workout' && !isLandscape && (
        <ActionBar
          wod={wod}
          onBack={handleNewWorkout}
        />
      )}


      {/* Success Animation */}
      {showSuccess && (
        <SuccessAnimation onComplete={() => setShowSuccess(false)} />
      )}
    </div>
  );
}
