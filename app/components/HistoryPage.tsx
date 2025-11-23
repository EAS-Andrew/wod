'use client';

import { motion } from 'framer-motion';
import { StoredWorkout } from '@/lib/storage';
import WorkoutCard from './WorkoutCard';
import { useHaptic } from '../hooks/useHaptic';

interface HistoryPageProps {
  workouts: StoredWorkout[];
  onSelect: (workout: StoredWorkout) => void;
  onDelete: (id: string) => void;
  onRegenerate?: (workout: StoredWorkout) => void;
  onVariation?: (workout: StoredWorkout, intensity: 'harder' | 'easier') => void;
  onBack: () => void;
}

export default function HistoryPage({
  workouts,
  onSelect,
  onDelete,
  onRegenerate,
  onVariation,
  onBack,
}: HistoryPageProps) {
  const haptic = useHaptic();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-screen bg-gray-50 pb-24"
    >
      {/* Header */}
      <div className="sticky top-0 bg-white border-b-2 border-gray-200 z-30 safe-area-inset-top">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900">History</h1>
          {workouts.length > 0 && (
            <span className="text-sm font-semibold text-gray-600">{workouts.length}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        {workouts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">No workouts yet</h2>
            <p className="text-gray-600">Generate your first workout to see it here</p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {workouts.map((workout, index) => (
              <motion.div
                key={workout.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <WorkoutCard
                  workout={workout}
                  onSelect={onSelect}
                  onDelete={onDelete}
                />
                {/* Quick Actions */}
                <div className="mt-2 flex gap-2">
                  {onRegenerate && (
                    <button
                      onClick={() => {
                        haptic.medium();
                        onRegenerate(workout);
                      }}
                      className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                    >
                      Regenerate
                    </button>
                  )}
                  {onVariation && (
                    <>
                      <button
                        onClick={() => {
                          haptic.medium();
                          onVariation(workout, 'easier');
                        }}
                        className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                      >
                        Easier
                      </button>
                      <button
                        onClick={() => {
                          haptic.medium();
                          onVariation(workout, 'harder');
                        }}
                        className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 px-3 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                      >
                        Harder
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

