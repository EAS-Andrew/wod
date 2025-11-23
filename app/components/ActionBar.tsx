'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WODOutput } from '@/lib/types';
import { shareWorkout, copyToClipboard, formatWorkoutForShare } from '@/lib/share';
import { useHaptic } from '../hooks/useHaptic';

interface ActionBarProps {
  wod: WODOutput;
  onTimer: () => void;
  onRegenerate?: () => void;
}

export default function ActionBar({ wod, onTimer, onRegenerate }: ActionBarProps) {
  const [showFeedback, setShowFeedback] = useState<string | null>(null);
  const haptic = useHaptic();

  const handleCopy = async () => {
    haptic.light();
    const text = formatWorkoutForShare(wod);
    const success = await copyToClipboard(text);
    if (success) {
      haptic.success();
      setShowFeedback('Copied!');
      setTimeout(() => setShowFeedback(null), 2000);
    }
  };

  const handleShare = async () => {
    haptic.medium();
    const success = await shareWorkout(wod);
    if (success) {
      haptic.success();
      setShowFeedback('Shared!');
      setTimeout(() => setShowFeedback(null), 2000);
    } else {
      // Fallback to copy if share fails
      handleCopy();
    }
  };

  const handleTimer = () => {
    haptic.medium();
    onTimer();
  };

  const handleRegenerate = () => {
    haptic.medium();
    onRegenerate?.();
  };

  return (
    <>
      <div className="fixed bottom-20 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-40 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex gap-2">
            {onRegenerate && (
              <button
                onClick={handleRegenerate}
                className="flex-1 bg-black text-white font-bold py-4 px-4 rounded-xl hover:bg-gray-800 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Regenerate</span>
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-4 px-4 rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>Share</span>
            </button>

            <button
              onClick={handleCopy}
              className="flex-1 bg-gray-100 text-gray-900 font-bold py-4 px-4 rounded-xl hover:bg-gray-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </button>

            <button
              onClick={handleTimer}
              className="flex-1 bg-red-600 text-white font-bold py-4 px-4 rounded-xl hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Timer</span>
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
            className="fixed bottom-32 left-1/2 transform -translate-x-1/2 bg-black text-white px-6 py-3 rounded-full shadow-lg z-50"
          >
            {showFeedback}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

