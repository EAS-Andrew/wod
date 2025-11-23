'use client';

import { motion } from 'framer-motion';
import { StoredWorkout } from '@/lib/storage';
import { formatDistanceToNow } from 'date-fns';

interface WorkoutCardProps {
  workout: StoredWorkout;
  onSelect: (workout: StoredWorkout) => void;
  onDelete: (id: string) => void;
}

export default function WorkoutCard({ workout, onSelect, onDelete }: WorkoutCardProps) {
  const timeAgo = formatDistanceToNow(new Date(workout.createdAt), { addSuffix: true });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-500 transition-colors cursor-pointer"
      onClick={() => onSelect(workout)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-bold text-gray-900 flex-1">{workout.wod_title}</h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(workout.id);
          }}
          className="text-gray-400 hover:text-red-600 p-1"
          aria-label="Delete workout"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
        <span className="font-medium">{workout.format}</span>
        {workout.time_cap_minutes && (
          <>
            <span>•</span>
            <span>{workout.time_cap_minutes} min cap</span>
          </>
        )}
      </div>
      <div className="text-xs text-gray-500">{timeAgo}</div>
    </motion.div>
  );
}

