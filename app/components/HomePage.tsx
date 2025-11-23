'use client';

import { motion } from 'framer-motion';
import CoachInterface from './CoachInterface';
import LoadingState from './LoadingState';
import { WODInput } from '@/lib/types';

interface HomePageProps {
  onSubmit: (data: WODInput) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function HomePage({ onSubmit, isLoading, error }: HomePageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="min-h-screen flex items-center px-4 pt-6 pb-24 safe-area-inset-top"
    >
      <div className="w-full">
        {isLoading ? (
          <LoadingState />
        ) : (
          <>
            <CoachInterface onSubmit={onSubmit} isLoading={isLoading} />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-5 bg-red-50 border-2 border-red-200 rounded-xl"
              >
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

