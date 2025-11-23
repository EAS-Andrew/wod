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
      className="h-screen flex items-center px-4 py-4 overflow-hidden safe-area-inset-top safe-area-inset-bottom"
    >
      <div className="w-full h-full flex flex-col items-center justify-center overflow-y-auto">
        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="w-full max-w-lg flex-shrink-0">
            <CoachInterface onSubmit={onSubmit} isLoading={isLoading} />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
              >
                <p className="text-sm font-semibold text-red-800">{error}</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

