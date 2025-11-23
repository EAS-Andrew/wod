'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { StoredWorkout } from '@/lib/storage';
import WorkoutCard from './WorkoutCard';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  workouts: StoredWorkout[];
  onSelect: (workout: StoredWorkout) => void;
  onDelete: (id: string) => void;
  onRegenerate?: (workout: StoredWorkout) => void;
  onVariation?: (workout: StoredWorkout, intensity: 'harder' | 'easier') => void;
}

export default function HistoryDrawer({
  isOpen,
  onClose,
  workouts,
  onSelect,
  onDelete,
  onRegenerate,
  onVariation,
}: HistoryDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-20 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 max-h-[75vh] overflow-hidden flex flex-col safe-area-inset-bottom"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 py-4 border-b-2 border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900">Recent Workouts</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-900 p-2"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {workouts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No workouts yet</p>
                  <p className="text-sm text-gray-400 mt-2">Generate your first workout to see it here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workouts.map((workout) => (
                    <div key={workout.id} className="relative">
                      <WorkoutCard
                        workout={workout}
                        onSelect={onSelect}
                        onDelete={onDelete}
                      />
                      {/* Quick Actions */}
                      <div className="mt-2 flex gap-2">
                        {onRegenerate && (
                          <button
                            onClick={() => onRegenerate(workout)}
                            className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                          >
                            Regenerate
                          </button>
                        )}
                        {onVariation && (
                          <>
                            <button
                              onClick={() => onVariation(workout, 'easier')}
                              className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                            >
                              Easier
                            </button>
                            <button
                              onClick={() => onVariation(workout, 'harder')}
                              className="flex-1 bg-gray-100 text-gray-900 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 text-sm transition-colors"
                            >
                              Harder
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

