'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WODOutput } from '@/lib/types';
import { shareWorkout, copyToClipboard, formatWorkoutForShare } from '@/lib/share';
import { useHaptic } from '../hooks/useHaptic';

interface ActionBarProps {
  wod: WODOutput;
  onBack: () => void;
}

export default function ActionBar({ wod, onBack }: ActionBarProps) {
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const haptic = useHaptic();

  const handleShare = async () => {
    haptic.medium();
    const success = await shareWorkout(wod);
    if (success) {
      haptic.success();
      setShowFeedback('Shared!');
      setTimeout(() => setShowFeedback(null), 2000);
    } else {
      // Fallback to copy if share fails
      const text = formatWorkoutForShare(wod);
      await copyToClipboard(text);
      setShowFeedback('Copied!');
      setTimeout(() => setShowFeedback(null), 2000);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex gap-2">
            <button
              onClick={() => {
                haptic.light();
                onBack();
              }}
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-3 px-4 rounded-lg hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50"
          >
            {showFeedback}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

